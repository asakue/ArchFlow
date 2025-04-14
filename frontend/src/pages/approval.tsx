import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project, User } from "@shared/schema";

// Типизация для отображаемых проектов в согласовании
interface ApprovalProject extends Project {
  approvers?: { id: number; name: string; status: string }[];
}

// Статусы согласования
enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Компонент истории согласований
const ApprovalHistory = ({ projectId }: { projectId: number }) => {
  // Здесь в реальном приложении будут данные из API
  const approvalHistory = [
    { date: "12.04.2023", user: "Михаил Иванов", action: "Отправлено на согласование" },
    { date: "15.04.2023", user: "Елена Смирнова", action: "Согласовано с комментариями" },
    { date: "18.04.2023", user: "Андрей Кузнецов", action: "Согласовано" },
    { date: "25.04.2023", user: "Алексей Петров", action: "Утверждено к реализации" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-2">История согласований</h3>
      <div className="border rounded-md divide-y">
        {approvalHistory.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 hover:bg-neutral-50">
            <div>
              <p className="text-sm">{item.action}</p>
              <p className="text-xs text-neutral-500">{item.user}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент для отображения комментариев согласования
const ApprovalComments = ({ projectId }: { projectId: number }) => {
  // Здесь в реальном приложении будут данные из API
  const comments = [
    { 
      user: "Елена Смирнова", 
      role: "Архитектор", 
      date: "15.04.2023", 
      text: "Необходимо уточнить требования к производительности системы и добавить соответствующие метрики." 
    },
    { 
      user: "Андрей Кузнецов", 
      role: "Архитектор безопасности", 
      date: "17.04.2023", 
      text: "Рекомендую пересмотреть модель авторизации в соответствии с корпоративным стандартом." 
    },
    { 
      user: "Алексей Петров", 
      role: "Технический директор", 
      date: "23.04.2023", 
      text: "Согласовано. Решение соответствует стратегии развития IT-инфраструктуры компании." 
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Комментарии</h3>
      {comments.map((comment, idx) => (
        <div key={idx} className="border rounded-md p-4 hover:bg-neutral-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{comment.user}</p>
              <p className="text-xs text-neutral-500">{comment.role}</p>
            </div>
            <p className="text-xs text-neutral-500">{comment.date}</p>
          </div>
          <p className="text-sm text-neutral-700">{comment.text}</p>
        </div>
      ))}

      <div className="mt-4">
        <Textarea 
          placeholder="Добавьте ваш комментарий..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end mt-2">
          <Button size="sm">
            <i className="ri-send-plane-line mr-1"></i>
            Отправить комментарий
          </Button>
        </div>
      </div>
    </div>
  );
};

// Компонент экспертизы
const ApprovalExpertise = ({ projectId }: { projectId: number }) => {
  // Здесь в реальном приложении будут данные из API
  const expertiseAreas = [
    { name: "Технологическая экспертиза", status: "completed", expert: "Михаил Иванов", comments: 2 },
    { name: "Экспертиза безопасности", status: "completed", expert: "Андрей Кузнецов", comments: 1 },
    { name: "Бизнес-экспертиза", status: "pending", expert: "Ольга Новикова", comments: 0 },
    { name: "Оценка стоимости и рисков", status: "completed", expert: "Дмитрий Соколов", comments: 3 },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-2">Экспертиза решения</h3>
      <div className="border rounded-md divide-y">
        {expertiseAreas.map((area, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 hover:bg-neutral-50">
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-medium">{area.name}</p>
                {area.status === "completed" ? (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    Завершено
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                    В процессе
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500">Эксперт: {area.expert}</p>
            </div>
            <div className="text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <i className="ri-chat-3-line mr-1"></i>
                      {area.comments}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Комментариев: {area.comments}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Approval = () => {
  const [selectedProject, setSelectedProject] = useState<ApprovalProject | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(ApprovalStatus.PENDING);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загрузка списка проектов, которые находятся на согласовании
  const { data: approvalProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?status=review`);
      if (!response.ok) throw new Error("Не удалось загрузить проекты на согласовании");
      return response.json();
    }
  });

  // Загрузка пользователей системы для отображения согласующих
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Мутация для обновления статуса проекта
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; comment?: string }) => {
      return apiRequest(`/api/projects/${data.id}`, "PATCH", {
        status: data.status,
        // В реальном приложении нужно добавить userId текущего пользователя
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });

  // Обработчик утверждения проекта
  const handleApprove = () => {
    if (!selectedProject) return;

    updateProjectMutation.mutate(
      { 
        id: selectedProject.id, 
        status: "approved" 
      },
      {
        onSuccess: () => {
          toast({
            title: "Проект утвержден",
            description: `Проект "${selectedProject.name}" успешно утвержден`,
          });
          setIsApproveDialogOpen(false);
          setIsDetailDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Ошибка",
            description: `Не удалось утвердить проект: ${error}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Обработчик отклонения проекта
  const handleReject = () => {
    if (!selectedProject) return;

    updateProjectMutation.mutate(
      { 
        id: selectedProject.id, 
        status: "needsWork" 
      },
      {
        onSuccess: () => {
          toast({
            title: "Проект отклонен",
            description: `Проект "${selectedProject.name}" отправлен на доработку`,
          });
          setIsRejectDialogOpen(false);
          setIsDetailDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Ошибка",
            description: `Не удалось отклонить проект: ${error}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Обработчик открытия деталей проекта
  const handleViewProject = (project: Project) => {
    // Добавляем информацию о согласующих (в реальном приложении это должно приходить с бэкенда)
    const approvers = [
      { id: 1, name: "Михаил Иванов", status: "approved" },
      { id: 2, name: "Елена Смирнова", status: "approved" },
      { id: 3, name: "Андрей Кузнецов", status: "approved" },
      { id: 4, name: "Алексей Петров", status: "pending" },
    ];

    setSelectedProject({ ...project, approvers });
    setIsDetailDialogOpen(true);
  };

  // Получение имени ответственного по ID
  const getResponsibleName = (userId: number | null) => {
    if (!userId || !users) return "Не назначен";
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : `Пользователь #${userId}`;
  };

  // Статусы фильтрации
  const approvalStatuses = [
    { id: "all", name: "Все статусы" },
    { id: "review", name: "На согласовании" },
    { id: "approved", name: "Утверждено" },
    { id: "needsWork", name: "Требует доработки" },
  ];

  // Фильтрация проектов
  const filteredProjects = approvalProjects?.filter(project => {
    if (filterStatus === "all") return true;
    return project.status === filterStatus;
  });

  const ContentLoader = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-8 bg-neutral-200 rounded w-full"></div>
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-12 bg-neutral-200 rounded w-full"></div>
      ))}
    </div>
  );


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Согласование</h1>
        <p className="text-neutral-600">Процессы согласования и утверждения архитектурных решений</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Текущие задачи на согласование</CardTitle>
              <CardDescription>
                Проекты и шаблоны, требующие вашего рассмотрения и утверждения
              </CardDescription>
            </div>
            <div className="mt-2 md:mt-0">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ContentLoader />
          ) : (
            <>
              {filteredProjects && filteredProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Ответственный</TableHead>
                        <TableHead>Последнее обновление</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map(project => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {project.type === "project" ? "Проект" : "Шаблон"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={
                                project.status === "review" ? "bg-blue-100 text-blue-800" :
                                project.status === "approved" ? "bg-green-100 text-green-800" : 
                                project.status === "needsWork" ? "bg-amber-100 text-amber-800" : 
                                "bg-neutral-100 text-neutral-800"
                              }
                            >
                              {project.status === "review" ? "На согласовании" :
                               project.status === "approved" ? "Утверждено" :
                               project.status === "needsWork" ? "Требует доработки" :
                               project.status === "active" ? "Активный" :
                               "Архивный"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getResponsibleName(project.responsibleUserId)}</TableCell>
                          <TableCell>
                            {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewProject(project)}
                            >
                              <i className="ri-eye-line mr-1"></i>
                              Просмотр
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <i className="ri-checkbox-circle-line text-4xl mb-2"></i>
                    <p>Нет проектов на согласовании</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      На данный момент нет проектов, требующих вашего утверждения
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние утвержденные решения</CardTitle>
            <CardDescription>
              Проекты, прошедшие полное согласование за последние 30 дней
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-12 bg-neutral-200 rounded w-full"></div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Используем API для получения утвержденных проектов */}
                  {useQuery({
                    queryKey: ["/api/approved-projects"],
                    select: (data) => (
                      <>
                        {data.length > 0 ? (
                          data.map((project: any) => (
                            <div key={project.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50">
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <p className="text-xs text-neutral-500">
                                  Утверждено {new Date(project.approvedDate).toLocaleDateString("ru-RU")}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Утверждено
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-neutral-500">
                              <i className="ri-checkbox-circle-line text-4xl mb-2"></i>
                              <p>Нет утвержденных решений</p>
                              <p className="text-sm text-neutral-400 mt-1">
                                За последние 30 дней не было утверждено ни одного проекта
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ),
                    initialData: []
                  }).data}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задачи, требующие вашей экспертизы</CardTitle>
            <CardDescription>
              Проекты, где вы выступаете в роли эксперта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-12 bg-neutral-200 rounded w-full"></div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Используем API для получения задач экспертизы */}
                  {useQuery({
                    queryKey: ["/api/expertise-tasks"],
                    select: (data) => (
                      <>
                        {data.length > 0 ? (
                          data.map((task: any) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50">
                              <div>
                                <p className="font-medium">{task.name}</p>
                                <p className="text-xs text-neutral-500">
                                  Ожидает {
                                    task.expertiseType === 'technical' ? 'технической' :
                                    task.expertiseType === 'security' ? 'экспертизы безопасности' :
                                    'бизнес-экспертизы'
                                  } экспертизы
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <i className="ri-eye-line mr-1"></i>
                                Просмотр
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-neutral-500">
                              <i className="ri-checkbox-circle-line text-4xl mb-2"></i>
                              <p>Нет задач на экспертизу</p>
                              <p className="text-sm text-neutral-400 mt-1">
                                На данный момент у вас нет задач, требующих экспертизы
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ),
                    initialData: []
                  }).data}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалог с подробной информацией о проекте */}
      {selectedProject && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedProject.name}</DialogTitle>
                <Badge 
                  variant="secondary"
                  className={
                    selectedProject.status === "review" ? "bg-blue-100 text-blue-800" :
                    selectedProject.status === "approved" ? "bg-green-100 text-green-800" : 
                    selectedProject.status === "needsWork" ? "bg-amber-100 text-amber-800" : 
                    "bg-neutral-100 text-neutral-800"
                  }
                >
                  {selectedProject.status === "review" ? "На согласовании" :
                   selectedProject.status === "approved" ? "Утверждено" :
                   selectedProject.status === "needsWork" ? "Требует доработки" :
                   selectedProject.status === "active" ? "Активный" :
                   "Архивный"}
                </Badge>
              </div>
              <DialogDescription>
                Код проекта: {selectedProject.code}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="details">Детали проекта</TabsTrigger>
                <TabsTrigger value="approvers">Согласующие</TabsTrigger>
                <TabsTrigger value="comments">Комментарии</TabsTrigger>
                <TabsTrigger value="expertise">Экспертиза</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Описание</h4>
                  <p className="text-neutral-700">{selectedProject.description || "Описание отсутствует"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Тип</h4>
                    <p className="text-neutral-700 capitalize">
                      {selectedProject.type === "project" ? "Проект" : "Шаблон"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Ответственный</h4>
                    <p className="text-neutral-700">{getResponsibleName(selectedProject.responsibleUserId)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Создан</h4>
                    <p className="text-neutral-700">{selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString("ru-RU") : "Нет данных"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Последнее обновление</h4>
                    <p className="text-neutral-700">{selectedProject.updatedAt ? new Date(selectedProject.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}</p>
                  </div>
                </div>

                <Separator />

                <ApprovalHistory projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value="approvers">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Согласующие лица</h3>
                    <Button variant="outline" size="sm">
                      <i className="ri-user-add-line mr-1"></i>
                      Добавить согласующего
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Имя</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.approvers?.map(approver => (
                        <TableRow key={approver.id}>
                          <TableCell className="font-medium">{approver.name}</TableCell>
                          <TableCell>Архитектор</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                approver.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                                approver.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" : 
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {approver.status === "approved" ? "Согласовано" :
                               approver.status === "rejected" ? "Отклонено" :
                               "Ожидает"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <i className="ri-message-2-line mr-1"></i>
                              Комментарии
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="comments">
                <ApprovalComments projectId={selectedProject.id} />
              </TabsContent>

              <TabsContent value="expertise">
                <ApprovalExpertise projectId={selectedProject.id} />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Закрыть
              </Button>

              {selectedProject.status === "review" && (
                <>
                  <Button 
                    variant="outline" 
                    className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    onClick={() => setIsRejectDialogOpen(true)}
                  >
                    <i className="ri-close-circle-line mr-1"></i>
                    Отклонить
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsApproveDialogOpen(true)}
                  >
                    <i className="ri-check-line mr-1"></i>
                    Утвердить
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог утверждения проекта */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Утверждение проекта</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите утвердить проект "{selectedProject?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea 
              placeholder="Добавьте комментарий к утверждению (необязательно)"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Утверждение...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-1"></i>
                  Утвердить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог отклонения проекта */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонение проекта</DialogTitle>
            <DialogDescription>
              Пожалуйста, укажите причину отклонения проекта "{selectedProject?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea 
              placeholder="Укажите причину отклонения и необходимые изменения"
              className="min-h-[100px]"
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Отклонение...
                </>
              ) : (
                <>
                  <i className="ri-close-circle-line mr-1"></i>
                  Отклонить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approval;