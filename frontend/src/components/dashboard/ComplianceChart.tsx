import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type ComplianceData = {
  category: string;
  score: number;
};

export const ComplianceChart = () => {
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Получаем ID выбранного проекта или активного проекта по умолчанию
  const { data: activeProject } = useQuery<{id: number}>({
    queryKey: ["/api/projects/active"],
    enabled: true
  });
  
  const projectId = activeProject?.id || 1;
  
  // Запрашиваем данные о соответствии для выбранного проекта
  const { data: complianceData, isLoading, error } = useQuery<ComplianceData[]>({
    queryKey: [`/api/compliance/${projectId}`],
    enabled: !!projectId
  });

  useEffect(() => {
    if (complianceData && chartRefs.current.length > 0) {
      // Анимация заполнения графиков
      setTimeout(() => {
        chartRefs.current.forEach((ref, index) => {
          if (ref && index < complianceData.length) {
            ref.style.width = "0%";
            setTimeout(() => {
              ref.style.width = `${complianceData[index].score}%`;
            }, 100);
          }
        });
      }, 300);
    }
  }, [complianceData]);

  // Функция для определения цвета в зависимости от значения
  const getColorClass = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-error";
  };

  // Функция для перевода категории на русский
  const getCategoryName = (category: string): string => {
    switch (category) {
      case "overall":
        return "Общий уровень";
      case "security":
        return "Безопасность";
      case "integration":
        return "Интеграции";
      case "performance":
        return "Производительность";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Соответствие стандартам</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                  <div className="h-4 bg-neutral-200 rounded w-12"></div>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !complianceData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Соответствие стандартам</h2>
        </div>
        <div className="p-4 text-error">
          Ошибка загрузки данных о соответствии стандартам. Пожалуйста, попробуйте позже.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h2 className="font-semibold">Соответствие стандартам</h2>
      </div>
      
      <div className="p-4">
        {complianceData.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium">{getCategoryName(item.category)}</span>
              <span className="text-sm font-medium">{item.score}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                ref={el => chartRefs.current[index] = el}
                className={`h-full chart-bar ${getColorClass(item.score)}`}
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>
        ))}

        <a href="/analytics" className="mt-4 text-sm text-primary font-medium flex items-center hover:text-primary/80">
          Подробный отчет
          <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </div>
    </div>
  );
};
