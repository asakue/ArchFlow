type QuickLinkItem = {
  icon: string;
  label: string;
  href: string;
};

export const QuickAccess = () => {
  const quickLinks: QuickLinkItem[] = [
    {
      icon: "ri-add-line",
      label: "Новое решение",
      href: "/design/new"
    },
    {
      icon: "ri-search-line",
      label: "Поиск шаблонов",
      href: "/templates"
    },
    {
      icon: "ri-upload-line",
      label: "Загрузить артефакт",
      href: "/artifacts/upload"
    },
    {
      icon: "ri-team-line",
      label: "Управление доступом",
      href: "/settings/access"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h2 className="font-semibold">Быстрый доступ</h2>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3">
        {quickLinks.map((link, index) => (
          <a 
            key={index}
            href={link.href} 
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-neutral-200 hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <i className={`${link.icon} text-lg`}></i>
            </div>
            <span className="text-sm font-medium text-center">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
