import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [mobileNavVisible, setMobileNavVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileNavVisible(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileNav = () => {
    setMobileNavVisible(!mobileNavVisible);
  };

  return (
    <div className="bg-neutral-100 text-neutral-800 flex h-screen overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        mobileNavVisible={mobileNavVisible}
        closeMobileNav={() => setMobileNavVisible(false)}
      />

      {/* Mobile overlay */}
      {mobileNavVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setMobileNavVisible(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleMobileNav={toggleMobileNav} />

        <main className="flex-1 overflow-auto px-4 lg:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
};

export default MainLayout;