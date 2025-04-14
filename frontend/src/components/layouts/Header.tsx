import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function Header() {
  const { toggleMobileMenu } = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll events to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus search input when dialog opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  return (
    <header className={`sticky top-0 z-20 w-full bg-white border-b border-neutral-200 ${
      scrolled ? "shadow-sm" : ""
    }`}>
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center md:w-64">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={toggleMobileMenu}
          >
            <i className="ri-menu-line text-xl"></i>
          </Button>
          <Link href="/">
            <a className="flex items-center">
              <i className="ri-building-4-line text-2xl text-primary mr-2"></i>
              <span className="font-semibold text-lg text-neutral-900">ArchManager</span>
            </a>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 mx-6">
          <div className="relative w-full max-w-md">
            <Button 
              variant="outline" 
              className="relative w-full justify-start text-neutral-500 h-9 px-3"
              onClick={() => setSearchOpen(true)}
            >
              <i className="ri-search-line mr-2"></i>
              <span>Поиск...</span>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-xs text-neutral-400">
                <kbd className="bg-neutral-100 rounded px-1.5 py-0.5 mr-1">Ctrl</kbd>
                <span className="mx-0.5">+</span>
                <kbd className="bg-neutral-100 rounded px-1.5 py-0.5">K</kbd>
              </div>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <i className="ri-search-line text-xl"></i>
          </Button>

          <Button variant="ghost" size="icon">
            <i className="ri-notification-3-line text-xl"></i>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/03.png" alt="User profile" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Алексей Иванов</p>
                  <p className="text-xs leading-none text-neutral-500">
                    a.ivanov@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings">
                  <a className="flex items-center w-full">
                    <i className="ri-user-line mr-2"></i>
                    Профиль
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings">
                  <a className="flex items-center w-full">
                    <i className="ri-settings-line mr-2"></i>
                    Настройки
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <i className="ri-logout-box-line mr-2"></i>
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Поиск проектов, шаблонов, документов..." ref={searchInputRef} />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
          <CommandGroup heading="Проекты">
            <CommandItem>
              <i className="ri-stack-line mr-2 text-primary"></i>
              <span>Архитектура микросервисов</span>
            </CommandItem>
            <CommandItem>
              <i className="ri-stack-line mr-2 text-primary"></i>
              <span>Интеграционная шина</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Шаблоны">
            <CommandItem>
              <i className="ri-file-list-3-line mr-2 text-accent"></i>
              <span>Шаблон микросервисной архитектуры</span>
            </CommandItem>
            <CommandItem>
              <i className="ri-file-list-3-line mr-2 text-accent"></i>
              <span>Типовая модель безопасности</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Документы">
            <CommandItem>
              <i className="ri-file-text-line mr-2 text-neutral-700"></i>
              <span>Стандарты разработки API</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}