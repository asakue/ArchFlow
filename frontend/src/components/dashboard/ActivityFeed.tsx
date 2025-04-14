import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { ContentLoader } from "@/components/ui/content-loader"; // Assuming this path is correct

type ActivityType = {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    avatar: string;
  };
  project: {
    id: number;
    name: string;
    code: string;
  } | null;
  details: Record<string, any>;
};

export const ActivityFeed = () => {
  const { data: activities, isLoading, error } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities?limit=4"],
  });

  // Function to determine the icon and color of the activity
  const getActivityIcon = (action: string): { icon: string; bgColor: string; textColor: string } => {
    switch (action) {
      case "create":
        return { 
          icon: "ri-folder-add-line", 
          bgColor: "bg-neutral-100", 
          textColor: "text-neutral-700" 
        };
      case "update":
        return { 
          icon: "ri-file-edit-line", 
          bgColor: "bg-primary/10", 
          textColor: "text-primary" 
        };
      case "approve":
        return { 
          icon: "ri-check-line", 
          bgColor: "bg-success/10", 
          textColor: "text-success" 
        };
      case "warning":
        return { 
          icon: "ri-error-warning-line", 
          bgColor: "bg-warning/10", 
          textColor: "text-warning" 
        };
      default:
        return { 
          icon: "ri-file-list-3-line", 
          bgColor: "bg-neutral-100", 
          textColor: "text-neutral-700" 
        };
    }
  };

  // Function to determine the entity type in Russian
  const getEntityTypeRussian = (entityType: string): string => {
    switch (entityType) {
      case "project":
        return "проект";
      case "artifact":
        return "артефакт";
      default:
        return entityType;
    }
  };

  // Function to format the action in Russian
  const getActionRussian = (action: string): string => {
    switch (action) {
      case "create":
        return "создал";
      case "update":
        return "обновил";
      case "approve":
        return "согласовал";
      case "warning":
        return "обнаружила отклонения от стандартов в";
      default:
        return action;
    }
  };

  // Function to format the date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  };

  // Function to get the activity location
  const getActivityLocation = (entityType: string): string => {
    switch (entityType) {
      case "project":
        return "Проекты";
      case "artifact":
        return "Артефакты";
      default:
        return "Библиотека решений";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold">Последние активности</h2>
          <button className="text-sm text-primary font-medium hover:text-primary/80">
            Все активности
          </button>
        </div>
        <div className="p-4">
          <ContentLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Последние активности</h2>
        </div>
        <div className="p-4 text-error">
          Ошибка загрузки активностей. Пожалуйста, попробуйте позже.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="font-semibold">Последние активности</h2>
        <button className="text-sm text-primary font-medium hover:text-primary/80">
          Все активности
        </button>
      </div>

      <div className="divide-y divide-neutral-200">
        {activities && activities.map((activity) => {
          const { icon, bgColor, textColor } = getActivityIcon(activity.action);

          return (
            <div key={activity.id} className="p-4 hover:bg-neutral-50">
              <div className="flex">
                <div className="mr-3 mt-0.5">
                  <div className={`h-9 w-9 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                    <i className={icon}></i>
                  </div>
                </div>
                <div>
                  <p className="text-neutral-800">
                    <span className="font-medium">{activity.user.fullName}</span> {" "}
                    {getActionRussian(activity.action)} {" "}
                    {activity.project ? (
                      <>
                        {getEntityTypeRussian(activity.entityType)} {" "}
                        <span className="font-medium text-primary">«{activity.project.name}»</span>
                      </>
                    ) : (
                      getEntityTypeRussian(activity.entityType)
                    )}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-neutral-500">
                    <span>{formatDate(activity.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <span className="text-neutral-600">{getActivityLocation(activity.entityType)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-neutral-200 text-center">
        <button className="text-sm text-primary font-medium hover:text-primary/80">
          Загрузить еще
        </button>
      </div>
    </div>
  );
};