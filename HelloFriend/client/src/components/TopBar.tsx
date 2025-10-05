import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TopBarProps {
  onThemeToggle?: () => void;
  isDark?: boolean;
}

export function TopBar({ onThemeToggle, isDark = true }: TopBarProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-card sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            data-testid="input-search"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onThemeToggle}
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
            3
          </Badge>
        </Button>
        
        <div className="flex items-center gap-2 pl-2 border-l">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              АД
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Администратор</p>
            <p className="text-xs text-muted-foreground">admin@crewlife.ru</p>
          </div>
        </div>
      </div>
    </header>
  );
}
