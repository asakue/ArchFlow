import { useLocation, Link } from "wouter";

export const MobileNav = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Обзор", icon: "ri-dashboard-line" },
    { path: "/templates", label: "Библиотека", icon: "ri-stack-line" },
    { path: "/design", label: "Проекты", icon: "ri-flow-chart" },
    { path: "/approval", label: "Согласование", icon: "ri-clipboard-line" },
    { path: "/more", label: "Еще", icon: "ri-more-line" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 md:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link href={item.path} key={item.path}>
            <div className={`flex flex-col items-center py-2 ${location === item.path ? 'text-primary' : 'text-neutral-600'}`}>
              <i className={`${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
