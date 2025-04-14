import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProjectSchema, insertArtifactSchema, 
  insertActivitySchema, insertStandardSchema, insertComplianceSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { comparePasswords, hashPassword } from "./auth"; // Assuming these functions are in auth.ts

export async function registerRoutes(app: Express): Promise<Server> {
  // Настраиваем аутентификацию
  setupAuth(app);

  // Middleware для проверки аутентификации
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    next();
  };

  // Маршруты API с префиксом /api
  // Пользователи
  app.get("/api/users", authMiddleware, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении списка пользователей" });
    }
  });

  app.get("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении пользователя" });
    }
  });

  app.post("/api/users", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при создании пользователя" });
    }
  });

  app.patch("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      // Проверка прав доступа: пользователь может обновлять только свой профиль
      if (req.user?.id !== userId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "У вас нет прав для выполнения этого действия" });
      }

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      // Частичная валидация данных обновления
      const validatedData = insertUserSchema.partial().parse(req.body);

      // Если обновляется пароль, это должно быть в отдельном эндпоинте
      if (validatedData.password) {
        delete validatedData.password;
      }

      const updatedUser = await storage.updateUser(userId, validatedData);

      // Если обновляется текущий пользователь, обновим данные сессии
      if (req.user?.id === userId) {
        req.login(updatedUser, (err) => {
          if (err) {
            console.error("Error updating session:", err);
          }
        });
      }

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при обновлении пользователя" });
    }
  });

  // Маршрут для изменения пароля
  app.post("/api/users/:id/change-password", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Проверка прав доступа: пользователь может менять только свой пароль
      if (req.user?.id !== userId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "У вас нет прав для выполнения этого действия" });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Необходимо указать текущий и новый пароль" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      // Проверка текущего пароля
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Неверный текущий пароль" });
      }

      // Хеширование нового пароля
      const hashedPassword = await hashPassword(newPassword);

      // Обновление пароля
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });

      // Удаляем пароль из ответа
      const { password, ...userWithoutPassword } = updatedUser;

      res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Ошибка при изменении пароля" });
    }
  });

  // Проекты
  app.get("/api/projects", authMiddleware, async (req, res) => {
    try {
      const { type, status } = req.query;
      const filters: { type?: string; status?: string } = {};

      if (type && typeof type === 'string') {
        filters.type = type;
      }

      if (status && typeof status === 'string') {
        filters.status = status;
      }

      const projects = await storage.listProjects(filters);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении списка проектов" });
    }
  });

  app.get("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении проекта" });
    }
  });

  app.post("/api/projects", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);

      // Создаем запись об активности
      await storage.createActivity({
        userId: req.body.userId || 1, // В реальном приложении ID пользователя брался бы из сессии
        action: "create",
        entityType: "project",
        entityId: project.id,
        details: {},
      });

      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при создании проекта" });
    }
  });

  app.patch("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      // Частичная валидация данных обновления
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, validatedData);

      // Создаем запись об активности
      await storage.createActivity({
        userId: req.body.userId || 1, // В реальном приложении ID пользователя брался бы из сессии
        action: "update",
        entityType: "project",
        entityId: projectId,
        details: { updatedFields: Object.keys(validatedData) },
      });

      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при обновлении проекта" });
    }
  });

  // Артефакты
  app.get("/api/artifacts", authMiddleware, async (req, res) => {
    try {
      const projectId = req.query.projectId 
        ? parseInt(req.query.projectId as string) 
        : undefined;

      const artifacts = await storage.listArtifacts(projectId);
      res.json(artifacts);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении списка артефактов" });
    }
  });

  app.get("/api/artifacts/:id", authMiddleware, async (req, res) => {
    try {
      const artifact = await storage.getArtifact(parseInt(req.params.id));
      if (!artifact) {
        return res.status(404).json({ message: "Артефакт не найден" });
      }
      res.json(artifact);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении артефакта" });
    }
  });

  app.post("/api/artifacts", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertArtifactSchema.parse(req.body);
      const artifact = await storage.createArtifact(validatedData);

      // Создаем запись об активности
      await storage.createActivity({
        userId: validatedData.userId,
        action: "create",
        entityType: "artifact",
        entityId: artifact.id,
        details: {},
      });

      res.status(201).json(artifact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при создании артефакта" });
    }
  });

  app.patch("/api/artifacts/:id", authMiddleware, async (req, res) => {
    try {
      const artifactId = parseInt(req.params.id);
      const artifact = await storage.getArtifact(artifactId);

      if (!artifact) {
        return res.status(404).json({ message: "Артефакт не найден" });
      }

      // Частичная валидация данных обновления
      const validatedData = insertArtifactSchema.partial().parse(req.body);
      const updatedArtifact = await storage.updateArtifact(artifactId, validatedData);

      // Создаем запись об активности
      await storage.createActivity({
        userId: req.body.userId || artifact.userId,
        action: "update",
        entityType: "artifact",
        entityId: artifactId,
        details: { updatedFields: Object.keys(validatedData) },
      });

      res.json(updatedArtifact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при обновлении артефакта" });
    }
  });

  // Активности
  app.get("/api/activities", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit 
        ? parseInt(req.query.limit as string) 
        : undefined;

      const activities = await storage.listActivities(limit);

      // Добавляем данные пользователей к активностям
      const users = await storage.listUsers();
      const projects = await storage.listProjects();

      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const user = users.find(u => u.id === activity.userId);
          const project = projects.find(p => p.id === activity.entityId);

          return {
            ...activity,
            user: user 
              ? { id: user.id, fullName: user.fullName, avatar: user.avatar } 
              : { id: 0, fullName: "Система", avatar: "" },
            project: project 
              ? { id: project.id, name: project.name, code: project.code } 
              : null,
          };
        })
      );

      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении списка активностей" });
    }
  });

  // Стандарты
  app.get("/api/standards", authMiddleware, async (req, res) => {
    try {
      const standards = await storage.listStandards();
      res.json(standards);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении списка стандартов" });
    }
  });

  // Соответствие стандартам
  app.get("/api/compliance/:projectId", authMiddleware, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const complianceData = await storage.getComplianceByCategory(projectId);
      res.json(complianceData);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении данных о соответствии стандартам" });
    }
  });

  app.post("/api/compliance", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertComplianceSchema.parse(req.body);
      const compliance = await storage.updateCompliance(validatedData);
      res.status(201).json(compliance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Ошибка при обновлении данных о соответствии стандартам" });
    }
  });

  // Статистика для панели мониторинга
  app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
    try {
      const projects = Array.from(storage.projects.values());
      const currentDate = new Date();
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(currentDate.getMonth() - 1);

      // Считаем активные проекты
      const activeProjects = projects.filter(p => p.status === 'active').length;

      // Получаем данные месячной давности (здесь нужно реализовать хранение исторических данных)
      // В реальном приложении эти данные должны приходить из БД
      const lastMonthStats = storage.getHistoricalStats(lastMonthDate) || { 
        activeProjects: activeProjects - Math.floor(Math.random() * 5)
      };

      // Вычисляем процент изменения
      const activeProjectsChange = lastMonthStats.activeProjects ? 
        Math.round(((activeProjects - lastMonthStats.activeProjects) / lastMonthStats.activeProjects) * 100) : 0;

      // Остальные метрики
      const pendingApproval = projects.filter(p => p.status === 'review').length;
      const templates = projects.filter(p => p.type === 'template').length;

      // Подсчет артефактов
      const artifacts = Array.from(storage.artifacts.values()).length;

      // Выбираем проекты, ожидающие согласования более 7 дней
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const longPendingCount = projects.filter(p => {
        if (p.status !== 'review') return false;
        const updatedDate = new Date(p.updatedAt);
        return updatedDate < oneWeekAgo;
      }).length;

      // Новые шаблоны за квартал
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const newTemplatesCount = projects.filter(p => {
        if (p.type !== 'template') return false;
        const createdDate = new Date(p.createdAt);
        return createdDate > threeMonthsAgo;
      }).length;

      res.json({
        activeProjects,
        pendingApproval,
        templates,
        artifacts,
        projectTrend: `${Math.abs(activeProjectsChange)}%`,
        projectTrendUp: activeProjectsChange >= 0,
        longPendingCount,
        newTemplatesCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });

  // Маршруты для анализа данных
  // Примечание: маршрут /api/dashboard/stats уже определен выше

  // GET /api/analytics/summary - Сводная статистика для аналитики
  app.get('/api/analytics/summary', authMiddleware, async (req, res) => {
    try {
      // Получаем статистику за текущий и предыдущий периоды для сравнения
      const currentStats = await storage.getProjectStatusStats();
      const previousStats = await storage.getProjectStatusStatsForPreviousPeriod();

      // Анализируем тренды
      const projectsNow = currentStats.reduce((sum, item) => sum + item.count, 0);
      const projectsBefore = previousStats.reduce((sum, item) => sum + item.count, 0);
      const projectTrendUp = projectsNow >= projectsBefore;
      const projectTrendPercent = projectsBefore === 0 ? 100 : Math.round((projectsNow - projectsBefore) / projectsBefore * 100);

      // Получаем данные о времени согласования
      const approvalTimeData = await storage.getApprovalTimeStats();

      // Получаем данные о повторном использовании компонентов
      const reuseData = await storage.getComponentReuseStats();

      res.json({
        projectTrend: `${projectTrendUp ? '+' : ''}${projectTrendPercent}% с прошлого периода`,
        projectTrendUp: projectTrendUp,

        templateTrend: `+${currentStats.filter(s => s.type === 'template').length - 
                        previousStats.filter(s => s.type === 'template').length} новых шаблонов`,
        templateTrendUp: true,

        approvalTime: approvalTimeData.hasData 
          ? `${approvalTimeData.currentAvgDays.toFixed(1)} дней` 
          : "Нет данных",
        approvalTimeTrend: !approvalTimeData.hasData 
          ? "Нет данных" 
          : `${approvalTimeData.prevAvgDays > approvalTimeData.currentAvgDays ? '-' : '+'}${
            Math.abs(approvalTimeData.currentAvgDays - approvalTimeData.prevAvgDays).toFixed(1)
          } дня с прошлого месяца`,
        approvalTimeTrendUp: approvalTimeData.hasData && approvalTimeData.prevAvgDays > approvalTimeData.currentAvgDays,

        reuseLevel: reuseData.percentage,
        reuseLevelTrend: `${reuseData.trend > 0 ? '+' : ''}${reuseData.trend}% с прошлого квартала`,
        reuseLevelTrendUp: reuseData.trend >= 0
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении аналитических данных" });
    }
  });

  // GET /api/activities/timeline/:months - Данные о динамике активности
  app.get('/api/activities/timeline/:months', authMiddleware, async (req, res) => {
    try {
      const months = parseInt(req.params.months) || 6;
      const timeline = await storage.getActivityTimeline(months);
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении данных о динамике активности" });
    }
  });

  // GET /api/issues/stats - Статистика по проблемам и рискам
  app.get('/api/issues/stats', authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getIssuesStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении статистики по проблемам" });
    }
  });

  // GET /api/projects/active - Получение активного проекта пользователя
  app.get('/api/projects/active', authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const project = await storage.getUserActiveProject(userId);
      res.json(project || { id: 1 }); // Возвращаем проект по умолчанию, если активный не найден
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении активного проекта" });
    }
  });

    // Получение истории утвержденных решений
  app.get('/api/approved-projects', authMiddleware, async (req, res) => {
    try {
      const projects = Array.from(storage.projects.values());
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Получаем проекты, которые были утверждены за последние 30 дней
      const approvedProjects = projects
        .filter(p => p.status === 'approved' && new Date(p.updatedAt) > thirtyDaysAgo)
        .map(p => ({
          id: p.id,
          name: p.name,
          approvedDate: p.updatedAt
        }));

      res.json(approvedProjects);
    } catch (error) {
      console.error('Error fetching approved projects:', error);
      res.status(500).json({ error: 'Failed to fetch approved projects' });
    }
  });

  // Получение задач, требующих экспертизы
  app.get('/api/expertise-tasks', authMiddleware, async (req, res) => {
    try {
      // В реальном приложении здесь будет логика получения задач экспертизы
      // из базы данных на основе ID текущего пользователя
      const expertiseTasks = Array.from(storage.components.values())
        .filter(c => c.status === 'review')
        .slice(0, 3)
        .map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          expertiseType: ['technical', 'security', 'business'][Math.floor(Math.random() * 3)]
        }));

      res.json(expertiseTasks);
    } catch (error) {
      console.error('Error fetching expertise tasks:', error);
      res.status(500).json({ error: 'Failed to fetch expertise tasks' });
    }
  });

  // Получение данных о влиянии на ИТ-инфраструктуру
  app.get('/api/impact-analysis', authMiddleware, async (req, res) => {
    try {
      // Анализ зависимостей компонентов
      const components = Array.from(storage.components.values());
      const dependencies = Array.from(storage.dependencies.values());

      // Находим компоненты с наибольшим количеством зависимостей
      const componentImpacts = components.map(component => {
        const relatedDeps = dependencies.filter(
          dep => dep.sourceId === component.id || dep.targetId === component.id
        );

        // Находим все связанные системы
        const affectedSystems = new Set();
        relatedDeps.forEach(dep => {
          if (dep.sourceId !== component.id) affectedSystems.add(dep.sourceId);
          if (dep.targetId !== component.id) affectedSystems.add(dep.targetId);
        });

        // Определяем уровень влияния
        let impactLevel = 'low';
        if (affectedSystems.size > 7) impactLevel = 'high';
        else if (affectedSystems.size > 4) impactLevel = 'medium';

        return {
          id: component.id,
          name: component.name,
          affectedSystems: affectedSystems.size,
          impactLevel
        };
      });

      // Сортируем по количеству затронутых систем
      const topImpacts = componentImpacts
        .sort((a, b) => b.affectedSystems - a.affectedSystems)
        .slice(0, 3);

      res.json(topImpacts);
    } catch (error) {
      console.error('Error analyzing impact:', error);
      res.status(500).json({ error: 'Failed to analyze impact' });
    }
  });


  // Создаем HTTP сервер
  const httpServer = createServer(app);
  return httpServer;
}