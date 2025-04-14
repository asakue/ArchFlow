import { useLocation, Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile"; // Added import

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileNavVisible: boolean;
  closeMobileNav: () => void;
}

export const Sidebar = ({ 
  collapsed, 
  toggleSidebar, 
  mobileNavVisible,
  closeMobileNav
}: SidebarProps) => {
  const [location] = useLocation();
  const isMobile = useIsMobile(); // Using useIsMobile

  const navItems = [
    { path: "/", label: "Обзор", icon: "ri-dashboard-line" },
    { path: "/templates", label: "Библиотека решений", icon: "ri-stack-line" },
    { path: "/artifacts", label: "Хранилище артефактов", icon: "ri-archive-line" },
    { path: "/design", label: "Проектирование", icon: "ri-flow-chart" },
    { path: "/approval", label: "Согласование", icon: "ri-clipboard-line" },
    { path: "/analytics", label: "Аналитика", icon: "ri-bar-chart-box-line" },
    { path: "/settings", label: "Настройки", icon: "ri-settings-3-line" },
  ];

  // Определение классов для сайдбара в зависимости от состояния
  const sidebarClasses = `
    bg-white border-r border-neutral-200 h-full transition-all duration-300 ease-in-out ${collapsed ? 'w-16 opacity-100' : 'w-60 opacity-100'}
    ${mobileNavVisible ? 'fixed top-0 left-0 z-30' : ''}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Collapsed sidebar */}
      {collapsed && (
        <div className="w-16 h-full flex flex-col items-center py-4">
          <div className="mb-8 px-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
          </div>

          <nav className="flex-1 w-full">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path} className="sidebar-item relative">
                  <Link href={item.path}>
                    <div className={`flex justify-center items-center h-12 w-full hover:bg-neutral-100 cursor-pointer
                      ${location === item.path ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}
                      onClick={mobileNavVisible ? closeMobileNav : undefined}
                    >
                      <i className={`${item.icon} text-xl`}></i>
                      <span className="sidebar-tooltip">{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto">
            <div className="sidebar-item relative">
              <button 
                className="flex justify-center items-center h-12 w-full text-neutral-600 hover:bg-neutral-100 hover:text-primary" 
                onClick={toggleSidebar}
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
                <span className="sidebar-tooltip">Развернуть меню</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded sidebar */}
      {!collapsed && (
        <div className="w-60 h-full flex flex-col py-4">
          <div className="mb-8 px-4 flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">
              A
            </div>
            <span className="text-lg font-semibold text-neutral-800">ArchFlow</span>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div className={`flex items-center h-10 px-3 rounded-md font-medium cursor-pointer
                      ${location === item.path 
                        ? 'text-primary bg-primary/10' 
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary'}`}
                      onClick={mobileNavVisible ? closeMobileNav : undefined}
                    >
                      <i className={`${item.icon} text-lg mr-3`}></i>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-2">
            <button 
              className="flex items-center justify-between w-full h-10 px-3 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-primary"
              onClick={toggleSidebar}
            >
              <span>Свернуть меню</span>
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};