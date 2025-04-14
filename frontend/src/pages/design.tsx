import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Project, User } from "@shared/schema";

// Компонент визуального редактора архитектуры (заглушка для демонстрации)
const VisualEditor = () => {
  return (
    <div className="p-4 bg-neutral-50 border rounded-md flex items-center justify-center min-h-[500px]">
      <div className="text-center p-6 max-w-lg">
        <i className="ri-flow-chart text-5xl text-neutral-400 mb-3"></i>
        <h3 className="text-lg font-medium mb-2">Визуальный редактор архитектуры</h3>
        <p className="text-neutral-500 mb-4">
          Создавайте и редактируйте архитектурные диаграммы с помощью инструментов визуального моделирования.
          Модуль визуального редактирования находится в разработке.
        </p>
        <Button>
          <i className="ri-add-line mr-2"></i>
          Создать диаграмму
        </Button>
      </div>
    </div>
  );
};

// Компонент выбора шаблона для создания нового проекта
const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Здесь будут данные о шаблонах из API
  const { data: templates, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?type=template`);
      if (!response.ok) throw new Error("Не удалось загрузить шаблоны");
      return response.json();
    }
  });
  
  const templateCategories = [
    { id: "microservices", name: "Микросервисы" },
    { id: "integration", name: "Интеграция" },
    { id: "security", name: "Безопасность" },
    { id: "cloud", name: "Облачные решения" },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Выбор шаблона решения</h3>
        <Select defaultValue="microservices">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            {templateCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-neutral-200 rounded mb-3"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-neutral-200 rounded w-1/3 ml-auto"></div>
                </CardFooter>
              </Card>
            ))}
          </>
        ) : (
          <>
            {templates?.filter(t => t.type === 'template').map((template) => (
              <Card 
                key={template.id} 
                className={`overflow-hidden cursor-pointer transition-all ${selectedTemplate === template.id.toString() ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedTemplate(template.id.toString())}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 line-clamp-3 min-h-[3.75rem]">
                    {template.description || "Описание отсутствует"}
                  </p>
                </CardContent>
                <CardFooter className="border-t bg-neutral-50 px-6 py-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="ml-auto"
                  >
                    Выбрать
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Шаблон с нуля */}
            <Card 
              className={`overflow-hidden cursor-pointer transition-all border-dashed ${selectedTemplate === 'new' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setSelectedTemplate('new')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Пустой проект</CardTitle>
                <CardDescription>NEW-PROJ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700">
                  Создать новый проект с нуля без использования шаблона
                </p>
              </CardContent>
              <CardFooter className="border-t bg-neutral-50 px-6 py-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto"
                >
                  Выбрать
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="mr-2"
        >
          Отмена
        </Button>
        <Button 
          disabled={!selectedTemplate}
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};

// Компонент для создания/редактирования проекта
const ProjectEditor = () => {
  const { toast } = useToast();
  const [isNewProject, setIsNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
  // Здесь будет загрузка списка пользователей из API
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const handleSaveProject = () => {
    toast({
      title: "Проект сохранен",
      description: "Проект успешно сохранен и отправлен на согласование",
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Редактирование проекта</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
          >
            <i className="ri-eye-line mr-1"></i>
            Предпросмотр
          </Button>
          <Button 
            onClick={handleSaveProject}
          >
            <i className="ri-save-line mr-1"></i>
            Сохранить
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Основная информация</TabsTrigger>
          <TabsTrigger value="architecture">Архитектура</TabsTrigger>
          <TabsTrigger value="components">Компоненты</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Общая информация</CardTitle>
              <CardDescription>
                Основные сведения о проекте
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Название проекта</label>
                    <Input placeholder="Введите название проекта" defaultValue={isNewProject ? "" : "Модернизация платежного шлюза"} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Код проекта</label>
                    <Input placeholder="Например: PG-MOD-2023" defaultValue={isNewProject ? "" : "PG-MOD-2023"} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Описание</label>
                    <Textarea 
                      placeholder="Введите описание проекта"
                      className="min-h-[100px]"
                      defaultValue={isNewProject ? "" : "Проект по модернизации платежного шлюза с целью повышения производительности и безопасности."}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Тип проекта</label>
                    <Select defaultValue="project">
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Проект</SelectItem>
                        <SelectItem value="template">Шаблон</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Ответственный</label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ответственного" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        )) || (
                          <>
                            <SelectItem value="1">Михаил Иванов</SelectItem>
                            <SelectItem value="2">Елена Смирнова</SelectItem>
                            <SelectItem value="3">Андрей Кузнецов</SelectItem>
                            <SelectItem value="4">Алексей Петров</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Статус</label>
                    <Select defaultValue="needsWork">
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="review">На согласовании</SelectItem>
                        <SelectItem value="approved">Утвержден</SelectItem>
                        <SelectItem value="needsWork">Требует доработки</SelectItem>
                        <SelectItem value="archived">Архивный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Теги</label>
                    <Input placeholder="Разделите теги запятыми" defaultValue="платежи, безопасность, модернизация" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Документация</CardTitle>
              <CardDescription>
                Приложите связанные документы и ссылки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Ссылки на документацию</label>
                  <Input placeholder="https://..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Загрузить документы</label>
                  <div className="flex items-center gap-2">
                    <Input type="file" />
                    <Button variant="outline">
                      <i className="ri-upload-line mr-1"></i>
                      Загрузить
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="text-center">
                    <p className="text-neutral-500">Нет загруженных документов</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="architecture" className="space-y-4">
          <VisualEditor />
        </TabsContent>
        
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Компоненты системы</CardTitle>
              <CardDescription>
                Добавьте основные компоненты архитектуры
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h4 className="font-medium">Список компонентов</h4>
                  <Button size="sm">
                    <i className="ri-add-line mr-1"></i>
                    Добавить компонент
                  </Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <p className="font-medium">Платежный процессор</p>
                      <p className="text-sm text-neutral-500">Основной компонент обработки платежей</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <i className="ri-pencil-line mr-1"></i>
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm">
                        <i className="ri-delete-bin-line mr-1"></i>
                        Удалить
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <p className="font-medium">Система безопасности</p>
                      <p className="text-sm text-neutral-500">Компонент защиты транзакций</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <i className="ri-pencil-line mr-1"></i>
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm">
                        <i className="ri-delete-bin-line mr-1"></i>
                        Удалить
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <p className="font-medium">Интеграционный сервис</p>
                      <p className="text-sm text-neutral-500">Компонент для связи с внешними платежными системами</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <i className="ri-pencil-line mr-1"></i>
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm">
                        <i className="ri-delete-bin-line mr-1"></i>
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Интеграции</CardTitle>
              <CardDescription>
                Настройте интеграционные связи с внешними системами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <h4 className="font-medium">Внешние системы</h4>
                <Button size="sm">
                  <i className="ri-add-line mr-1"></i>
                  Добавить интеграцию
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CRM-система</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-neutral-600">Синхронизация данных о клиентах и транзакциях</p>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                      Активно
                    </Badge>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button variant="ghost" size="sm">
                      Настроить
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Финансовая система</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-neutral-600">Обмен данными с финансовыми системами</p>
                    <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-200">
                      Требует настройки
                    </Badge>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button variant="ghost" size="sm">
                      Настроить
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Основной компонент страницы проектирования
const Design = () => {
  const [mode, setMode] = useState<string>("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Загрузка списка проектов
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Обработчик создания нового проекта
  const handleCreateProject = () => {
    setIsTemplateDialogOpen(true);
  };
  
  // Обработчик редактирования проекта
  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setMode("edit");
  };
  
  // Обработчик дублирования проекта
  const handleDuplicateProject = (projectId: string) => {
    toast({
      title: "Проект дублирован",
      description: "Создана копия проекта. Вы можете редактировать ее.",
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Проектирование</h1>
          <p className="text-neutral-600">Инструменты для создания и редактирования архитектурных решений</p>
        </div>
        
        {mode === "list" && (
          <Button 
            onClick={handleCreateProject}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <i className="ri-add-line mr-2"></i>
            Создать проект
          </Button>
        )}
        
        {mode === "edit" && (
          <Button 
            variant="outline"
            onClick={() => setMode("list")}
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Вернуться к списку
          </Button>
        )}
      </div>
      
      {mode === "list" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Ваши проекты</CardTitle>
                <CardDescription>
                  Список проектов, где вы выступаете в роли архитектора или участника
                </CardDescription>
              </div>
              <div className="flex mt-2 md:mt-0 space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Фильтр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все проекты</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="review">На согласовании</SelectItem>
                    <SelectItem value="archived">Архивные</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Поиск проектов..." className="max-w-[200px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-neutral-200 rounded w-full"></div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 bg-neutral-200 rounded w-full"></div>
                ))}
              </div>
            ) : (
              <>
                {projects && projects.length > 0 ? (
                  <div className="divide-y">
                    {projects.filter(p => p.type === "project").map((project) => (
                      <div key={project.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-2 md:mb-0">
                          <div className="flex items-center">
                            <h3 className="font-medium text-lg">{project.name}</h3>
                            <Badge 
                              variant="secondary"
                              className="ml-2"
                            >
                              {project.code}
                            </Badge>
                          </div>
                          <p className="text-neutral-500 text-sm line-clamp-1 md:max-w-md">
                            {project.description || "Описание отсутствует"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className={
                              project.status === "active" ? "bg-green-100 text-green-800" :
                              project.status === "review" ? "bg-blue-100 text-blue-800" :
                              project.status === "approved" ? "bg-purple-100 text-purple-800" :
                              project.status === "needsWork" ? "bg-amber-100 text-amber-800" :
                              "bg-neutral-100 text-neutral-800"
                            }
                          >
                            {project.status === "active" ? "Активный" :
                             project.status === "review" ? "На согласовании" :
                             project.status === "approved" ? "Утвержден" :
                             project.status === "needsWork" ? "Требует доработки" :
                             "Архивный"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicateProject(project.id.toString())}
                          >
                            <i className="ri-file-copy-line mr-1"></i>
                            Дублировать
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleEditProject(project.id.toString())}
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Редактировать
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <i className="ri-folder-3-line text-4xl mb-2"></i>
                      <p>У вас пока нет проектов</p>
                      <p className="text-sm text-neutral-400 mt-1">
                        Создайте свой первый проект, нажав кнопку "Создать проект"
                      </p>
                      <Button
                        onClick={handleCreateProject}
                        className="mt-4"
                      >
                        <i className="ri-add-line mr-1"></i>
                        Создать проект
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {mode === "edit" && <ProjectEditor />}
      
      {/* Диалог выбора шаблона */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Создание нового проекта</DialogTitle>
            <DialogDescription>
              Выберите шаблон или создайте проект с нуля
            </DialogDescription>
          </DialogHeader>
          
          <TemplateSelector />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Design;
