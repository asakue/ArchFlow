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
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Artifact, Project } from "@shared/schema";

// Компонент отображения истории версий артефакта
const ArtifactVersionHistory = () => {
  // Здесь будет реальная история версий из API
  const versions = [
    { version: "1.3", date: "15.03.2023", author: "Михаил Иванов", changes: "Обновление диаграммы интеграции" },
    { version: "1.2", date: "03.02.2023", author: "Елена Смирнова", changes: "Добавлены новые компоненты" },
    { version: "1.1", date: "25.01.2023", author: "Михаил Иванов", changes: "Исправления после ревью" },
    { version: "1.0", date: "15.01.2023", author: "Михаил Иванов", changes: "Первичная версия" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">История версий</h3>
      <div className="border rounded-md divide-y">
        {versions.map((ver, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 hover:bg-neutral-50">
            <div>
              <p className="font-medium">Версия {ver.version}</p>
              <p className="text-sm text-neutral-500">{ver.changes}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">{ver.author}</p>
              <p className="text-xs text-neutral-500">{ver.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Artifacts = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  // Загрузка списка артефактов
  const { data: artifacts, isLoading: isLoadingArtifacts } = useQuery<Artifact[]>({
    queryKey: ["/api/artifacts"],
  });

  // Загрузка списка проектов для фильтрации
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Открыть диалог с детальной информацией об артефакте
  const handleViewArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setIsArtifactDialogOpen(true);
  };

  // Типы артефактов
  const artifactTypes = [
    { id: "all", name: "Все типы" },
    { id: "document", name: "Документация" },
    { id: "diagram", name: "Диаграмма" },
    { id: "model", name: "Модель" },
    { id: "code", name: "Код" },
    { id: "specification", name: "Спецификация" },
  ];

  // Фильтрация артефактов
  const filteredArtifacts = artifacts?.filter(artifact => {
    if (filterProjectId !== "all" && artifact.projectId !== parseInt(filterProjectId)) {
      return false;
    }
    if (filterType !== "all" && artifact.type !== filterType) {
      return false;
    }
    return true;
  });

  // Получение имени проекта по ID
  const getProjectName = (projectId: number | null) => {
    if (!projectId) return "—";
    const project = projects?.find(p => p.id === projectId);
    return project ? project.name : `Проект #${projectId}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Хранилище артефактов</h1>
          <p className="text-neutral-600">Централизованное хранение и управление архитектурными артефактами</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <i className="ri-add-line mr-2"></i>
          Добавить артефакт
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Проект</label>
              <Select
                value={filterProjectId}
                onValueChange={setFilterProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проекты</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Тип артефакта</label>
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {artifactTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Поиск</label>
              <div className="flex">
                <Input placeholder="Поиск артефактов..." className="rounded-r-none" />
                <Button variant="outline" className="rounded-l-none">
                  <i className="ri-search-line"></i>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Архитектурные артефакты</CardTitle>
          <CardDescription>
            Всего артефактов: {filteredArtifacts?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingArtifacts || isLoadingProjects ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-neutral-200 rounded w-full"></div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-neutral-200 rounded w-full"></div>
              ))}
            </div>
          ) : (
            <>
              {filteredArtifacts && filteredArtifacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Проект</TableHead>
                        <TableHead>Версия</TableHead>
                        <TableHead>Обновлено</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArtifacts.map(artifact => (
                        <TableRow key={artifact.id}>
                          <TableCell className="font-medium">{artifact.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {artifact.type === "document" ? "Документация" :
                               artifact.type === "diagram" ? "Диаграмма" :
                               artifact.type === "model" ? "Модель" :
                               artifact.type === "code" ? "Код" :
                               artifact.type === "specification" ? "Спецификация" :
                               artifact.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{getProjectName(artifact.projectId)}</TableCell>
                          <TableCell>v{artifact.version}</TableCell>
                          <TableCell>
                            {artifact.updatedAt ? new Date(artifact.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewArtifact(artifact)}
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
                    <i className="ri-archive-line text-4xl mb-2"></i>
                    <p>Артефакты не найдены</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      Попробуйте изменить фильтры или добавьте новый артефакт
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог с подробной информацией об артефакте */}
      {selectedArtifact && (
        <Dialog open={isArtifactDialogOpen} onOpenChange={setIsArtifactDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedArtifact.name}</DialogTitle>
              <DialogDescription>
                Версия {selectedArtifact.version}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Детали</TabsTrigger>
                <TabsTrigger value="preview">Просмотр</TabsTrigger>
                <TabsTrigger value="history">История версий</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Описание</h4>
                  <p className="text-neutral-700">{selectedArtifact.description || "Описание отсутствует"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Тип артефакта</h4>
                    <Badge variant="outline" className="capitalize">
                      {selectedArtifact.type === "document" ? "Документация" :
                       selectedArtifact.type === "diagram" ? "Диаграмма" :
                       selectedArtifact.type === "model" ? "Модель" :
                       selectedArtifact.type === "code" ? "Код" :
                       selectedArtifact.type === "specification" ? "Спецификация" :
                       selectedArtifact.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Автор</h4>
                    <p className="text-neutral-700">ID пользователя: {selectedArtifact.userId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Проект</h4>
                    <p className="text-neutral-700">{getProjectName(selectedArtifact.projectId)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Последнее обновление</h4>
                    <p className="text-neutral-700">{selectedArtifact.updatedAt ? new Date(selectedArtifact.updatedAt).toLocaleDateString("ru-RU") : "Нет данных"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Содержимое / Ссылка</h4>
                  <p className="text-neutral-700 break-all">{selectedArtifact.content || "Содержимое не указано"}</p>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="text-center py-10 bg-neutral-50 rounded-md border">
                  <i className="ri-file-text-line text-5xl text-neutral-400 mb-3"></i>
                  <p className="text-neutral-500">Предварительный просмотр недоступен</p>
                  <p className="text-neutral-400 text-sm mt-1">Требуется интеграция с системой просмотра документов</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <ArtifactVersionHistory />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsArtifactDialogOpen(false)}>
                Закрыть
              </Button>
              <Button variant="outline">
                <i className="ri-download-line mr-1"></i>
                Загрузить
              </Button>
              <Button>
                <i className="ri-edit-line mr-1"></i>
                Редактировать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог создания нового артефакта */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавление артефакта</DialogTitle>
            <DialogDescription>
              Заполните информацию для добавления нового архитектурного артефакта
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1">Название артефакта</label>
              <Input placeholder="Введите название артефакта" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Описание</label>
              <Textarea 
                placeholder="Введите описание артефакта" 
                className="min-h-[100px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Тип артефакта</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {artifactTypes.filter(t => t.id !== "all").map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Проект</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите проект" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Версия</label>
              <Input placeholder="Например: 1.0" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Содержимое / Ссылка</label>
              <div className="flex gap-2">
                <Input placeholder="URL или путь к файлу" />
                <Button variant="outline">
                  <i className="ri-upload-line mr-1"></i>
                  Загрузить
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              toast({
                title: "Артефакт добавлен",
                description: "Новый артефакт успешно добавлен в хранилище",
              });
              setIsCreateDialogOpen(false);
            }}>
              Добавить артефакт
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Artifacts;