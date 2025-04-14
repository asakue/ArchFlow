import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from "recharts";
import { Project, User, Standard, Compliance } from "@shared/schema";

const ContentLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-8 border-t-8 border-gray-200"></div>
  </div>
);

// Компонент графика соответствия стандартам
const ComplianceRadarChart = ({ projectId }: { projectId: number }) => {
  // Здесь будут данные о соответствии стандартам из API
  const { data: complianceData, isLoading } = useQuery<{ category: string; score: number }[]>({
    queryKey: [`/api/compliance/${projectId}`],
  });

  // Определяем цвета для разных уровней соответствия стандартам
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // зеленый для высокого соответствия
    if (score >= 60) return "#f59e0b"; // желтый для среднего соответствия
    return "#ef4444"; // красный для низкого соответствия
  };

  // Если данные загружаются или отсутствуют, показываем индикатор загрузки
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Соответствие стандартам</CardTitle>
          <CardDescription>
            Уровень соответствия корпоративным стандартам архитектуры
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ContentLoader />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Проверяем не только длину, но и что данные имеют правильную структуру
  const isValidData = Array.isArray(complianceData) && 
                      complianceData.length > 0 && 
                      complianceData.every(item => 'category' in item && 'score' in item);

  const data = isValidData ? complianceData : [];

  // Сортируем данные по уровню соответствия (от высокого к низкому)
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Соответствие стандартам</CardTitle>
        <CardDescription>
          Уровень соответствия корпоративным стандартам архитектуры
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80">
            <ContentLoader />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="category" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Соответствие"]}
                  labelFormatter={(label) => `Категория: ${label}`}
                />
                <Legend />
                <Bar dataKey="score" name="Соответствие (%)">
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span className="mr-3">0-59%</span>
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
            <span className="mr-3">60-79%</span>
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>80-100%</span>
          </div>
          <Button variant="ghost" size="sm">
            Подробнее
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Компонент графика статуса проектов
const ProjectStatusChart = () => {
  // Здесь будут данные о статусах проектов из API
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Подготовка данных для отображения в графике
  const getProjectStatusData = () => {
    if (!projects) return [];

    // Группируем проекты по статусу
    const statusCounts = projects.reduce((acc, project) => {
      const status = project.status;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {} as Record<string, number>);

    // Преобразуем в формат для графика
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === "active" ? "Активные" :
            status === "review" ? "На согласовании" :
            status === "approved" ? "Утверждены" :
            status === "needsWork" ? "Требуют доработки" :
            "Архивные",
      value: count,
      color: status === "active" ? "#10b981" :
             status === "review" ? "#3b82f6" :
             status === "approved" ? "#8b5cf6" :
             status === "needsWork" ? "#f59e0b" :
             "#6b7280"
    }));
  };

  const data = getProjectStatusData();

  // Проверяем наличие фактических данных (не просто пустой массив)
  const hasRealData = data.length > 0 && data.some(item => item.value > 0);
  const chartData = hasRealData ? data : [];

  if (!hasRealData && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статусы проектов</CardTitle>
          <CardDescription>
            Распределение проектов по статусам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center">
            <i className="ri-file-list-3-line text-4xl text-neutral-300 mb-2"></i>
            <p className="text-lg font-medium text-neutral-500">Нет данных о проектах</p>
            <p className="text-sm text-neutral-400 mt-1 max-w-md text-center">
              Для анализа распределения проектов по статусам необходимо создать хотя бы один проект
            </p>
            <div className="mt-4 flex space-x-2">
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/projects"] })}>
                <i className="ri-refresh-line mr-1"></i> Обновить данные
              </Button>
              <Button variant="default">
                <i className="ri-add-line mr-1"></i> Создать проект
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статусы проектов</CardTitle>
        <CardDescription>
          Распределение проектов по статусам
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80">
            <ContentLoader />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Количество проектов"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Компонент графика активности
const ActivityTimelineChart = () => {
  const [period, setPeriod] = useState("6");
  const { data: activityData, isLoading: isLoadingActivity } = useQuery<any[]>({
    queryKey: [`/api/activities/timeline/${period}`],
  });

  // Преобразуем данные из API в формат для графика
  const data = useMemo(() => {
    if (!activityData) return [];

    return activityData.map(item => ({
      date: item.month,
      проекты: item.projects || 0,
      артефакты: item.artifacts || 0,
      шаблоны: item.templates || 0,
    }));
  }, [activityData]);

  // Если данные загружаются или отсутствуют
  if (isLoadingActivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика активности</CardTitle>
          <CardDescription>
            Изменение количества создаваемых сущностей за период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ContentLoader />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Проверяем, есть ли фактические данные (не просто пустой массив)
  const hasActivityData = data.some(item => 
    (item.проекты && item.проекты > 0) || 
    (item.артефакты && item.артефакты > 0) || 
    (item.шаблоны && item.шаблоны > 0)
  );
  
  if (!hasActivityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Динамика активности</CardTitle>
          <CardDescription>
            Изменение количества создаваемых сущностей за период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center">
            <i className="ri-line-chart-line text-4xl text-neutral-300 mb-2"></i>
            <p className="text-neutral-500">Нет данных об активности</p>
            <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/activities/timeline/${period}`] })}>
              Обновить данные
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика активности</CardTitle>
        <CardDescription>
          Изменение количества создаваемых сущностей за период
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={500}
              height={400}
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatMonthYear}
              />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(label) => formatMonthYear(label)} />
              <Legend />
              <Area type="monotone" dataKey="проекты" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="артефакты" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="шаблоны" stackId="1" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Select 
            value={period} 
            onValueChange={(value) => {
              setPeriod(value);
              // Перезагрузка данных при изменении периода
              queryClient.invalidateQueries({ queryKey: [`/api/activities/timeline/${value}`] });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Последние 3 месяца</SelectItem>
              <SelectItem value="6">Последние 6 месяцев</SelectItem>
              <SelectItem value="12">Последние 12 месяцев</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => {
            // Здесь логика экспорта данных, например CSV
            const csvData = data.map(row => 
              `${row.date},${row.проекты},${row.артефакты},${row.шаблоны}`
            ).join('\n');
            const blob = new Blob([`Период,Проекты,Артефакты,Шаблоны\n${csvData}`], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-report-${period}-months.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}>
            Экспорт данных
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Компонент графика проблем и рисков
const IssuesChart = () => {
  const { data: issuesData, isLoading: isLoadingIssues } = useQuery<any[]>({
    queryKey: ["/api/issues/stats"],
  });

  // Преобразуем данные из API в формат для графика
  const data = useMemo(() => {
    if (!issuesData) return [];

    // Преобразуем данные, получаемые из API
    return issuesData.map(item => ({
      месяц: item.month,
      критические: item.critical || 0,
      высокие: item.high || 0,
      средние: item.medium || 0,
      низкие: item.low || 0,
    }));
  }, [issuesData]);

  if (isLoadingIssues) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Проблемы и риски</CardTitle>
          <CardDescription>
            Статистика выявленных проблем по уровню критичности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ContentLoader />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Проблемы и риски</CardTitle>
          <CardDescription>
            Статистика выявленных проблем по уровню критичности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center">
            <i className="ri-error-warning-line text-4xl text-neutral-300 mb-2"></i>
            <p className="text-neutral-500">Нет данных о проблемах и рисках</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Проблемы и риски</CardTitle>
        <CardDescription>
          Статистика выявленных проблем по уровню критичности
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="месяц" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="критические" stackId="a" fill="#ef4444" />
              <Bar dataKey="высокие" stackId="a" fill="#f59e0b" />
              <Bar dataKey="средние" stackId="a" fill="#3b82f6" />
              <Bar dataKey="низкие" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Компонент тепловой карты зависимостей
const DependencyHeatmap = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Карта зависимостей</CardTitle>
        <CardDescription>
          Визуализация связей между системами и компонентами
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-80 bg-neutral-50 rounded-md border">
          <div className="text-center">
            <i className="ri-git-branch-line text-5xl text-neutral-400 mb-3"></i>
            <p className="text-neutral-500">Тепловая карта зависимостей</p>
            <p className="text-neutral-400 text-sm mt-1">Интеграция с внешними системами аналитики находится в разработке</p>
            <Button variant="outline" className="mt-4">
              Запросить анализ зависимостей
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Компонент сводки по проектам
const ProjectsSummary = () => {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Запрашиваем аналитические данные для показателей
  const { data: statsData, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ["/api/analytics/summary"],
  });

  // Формируем карточки из полученных данных
  const stats = useMemo(() => {
    if (!statsData || !projects) return [];

    // Функция для проверки наличия данных
    const hasData = (value: any) => value !== undefined && value !== null && value !== 0 && value !== "";
    
    const activeTemplates = projects.filter(p => p.type === "template" && p.status === "active").length;
    
    return [
      {
        title: "Всего проектов",
        value: projects.length > 0 ? projects.length : "Нет данных",
        icon: "ri-folder-line",
        trend: hasData(statsData.projectTrend) ? statsData.projectTrend : "Нет данных",
        trendUp: hasData(statsData.projectTrend) ? statsData.projectTrendUp : null,
      },
      {
        title: "Активные шаблоны",
        value: activeTemplates > 0 ? activeTemplates : "Нет данных",
        icon: "ri-stack-line",
        trend: hasData(statsData.templateTrend) ? statsData.templateTrend : "Нет данных",
        trendUp: hasData(statsData.templateTrend) ? statsData.templateTrendUp : null,
      },
      {
        title: "Среднее время согласования",
        value: statsData.approvalTime && statsData.approvalTime !== "Нет данных" ? statsData.approvalTime : "Нет данных",
        icon: "ri-time-line",
        trend: hasData(statsData.approvalTimeTrend) ? statsData.approvalTimeTrend : "Нет данных",
        trendUp: hasData(statsData.approvalTimeTrend) ? statsData.approvalTimeTrendUp : null,
      },
      {
        title: "Уровень переиспользования",
        value: hasData(statsData.reuseLevel) ? `${statsData.reuseLevel}%` : "Нет данных",
        icon: "ri-recycle-line",
        trend: hasData(statsData.reuseLevelTrend) ? statsData.reuseLevelTrend : "Нет данных",
        trendUp: hasData(statsData.reuseLevelTrend) ? statsData.reuseLevelTrendUp : null,
      },
    ];
  }, [statsData, projects]);

  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
            {stat.trendUp !== null && (
              <div className={`mt-4 text-xs flex items-center ${
                stat.trendUp ? 'text-green-600' : 
                stat.trendUp === false ? 'text-red-600' : 'text-neutral-500'
              }`}>
                {stat.trendUp !== null && (
                  <i className={`${
                    stat.trendUp ? 'ri-arrow-up-s-line' : 
                    stat.trendUp === false ? 'ri-arrow-down-s-line' : 'ri-more-line'
                  } mr-1`}></i>
                )}
                <span>{stat.trend}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<string>("month");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("1");

  // Загрузка списка проектов для селекта
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Аналитика</h1>
          <p className="text-neutral-600">Анализ и визуализация архитектурных данных</p>
        </div>
        <div className="flex space-x-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <i className="ri-download-line mr-2"></i>
            Экспорт
          </Button>
        </div>
      </div>

      {/* Сводные показатели */}
      <ProjectsSummary />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Общий обзор</TabsTrigger>
          <TabsTrigger value="compliance">Соответствие стандартам</TabsTrigger>
          <TabsTrigger value="dependencies">Зависимости</TabsTrigger>
          <TabsTrigger value="risks">Риски и проблемы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectStatusChart />
            <ActivityTimelineChart />
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Анализ соответствия стандартам</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-500">Проект:</span>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  )) || (
                    <SelectItem value="1">Архитектура микросервисов</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ComplianceRadarChart projectId={parseInt(selectedProjectId)} />
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <DependencyHeatmap />
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <IssuesChart />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Влияние изменений на существующую ИТ-инфраструктуру</CardTitle>
            <CardDescription>
              Анализ потенциального влияния архитектурных решений на существующие системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Используем API для получения анализа влияния */}
              {useQuery({
                queryKey: ["/api/impact-analysis"],
                select: (data) => {
                  // Проверяем наличие фактических данных
                  const hasRealData = Array.isArray(data) && data.length > 0 && 
                    data.some(item => item.name && item.affectedSystems > 0);
                    
                  return (
                    <>
                      {hasRealData ? (
                        data.map((impact: any) => (
                          <div key={impact.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md">
                            <div>
                              <h4 className="font-medium">{impact.name}</h4>
                              <p className="text-sm text-neutral-500">
                                Изменение затрагивает {impact.affectedSystems} {
                                  impact.affectedSystems % 10 === 1 && impact.affectedSystems % 100 !== 11 ? "систему" :
                                  impact.affectedSystems % 10 >= 2 && impact.affectedSystems % 10 <= 4 && 
                                  (impact.affectedSystems % 100 < 10 || impact.affectedSystems % 100 >= 20) ? "системы" : "систем"
                                }
                              </p>
                            </div>
                            <Badge className={`mt-2 sm:mt-0 ${
                              impact.impactLevel === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                              impact.impactLevel === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {impact.impactLevel === 'high' ? 'Высокий' :
                               impact.impactLevel === 'medium' ? 'Средний' :
                               'Низкий'} уровень влияния
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-neutral-500">
                            <i className="ri-radar-line text-4xl mb-2 text-neutral-300"></i>
                            <p className="text-lg">Нет данных для анализа</p>
                            <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                              Анализ влияния не может быть выполнен из-за отсутствия данных о зависимостях между компонентами
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/impact-analysis"] })}>
                              Запросить анализ данных
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                },
                initialData: []
              }).data}
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button variant="outline" className="ml-auto">
              Запустить анализ влияния
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;