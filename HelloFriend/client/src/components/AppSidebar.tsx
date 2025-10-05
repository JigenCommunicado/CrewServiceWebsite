import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Database,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Главная",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Пользователи",
    icon: Users,
    url: "/users",
  },
  {
    title: "Мониторинг",
    icon: Activity,
    url: "/monitoring",
  },
  {
    title: "Аналитика",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "База данных",
    icon: Database,
    url: "/database",
  },
  {
    title: "Отчеты",
    icon: FileText,
    url: "/reports",
  },
  {
    title: "Безопасность",
    icon: Shield,
    url: "/security",
  },
  {
    title: "Настройки",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <div>
            <h2 className="font-bold text-base">CrewLife</h2>
            <p className="text-xs text-muted-foreground">Админ-панель</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
