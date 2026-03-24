import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ScrollText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoCredimogiana from "@/assets/Logotipo.png";

const menuItems = [
  {
    label: "Reuniões",
    icon: Calendar,
    path: "/reunioes",
  },
  {
    label: "Pautas",
    icon: FileText,
    path: "/pautas",
  },
  {
    label: "Atas",
    icon: ScrollText,
    path: "/atas",
  },
  {
    label: "Acompanhamento",
    icon: CheckSquare,
    path: "/acompanhamento",
  },
  {
    label: "Membros",
    icon: Users,
    path: "/membros",
  },
  {
    label: "Destinatários",
    icon: Mail,
    path: "/destinatarios",
  },
  {
    label: "Painel Geral",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Documentação",
    icon: BookOpen,
    path: "/documentacao",
  },
  {
    label: "Configurações",
    icon: Settings,
    path: "/configuracoes",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <img src={logoCredimogiana} alt="Credimogiana" className="w-8 h-8 object-contain" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-sidebar-foreground text-sm leading-tight">
                  Governança
                </h1>
                <span className="text-xs text-sidebar-foreground/60">Mogiana</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {!collapsed && (
                  <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "px-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2">Recolher</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
