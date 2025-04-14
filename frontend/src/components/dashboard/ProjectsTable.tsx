import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

type Project = {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  responsibleUserId: number;
  updatedAt: string;
};

type User = {
  id: number;
  fullName: string;
  avatar: string;
};

export const ProjectsTable = () => {
  const [currentTab, setCurrentTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Запрашиваем проекты и пользователей
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Фильтрация проектов в зависимости от выбранной вкладки
  const getFilteredProjects = () => {
    if (!projects) return [];
    
    switch (currentTab) {
      case "active":
        return projects.filter(p => p.status === "active");
      case "review":
        return projects.filter(p => p.status === "review");
      case "archive":
        return projects.filter(p => p.status === "archived");
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();
  
  // Пагинация
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Получение пользователя по ID
  const getUser = (userId: number): User | undefined => {
    return users?.find(user => user.id === userId);
  };

  // Функция для форматирования даты обновления
  const formatUpdateDate = (dateString: string): string => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  };

  // Функция для перевода типа проекта
  const getProjectType = (type: string): string => {
    return type === "project" ? "Проект" : "Шаблон решения";
  };

  // Функция для получения иконки проекта
  const getProjectIcon = (type: string): string => {
    return type === "project" ? "ri-flow-chart" : "ri-file-list-3-line";
  };

  // Функция для получения цвета иконки проекта
  const getProjectIconColor = (type: string): string => {
    return type === "project" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary";
  };

  // Функция для получения данных о статусе
  const getStatusData = (status: string): { text: string; classes: string } => {
    switch (status) {
      case "active":
        return { text: "Активный", classes: "bg-success/10 text-success" };
      case "review":
        return { text: "На рассмотрении", classes: "bg-neutral-100 text-neutral-800" };
      case "approved":
        return { text: "Согласован", classes: "bg-success/10 text-success" };
      case "needsWork":
        return { text: "Требует доработки", classes: "bg-warning/10 text-warning" };
      case "archived":
        return { text: "Архивный", classes: "bg-neutral-200 text-neutral-600" };
      default:
        return { text: status, classes: "bg-neutral-100 text-neutral-800" };
    }
  };

  // Обработчик изменения вкладки
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтра
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoadingProjects) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-800">Проекты</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse flex space-x-4">
                <div className="rounded-md bg-neutral-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h2 className="font-semibold">Проекты и шаблоны</h2>
          
          <div className="flex overflow-x-auto py-1 no-scrollbar flex-1">
            <div className="flex gap-2">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentTab === "all" ? "bg-primary/10 text-primary" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
                onClick={() => handleTabChange("all")}
              >
                Все
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentTab === "active" ? "bg-primary/10 text-primary" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
                onClick={() => handleTabChange("active")}
              >
                Активные
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentTab === "review" ? "bg-primary/10 text-primary" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
                onClick={() => handleTabChange("review")}
              >
                На согласовании
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentTab === "archive" ? "bg-primary/10 text-primary" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
                onClick={() => handleTabChange("archive")}
              >
                Архивные
              </button>
            </div>
          </div>

          <div>
            <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-white flex items-center hover:bg-primary/90">
              <i className="ri-add-line mr-1.5"></i>
              <span>Создать</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Название</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Тип</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ответственный</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Статус</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Обновлено</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {paginatedProjects.map((project) => {
              const user = getUser(project.responsibleUserId);
              const statusData = getStatusData(project.status);
              
              return (
                <tr key={project.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-md ${getProjectIconColor(project.type)} flex items-center justify-center mr-3`}>
                        <i className={getProjectIcon(project.type)}></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{project.name}</div>
                        <div className="text-xs text-neutral-500">ID: {project.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral-600">{getProjectType(project.type)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-700 font-medium">
                          {user.avatar}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-neutral-900">{user.fullName}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusData.classes}`}>
                      {statusData.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                    {formatUpdateDate(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 hover:underline">
                      Открыть
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProjects.length > 0 && (
        <div className="px-4 py-3 bg-white border-t border-neutral-200 sm:px-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredProjects.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="px-4 py-6 text-center text-neutral-500">
          Нет проектов или шаблонов соответствующих выбранным фильтрам
        </div>
      )}
    </div>
  );
};
