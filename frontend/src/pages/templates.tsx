import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Project | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  // Загрузка шаблонов проектов
  const { data: templates, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}?type=template`);
      if (!response.ok) throw new Error("Не удалось загрузить шаблоны");
      return response.json();
    }
  });

  // Открыть диалог с деталями шаблона
  const handleViewTemplate = (template: Project) => {
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  // Создать проект на основе шаблона
  const handleCreateFromTemplate = () => {
    // В реальном приложении здесь был бы API-запрос
    toast({
      title: "Проект создан",
      description: `Новый проект на основе шаблона "${selectedTemplate?.name}" успешно создан`,
    });
    setIsTemplateDialogOpen(false);
  };

  // Категории шаблонов (в реальном приложении это должны быть динамические данные)
  const templateCategories = [
    { id: "all", name: "Все категории" },
    { id: "microservices", name: "Микросервисы" },
    { id: "integration", name: "Интеграция" },
    { id: "security", name: "Безопасность" },
    { id: "cloud", name: "Облачные решения" },
  ];

  // Фильтрация шаблонов по категории
  const filteredTemplates = templates?.filter(template => {
    if (filterCategory === "all") return true;

    // В реальном приложении у шаблонов должна быть категория
    // Здесь используем код шаблона для имитации категории
    if (template.code.includes("MS")) return filterCategory === "microservices";
    if (template.code.includes("SEC")) return filterCategory === "security";
    if (template.code.includes("CLOUD")) return filterCategory === "cloud";
    if (template.code.includes("ESB")) return filterCategory === "integration";
    return false;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Библиотека решений</h1>
          <p className="text-neutral-600">Шаблоны и референсные модели для архитектурных решений</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <i className="ri-add-line mr-2"></i>
          Создать шаблон
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Шаблоны решений</TabsTrigger>
          <TabsTrigger value="patterns">Архитектурные паттерны</TabsTrigger>
          <TabsTrigger value="reference">Референсные модели</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {templateCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Input
                placeholder="Поиск шаблонов..."
                className="max-w-sm mr-2"
              />
              <Button variant="outline" size="icon">
                <i className="ri-search-line"></i>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-neutral-200 rounded mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-neutral-200 rounded w-1/3"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates?.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
                        <CardDescription>{template.code}</CardDescription>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={template.status === "active" ? "bg-green-100 text-green-800" : 
                                  template.status === "review" ? "bg-amber-100 text-amber-800" : 
                                  "bg-neutral-100 text-neutral-800"}
                      >
                        {template.status === "active" ? "Активный" : 
                         template.status === "review" ? "На проверке" : 
                         template.status === "approved" ? "Утвержден" : 
                         template.status === "needsWork" ? "Требует доработки" : 
                         "Архивный"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-700 mb-3 line-clamp-3 min-h-[3.75rem]">
                      {template.description || "Описание отсутствует"}
                    </p>
                    <div className="flex items-center text-xs text-neutral-500 mt-2">
                      <span className="flex items-center mr-4">
                        <i className="ri-user-line mr-1"></i>
                        Ответственный: {template.responsibleUserId}
                      </span>
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-neutral-50 px-6 py-3">
                    <Button 
                      variant="link" 
                      className="ml-auto p-0"
                      onClick={() => handleViewTemplate(template)}
                    >
                      Подробнее
                      <i className="ri-arrow-right-s-line ml-1"></i>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {(filteredTemplates?.length === 0) && (
                <div className="col-span-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <i className="ri-file-list-3-line text-4xl mb-2"></i>
                    <p>Шаблоны не найдены</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Архитектурные паттерны</CardTitle>
              <CardDescription>Каталог архитектурных паттернов и лучших практик</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Данный раздел находится в разработке. Здесь будет размещен каталог архитектурных паттернов с примерами применения.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference">
          <Card>
            <CardHeader>
              <CardTitle>Референсные модели</CardTitle>
              <CardDescription>Эталонные архитектуры для типовых сценариев</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Данный раздел находится в разработке. Здесь будут размещены референсные модели архитектур для различных типов систем.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог с подробной информацией о шаблоне */}
      {selectedTemplate && (
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedTemplate.name}</DialogTitle>
                <Badge 
                  variant="secondary"
                  className={selectedTemplate.status === "active" ? "bg-green-100 text-green-800" : 
                            selectedTemplate.status === "review" ? "bg-amber-100 text-amber-800" : 
                            "bg-neutral-100 text-neutral-800"}
                >
                  {selectedTemplate.status === "active" ? "Активный" : 
                  selectedTemplate.status === "review" ? "На проверке" : 
                  selectedTemplate.status === "approved" ? "Утвержден" : 
                  selectedTemplate.status === "needsWork" ? "Требует доработки" : 
                  "Архивный"}
                </Badge>
              </div>
              <DialogDescription>
                Код шаблона: {selectedTemplate.code}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Описание</h4>
                <p className="text-neutral-700">{selectedTemplate.description || "Описание отсутствует"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Ответственный</h4>
                  <p className="text-neutral-700">ID пользователя: {selectedTemplate.responsibleUserId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Последнее обновление</h4>
                  <p className="text-neutral-700">{selectedTemplate.updatedAt ? new Date(selectedTemplate.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Связанные артефакты</h4>
                <div className="bg-neutral-100 p-3 rounded-md text-neutral-500 text-center">
                  <i className="ri-file-list-3-line text-2xl mb-1"></i>
                  <p>Нет связанных артефактов</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Закрыть
              </Button>
              <Button onClick={handleCreateFromTemplate}>
                Создать проект на основе шаблона
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог создания нового шаблона */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создание нового шаблона</DialogTitle>
            <DialogDescription>
              Заполните информацию для создания нового шаблона архитектурного решения
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1">Название шаблона</label>
              <Input placeholder="Введите название шаблона" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Код шаблона</label>
              <Input placeholder="Например: MS-ARCH-2023" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Описание</label>
              <Textarea placeholder="Введите описание шаблона и его назначение" className="min-h-[100px]" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Категория</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.filter(c => c.id !== "all").map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              toast({
                title: "Шаблон создан",
                description: "Новый шаблон успешно создан и добавлен в библиотеку",
              });
              setIsCreateDialogOpen(false);
            }}>
              Создать шаблон
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;