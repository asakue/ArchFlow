import { 
  organizations, type Organization, type InsertOrganization,
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  artifacts, type Artifact, type InsertArtifact,
  activities, type Activity, type InsertActivity,
  standards, type Standard, type InsertStandard,
  compliance, type Compliance, type InsertCompliance
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Интерфейс для работы с хранилищем данных
export interface IStorage {
  // Сессии
  getSession(id: string): Promise<any>;
  setSession(id: string, data: any): Promise<void>;
  deleteSession(id: string): Promise<void>;

  // Организации
  createOrganization(data: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization | undefined>;
  listOrganizations(): Promise<Organization[]>;

  // Пользователи
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>; // Added updateUser
  listUsers(): Promise<User[]>;

  // Проекты и шаблоны
  getProject(id: number): Promise<Project | undefined>;
  getProjectByCode(code: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  listProjects(filters?: {type?: string; status?: string}): Promise<Project[]>;

  // Артефакты
  getArtifact(id: number): Promise<Artifact | undefined>;
  createArtifact(artifact: InsertArtifact): Promise<Artifact>;
  updateArtifact(id: number, data: Partial<InsertArtifact>): Promise<Artifact | undefined>;
  deleteArtifact(id: number): Promise<boolean>;
  listArtifacts(projectId?: number): Promise<Artifact[]>;
  getArtifactHistory(artifactId: number): Promise<any[]>;

  // Активности
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(limit?: number, filters?: {entityType?: string; entityId?: number}): Promise<Activity[]>;

  // Стандарты
  getStandard(id: number): Promise<Standard | undefined>;
  createStandard(standard: InsertStandard): Promise<Standard>;
  updateStandard(id: number, data: Partial<InsertStandard>): Promise<Standard | undefined>;
  deleteStandard(id: number): Promise<boolean>;
  listStandards(): Promise<Standard[]>;

  // Соответствие стандартам
  updateCompliance(data: InsertCompliance): Promise<Compliance>;
  getProjectCompliance(projectId: number): Promise<Compliance[]>;
  getComplianceByCategory(projectId: number): Promise<{ category: string; score: number }[]>;

  // Управление согласованием
  createApprover(data: {projectId: number; userId: number; role: string}): Promise<any>;
  removeApprover(projectId: number, userId: number): Promise<boolean>;
  listApprovers(projectId: number): Promise<any[]>;
  updateApprovalStatus(projectId: number, userId: number, status: string, comment?: string): Promise<any>;

  // Компоненты системы
  createComponent(data: {projectId: number; name: string; description?: string; type?: string}): Promise<any>;
  updateComponent(id: number, data: Partial<{name: string; description: string; type: string}>): Promise<any>;
  deleteComponent(id: number): Promise<boolean>;
  listComponents(projectId: number): Promise<any[]>;

  // Зависимости
  createDependency(data: {sourceId: number; targetId: number; type: string; description?: string}): Promise<any>;
  deleteDependency(id: number): Promise<boolean>;
  listDependencies(projectId?: number): Promise<any[]>;

  // Аналитика
  getDashboardStats(): Promise<any>;
  getProjectStatusStats(): Promise<any[]>;
  getProjectStatusStatsForPreviousPeriod(): Promise<any[]>;
  getActivityTimeline(months?: number): Promise<any[]>;
  getIssuesStats(months?: number): Promise<any[]>;
  getApprovalTimeStats(): Promise<{ currentAvgDays: number; prevAvgDays: number; hasData: boolean }>;
  getComponentReuseStats(): Promise<{ percentage: number; trend: number }>;
  getUserActiveProject(userId: number): Promise<{ id: number } | null>;
}

// Реализация хранилища в памяти
export class MemStorage implements IStorage {
  private sessions: Map<string, any>;
  private organizations: Map<number, Organization>;
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private artifacts: Map<number, Artifact>;
  private activities: Map<number, Activity>;
  private standards: Map<number, Standard>;
  private compliance: Map<number, Compliance>;

  // Дополнительные хранилища для новых функций
  private artifactHistory: Map<number, any[]>;
  private approvers: Map<number, any[]>;
  private components: Map<number, any>;
  private dependencies: Map<number, any>;

  private organizationId: number;
  private userId: number;
  private projectId: number;
  private artifactId: number;
  private activityId: number;
  private standardId: number;
  private complianceId: number;
  private componentId: number;
  private dependencyId: number;

  constructor() {
    this.sessions = new Map();
    this.organizations = new Map();
    this.users = new Map();
    this.projects = new Map();

    // Инициализируем демо-организацию
    this.organizations.set(1, {
      id: 1,
      name: "АрхитектГрупп",
      description: "Компания для архитектурных решений",
      createdBy: 1,
      createdAt: new Date(),
    });

    // Для создания хеша паролей мы используем функцию инициализации
    this.artifacts = new Map();
    this.activities = new Map();
    this.standards = new Map();
    this.compliance = new Map();

    // Инициализируем дополнительные хранилища
    this.artifactHistory = new Map();
    this.approvers = new Map();
    this.components = new Map();
    this.dependencies = new Map();

    this.organizationId = 1;
    this.userId = 1;
    this.projectId = 1;
    this.artifactId = 1;
    this.activityId = 1;
    this.standardId = 1;
    this.complianceId = 1;
    this.componentId = 1;
    this.dependencyId = 1;

    // Инициализируем с тестовыми данными
    // Запускаем асинхронную инициализацию, но не ждем её завершения в конструкторе
    setTimeout(() => {
      this.initializeData().catch(err => {
        console.error("Ошибка при инициализации данных:", err);
      });
    }, 0);
  }

  private async initializeData(): Promise<void> {
    try {
      // Создаем организацию
      const organization = await this.createOrganization({
        name: "Тестовая Организация",
        description: "Организация для целей тестирования"
      });

      // Не создаем пользователя здесь, так как он будет создан в server/index.ts
      // с правильно хешированным паролем
    } catch (error) {
      console.error("Ошибка при инициализации данных:", error);
    }
  }

  // Методы для организаций
  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const id = this.organizationId++;
    const now = new Date();
    const organization: Organization = { 
      ...data, 
      id, 
      createdAt: now,
      description: data.description || null,
      createdBy: data.createdBy || null
    };
    this.organizations.set(id, organization);
    return organization;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const organization = this.organizations.get(id);
    if (!organization) return undefined;

    const updatedOrganization: Organization = {
      ...organization,
      ...data
    };

    this.organizations.set(id, updatedOrganization);
    return updatedOrganization;
  }

  async listOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  // Методы для работы с пользователями
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now,
      avatar: userData.avatar || null,
      role: userData.role || "user",
      organizationId: userData.organizationId || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    // Обновляем только те поля, которые переданы
    const updatedUser = {
      ...user,
      ...userData,
      // Обновляем дату последнего изменения
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);

    // Создаем активность для обновления профиля
    await this.createActivity({
      userId: id,
      action: "update",
      entityType: "user",
      entityId: id,
      details: { 
        updatedFields: Object.keys(userData),
        message: "Обновлен профиль пользователя" 
      },
    });

    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Методы для работы с проектами
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectByCode(code: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(
      (project) => project.code === code,
    );
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const now = new Date();
    const project: Project = { 
      ...projectData, 
      id, 
      updatedAt: now, 
      createdAt: now,
      description: projectData.description || null,
      responsibleUserId: projectData.responsibleUserId || null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...data,
      updatedAt: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async listProjects(filters?: {type?: string; status?: string}): Promise<Project[]> {
    let projects = Array.from(this.projects.values());

    if (filters) {
      if (filters.type) {
        projects = projects.filter(p => p.type === filters.type);
      }
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
    }

    // Сортируем по дате обновления (свежие сверху)
    return projects.sort((a, b) => 
      (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
    );
  }

  // Методы для работы с артефактами
  async getArtifact(id: number): Promise<Artifact | undefined> {
    return this.artifacts.get(id);
  }

  async createArtifact(artifactData: InsertArtifact): Promise<Artifact> {
    const id = this.artifactId++;
    const now = new Date();
    const artifact: Artifact = { 
      ...artifactData, 
      id, 
      updatedAt: now, 
      createdAt: now,
      projectId: artifactData.projectId || null,
      description: artifactData.description || null,
      content: artifactData.content || null,
      userId: artifactData.userId || null
    };
    this.artifacts.set(id, artifact);

    // Сохраняем запись в истории артефакта
    const historyRecord = {
      version: artifact.version,
      content: artifact.content,
      date: now,
      userId: artifact.userId,
      action: "create"
    };

    const history = this.artifactHistory.get(id) || [];
    history.push(historyRecord);
    this.artifactHistory.set(id, history);

    return artifact;
  }

  async updateArtifact(id: number, data: Partial<InsertArtifact>): Promise<Artifact | undefined> {
    const artifact = this.artifacts.get(id);
    if (!artifact) return undefined;

    const updatedArtifact: Artifact = {
      ...artifact,
      ...data,
      updatedAt: new Date(),
    };

    // Если контент изменился, сохраняем запись в истории артефакта
    if (data.content && data.content !== artifact.content) {
      const historyRecord = {
        version: updatedArtifact.version,
        content: artifact.content, // Сохраняем предыдущую версию
        date: new Date(),
        userId: updatedArtifact.userId,
        action: "update"
      };

      const history = this.artifactHistory.get(id) || [];
      history.push(historyRecord);
      this.artifactHistory.set(id, history);
    }

    this.artifacts.set(id, updatedArtifact);
    return updatedArtifact;
  }

  async deleteArtifact(id: number): Promise<boolean> {
    // Записываем удаление в историю
    const artifact = this.artifacts.get(id);
    if (artifact) {
      const historyRecord = {
        version: artifact.version,
        content: null,
        date: new Date(),
        userId: artifact.userId,
        action: "delete"
      };

      const history = this.artifactHistory.get(id) || [];
      history.push(historyRecord);
      this.artifactHistory.set(id, history);
    }

    return this.artifacts.delete(id);
  }

  async getArtifactHistory(artifactId: number): Promise<any[]> {
    return this.artifactHistory.get(artifactId) || [];
  }

  async listArtifacts(projectId?: number): Promise<Artifact[]> {
    let artifacts = Array.from(this.artifacts.values());

    if (projectId) {
      artifacts = artifacts.filter(a => a.projectId === projectId);
    }

    // Сортируем по дате обновления (свежие сверху)
    return artifacts.sort((a, b) => 
      (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0)
    );
  }

  // Методы для работы с активностями
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: Activity = { 
      ...activityData, 
      id, 
      createdAt: now,
      details: activityData.details || {},
      userId: activityData.userId || null
    };
    this.activities.set(id, activity);
    return activity;
  }

  async listActivities(limit?: number, filters?: {entityType?: string; entityId?: number}): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());

    // Применяем фильтры, если они указаны
    if (filters) {
      if (filters.entityType) {
        activities = activities.filter(a => a.entityType === filters.entityType);
      }
      if (filters.entityId !== undefined) {
        activities = activities.filter(a => a.entityId === filters.entityId);
      }
    }

    // Сортируем по дате создания (свежие сверху)
    activities = activities.sort((a, b) => 
      (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    );

    if (limit && limit > 0) {
      activities = activities.slice(0, limit);
    }

    return activities;
  }

  // Методы для работы со стандартами
  async getStandard(id: number): Promise<Standard | undefined> {
    return this.standards.get(id);
  }

  async createStandard(standardData: InsertStandard): Promise<Standard> {
    const id = this.standardId++;
    const now = new Date();
    const standard: Standard = { 
      ...standardData, 
      id, 
      createdAt: now,
      description: standardData.description || null,
      criteria: standardData.criteria || {}
    };
    this.standards.set(id, standard);
    return standard;
  }

  async updateStandard(id: number, data: Partial<InsertStandard>): Promise<Standard | undefined> {
    const standard = this.standards.get(id);
    if (!standard) return undefined;

    const updatedStandard: Standard = {
      ...standard,
      ...data,
    };

    this.standards.set(id, updatedStandard);
    return updatedStandard;
  }

  async deleteStandard(id: number): Promise<boolean> {
    return this.standards.delete(id);
  }

  async listStandards(): Promise<Standard[]> {
    return Array.from(this.standards.values());
  }

  // Методы для работы с соответствием стандартам
  async updateCompliance(data: InsertCompliance): Promise<Compliance> {
    // Проверяем, существует ли уже запись о соответствии
    const existingCompliance = Array.from(this.compliance.values())
      .find(comp => comp.projectId === data.projectId && comp.standardId === data.standardId);

    if (existingCompliance) {
      const updatedCompliance: Compliance = {
        ...existingCompliance,
        score: data.score,
        details: data.details,
        updatedAt: new Date(),
      };
      this.compliance.set(existingCompliance.id, updatedCompliance);
      return updatedCompliance;
    } else {
      const id = this.complianceId++;
      const now = new Date();
      const compliance: Compliance = { 
        ...data, 
        id, 
        updatedAt: now,
        projectId: data.projectId || null,
        standardId: data.standardId || null,
        details: data.details || {}
      };
      this.compliance.set(id, compliance);
      return compliance;
    }
  }

  async getProjectCompliance(projectId: number): Promise<Compliance[]> {
    return Array.from(this.compliance.values())
      .filter(c => c.projectId === projectId);
  }

  async getComplianceByCategory(projectId: number): Promise<{ category: string; score: number }[]> {
    const complianceRecords = await this.getProjectCompliance(projectId);
    const standards = await this.listStandards();

    // Группируем соответствие по категориям
    const categoriesMap: Record<string, { totalScore: number; count: number }> = {};

    for (const compliance of complianceRecords) {
      const standard = standards.find(s => s.id === compliance.standardId);
      if (standard) {
        const category = standard.category;
        if (!categoriesMap[category]) {
          categoriesMap[category] = { totalScore: 0, count: 0 };
        }
        categoriesMap[category].totalScore += compliance.score;
        categoriesMap[category].count += 1;
      }
    }

    // Вычисляем средний балл по каждой категории
    const result: { category: string; score: number }[] = Object.entries(categoriesMap).map(
      ([category, data]) => ({
        category,
        score: Math.round(data.totalScore / data.count)
      })
    );

    // Добавляем общий средний балл
    if (result.length > 0) {
      let totalScore = 0;
      let totalCount = 0;

      Object.values(categoriesMap).forEach(data => {
        totalScore += data.totalScore;
        totalCount += data.count;
      });

      const avgScore = Math.round(totalScore / totalCount);
      result.unshift({ category: "overall", score: avgScore });
    }

    return result;
  }

  // Методы для управления согласованием
  async createApprover(data: {projectId: number; userId: number; role: string}): Promise<any> {
    const project = await this.getProject(data.projectId);
    const user = await this.getUser(data.userId);

    if (!project || !user) {
      throw new Error("Проект или пользователь не найден");
    }

    const approverRecord = {
      id: Date.now(), // Используем временную метку как идентификатор
      projectId: data.projectId,
      userId: data.userId,
      role: data.role,
      status: "pending",
      comment: null,
      createdAt: new Date()
    };

    const approvers = this.approvers.get(data.projectId) || [];

    // Проверяем, существует ли уже такой согласующий
    const existingIndex = approvers.findIndex(a => a.userId === data.userId);
    if (existingIndex >= 0) {
      approvers[existingIndex] = approverRecord;
    } else {
      approvers.push(approverRecord);
    }

    this.approvers.set(data.projectId, approvers);

    // Создаем запись в активностях
    this.createActivity({
      userId: data.userId,
      action: "assign",
      entityType: "project",
      entityId: data.projectId,
      details: { role: data.role }
    });

    return approverRecord;
  }

  async removeApprover(projectId: number, userId: number): Promise<boolean> {
    const approvers = this.approvers.get(projectId) || [];
    const filteredApprovers = approvers.filter(a => a.userId !== userId);

    if (filteredApprovers.length === approvers.length) {
      return false; // Ничего не изменилось
    }

    this.approvers.set(projectId, filteredApprovers);

    // Создаем запись в активностях
    this.createActivity({
      userId: 0, // Системное действие
      action: "unassign",
      entityType: "project",
      entityId: projectId,
      details: { userId }
    });

    return true;
  }

  async listApprovers(projectId: number): Promise<any[]> {
    return this.approvers.get(projectId) || [];
  }

  async updateApprovalStatus(projectId: number, userId: number, status: string, comment?: string): Promise<any> {
    const approvers = this.approvers.get(projectId) || [];
    const approverIndex = approvers.findIndex(a => a.userId === userId);

    if (approverIndex < 0) {
      throw new Error("Согласующий не найден");
    }

    const updated = {
      ...approvers[approverIndex],
      status,
      comment: comment || null,
      updatedAt: new Date()
    };

    approvers[approverIndex] = updated;
    this.approvers.set(projectId, approvers);

    // Создаем запись в активностях
    this.createActivity({
      userId,
      action: status === "approved" ? "approve" : "reject",
      entityType: "project",
      entityId: projectId,
      details: { comment }
    });

    // Обновляем статус проекта, если все согласующие одобрили
    const project = await this.getProject(projectId);
    if (project) {
      const allApprovers = this.approvers.get(projectId) || [];
      const allApproved = allApprovers.length > 0 && allApprovers.every(a => a.status === "approved");

      if (allApproved && project.status === "review") {
        this.updateProject(projectId, { status: "approved" });

        // Создаем запись в активностях о утверждении проекта
        this.createActivity({
          userId: 0, // Системное действие
          action: "status_change",
          entityType: "project",
          entityId: projectId,
          details: { oldStatus: "review", newStatus: "approved" }
        });
      }
    }

    return updated;
  }

  // Методы для компонентов системы
  async createComponent(data: {projectId: number; name: string; description?: string; type?: string}): Promise<any> {
    const id = this.componentId++;
    const component = {
      id,
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      type: data.type || "component",
      createdAt: new Date()
    };

    this.components.set(id, component);

    // Создаем запись в активностях
    this.createActivity({
      userId: 0, // Можно заменить на параметр
      action: "create",
      entityType: "component",
      entityId: id,
      details: { projectId: data.projectId }
    });

    return component;
  }

  async updateComponent(id: number, data: Partial<{name: string; description: string; type: string}>): Promise<any> {
    const component = this.components.get(id);
    if (!component) {
      throw new Error("Компонент не найден");
    }

    const updated = {
      ...component,
      ...data,
      updatedAt: new Date()
    };

    this.components.set(id, updated);

    // Создаем запись в активностях
    this.createActivity({
      userId: 0, // Можно заменить на параметр
      action: "update",
      entityType: "component",
      entityId: id,
      details: {}
    });

    return updated;
  }

  async deleteComponent(id: number): Promise<boolean> {
    const component = this.components.get(id);
    if (!component) {
      return false;
    }

    this.components.delete(id);

    // Удаляем все зависимости, связанные с этим компонентом
    const allDependencies = Array.from(this.dependencies.entries());
    for (const [depId, dependency] of allDependencies) {
      if (dependency.sourceId === id || dependency.targetId === id) {
        this.dependencies.delete(depId);
      }
    }

    // Создаем запись в активностях
    this.createActivity({
      userId: 0, // Можно заменить на параметр
      action: "delete",
      entityType: "component",
      entityId: id,
      details: { projectId: component.projectId }
    });

    return true;
  }

  async listComponents(projectId: number): Promise<any[]> {
    return Array.from(this.components.values())
      .filter(c => c.projectId === projectId);
  }

  // Методы для зависимостей
  async createDependency(data: {sourceId: number; targetId: number; type: string; description?: string}): Promise<any> {
    const id = this.dependencyId++;
    const dependency = {
      id,
      sourceId: data.sourceId,
      targetId: data.targetId,
      type: data.type,
      description: data.description || "",
      createdAt: new Date()
    };

    this.dependencies.set(id, dependency);

    return dependency;
  }

  async deleteDependency(id: number): Promise<boolean> {
    return this.dependencies.delete(id);
  }

  // Хранение исторических данных статистики
  private historicalStats: Map<string, any> = new Map();

  // Метод для получения исторических данных по дате
  getHistoricalStats(date: Date): any {
    const dateKey = date.toISOString().split('T')[0];
    return this.historicalStats.get(dateKey);
  }

  // Метод для сохранения исторических данных
  saveHistoricalStats(date: Date, data: any): void {
    const dateKey = date.toISOString().split('T')[0];
    this.historicalStats.set(dateKey, data);
  }

  async listDependencies(projectId?: number): Promise<any[]> {
    let dependencies = Array.from(this.dependencies.values());

    if (projectId) {
      const components = await this.listComponents(projectId);
      const componentIds = components.map(c => c.id);

      dependencies = dependencies.filter(d => 
        componentIds.includes(d.sourceId) || componentIds.includes(d.targetId)
      );
    }

    return dependencies;
  }

  // Методы для аналитики
  async getDashboardStats(): Promise<any> {
    const projects = Array.from(this.projects.values());
    const templates = projects.filter(p => p.type === "template").length;
    const activeProjects = projects.filter(p => p.type === "project" && p.status === "active").length;
    const pendingApproval = projects.filter(p => p.status === "review").length;
    const artifacts = Array.from(this.artifacts.values()).length;

    return {
      activeProjects,
      pendingApproval,
      templates,
      artifacts
    };
  }

  async getProjectStatusStats(): Promise<any[]> {
    const projects = Array.from(this.projects.values());
    const statusMap: Record<string, number> = {};

    for (const project of projects) {
      if (project.type === "project") {
        statusMap[project.status] = (statusMap[project.status] || 0) + 1;
      }
    }

    return Object.entries(statusMap).map(([status, count]) => ({ status, count }));
  }

  async getActivityTimeline(months: number = 6): Promise<any[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - months);

    const activities = Array.from(this.activities.values());

    // Группируем по месяцам
    const monthMap: Record<string, number> = {};
    for (let i = 0; i <= months; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap[monthKey] = 0;
    }

    for (const activity of activities) {
      const date = activity.createdAt ? new Date(activity.createdAt) : new Date();
      if (date >= startDate) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
    }

    return Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // Методы для работы с сессиями
  async getSession(id: string): Promise<any> {
    return this.sessions.get(id);
  }

  async setSession(id: string, data: any): Promise<void> {
    this.sessions.set(id, data);
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async getIssuesStats(months: number = 6): Promise<any[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - months);

    const activities = Array.from(this.activities.values()).filter(
      a => a.action === "warning" && a.createdAt && new Date(a.createdAt) >= startDate
    );

    // Группируем по типам проблем и месяцам
    const issuesByMonth: Record<string, Record<string, number>> = {};

    for (const activity of activities) {
      const date = activity.createdAt ? new Date(activity.createdAt) : new Date();
      const monthKey = this.getMonthName(date.getMonth());

      if (!issuesByMonth[monthKey]) {
        issuesByMonth[monthKey] = {
          критические: 0,
          высокие: 0,
          средние: 0,
          низкие: 0        };
      }

      const severity = (activity.details as any)?.severity || 'низкие';
      issuesByMonth[monthKey][severity]++;
    }

    // Преобразуем в формат для графика
    return Object.entries(issuesByMonth)
      .map(([month, issues]) => ({
        месяц: month,
        критические: issues.критические || 0,
        высокие: issues.высокие || 0,
        средние: issues.средние || 0,
        низкие: issues.низкие || 0
      }))
      .sort((a, b) => this.monthNameToNumber(a.месяц) - this.monthNameToNumber(b.месяц));
  }

  private getMonthName(monthIndex: number): string {
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return monthNames[monthIndex];
  }

  private monthNameToNumber(monthName: string): number {
    const monthMap: Record<string, number> = {
      'Янв': 0, 'Фев': 1, 'Мар': 2, 'Апр': 3, 'Май': 4, 'Июн': 5,
      'Июл': 6, 'Авг': 7, 'Сен': 8, 'Окт': 9, 'Ноя': 10, 'Дек': 11
    };
    return monthMap[monthName] || 0;
  }

  async getProjectStatusStatsForPreviousPeriod(): Promise<any[]> {
    // В реальной системе здесь должен быть запрос к истории изменений
    // Для простоты эмулируем предыдущий период с меньшим количеством проектов
    const currentStats = await this.getProjectStatusStats();

    return currentStats.map(stat => ({
      ...stat,
      count: Math.max(0, stat.count - Math.floor(Math.random() * 3 + 1))
    }));
  }

  async getApprovalTimeStats(): Promise<{ currentAvgDays: number; prevAvgDays: number; hasData: boolean }> {
    // Проверяем, есть ли проекты со статусом 'approved'
    const approvedProjects = Array.from(this.projects.values())
      .filter(p => p.status === 'approved');

    if (approvedProjects.length === 0) {
      // Если нет утверждённых проектов, возвращаем признак отсутствия данных
      return {
        currentAvgDays: 0,
        prevAvgDays: 0,
        hasData: false
      };
    }

    // В реальном приложении здесь будет запрос к базе данных
    // Если есть данные, возвращаем тестовые значения
    return {
      currentAvgDays: 4.5,
      prevAvgDays: 5.7,
      hasData: true
    };
  }

  async getComponentReuseStats(): Promise<{ percentage: number; trend: number }> {
    // В реальной системе рассчитываем из количества повторно используемых компонентов
    const percentage = 68;
    const trend = 5;

    return { percentage, trend };
  }

  async getUserActiveProject(userId: number): Promise<{ id: number } | null> {
    // Получаем последний проект, над которым работал пользователь
    const userActivities = Array.from(this.activities.values())
      .filter(a => a.userId === userId && a.entityType === 'project')
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));

    if (userActivities.length > 0) {
      const projectId = userActivities[0].entityId;
      return { id: projectId };
    }

    return null;
  }
}

export const storage = new MemStorage();