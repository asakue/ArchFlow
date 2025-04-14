import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";

type DashboardStats = {
  activeProjects: number;
  pendingApproval: number;
  templates: number;
  artifacts: number;
  projectTrend: string;
  projectTrendUp: boolean;
  longPendingCount: number;
  newTemplatesCount: number;
};

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Обзор системы</h1>
        <p className="text-neutral-600">Управление архитектурой ИТ-решений организации</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Активные проекты"
          value={stats?.activeProjects > 0 ? stats.activeProjects : "Нет данных"}
          icon="ri-stack-line"
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          isLoading={isLoading}
          trend={stats && stats.activeProjects > 0 && stats.projectTrend ? {
            value: stats.projectTrend,
            direction: stats.projectTrendUp ? "up" : "down",
            text: "с прошлого месяца"
          } : undefined}
        />
        
        <StatCard 
          title="На согласовании"
          value={stats?.pendingApproval > 0 ? stats.pendingApproval : "Нет данных"}
          icon="ri-time-line"
          iconBgColor="bg-warning/10"
          iconColor="text-warning"
          isLoading={isLoading}
          trend={stats && stats.pendingApproval > 0 && stats.longPendingCount > 0 ? {
            value: String(stats.longPendingCount),
            direction: "up",
            text: "ожидают более 7 дней"
          } : undefined}
        />
        
        <StatCard 
          title="Шаблоны решений"
          value={stats?.templates > 0 ? stats.templates : "Нет данных"}
          icon="ri-file-list-3-line"
          iconBgColor="bg-accent/10"
          iconColor="text-accent"
          isLoading={isLoading}
          trend={stats && stats.templates > 0 && stats.newTemplatesCount > 0 ? {
            value: String(stats.newTemplatesCount),
            direction: "neutral",
            text: "новых за квартал"
          } : undefined}
        />
        
        <StatCard 
          title="Артефакты"
          value={stats?.artifacts > 0 ? stats.artifacts : "Нет данных"}
          icon="ri-archive-line"
          iconBgColor="bg-neutral-100"
          iconColor="text-neutral-700"
          isLoading={isLoading}
        />
      </div>

      {/* Recent activity and resource sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent activity feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick links and compliance */}
        <div>
          <QuickAccess />
          <ComplianceChart />
        </div>
      </div>

      {/* Projects and templates table */}
      <ProjectsTable />
    </>
  );
};

export default Dashboard;
