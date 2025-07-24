import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Settings,
  Database,
  BarChart3,
  Menu,
  X,
  Shield,
  FileText,
  Globe,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const superAdminNavItems = [
  { title: "Dashboard", url: "/superadmin", icon: BarChart3 },
  { title: "User Management", url: "/superadmin/users", icon: Users },
  { title: "Clubs Management", url: "/superadmin/clubs", icon: Shield },
  { title: "Match Reports", url: "/superadmin/reports", icon: FileText },
  { title: "Tournaments", url: "/superadmin/tournaments", icon: Globe },
  { title: "System Logs", url: "/superadmin/logs", icon: Database },
  { title: "Notifications", url: "/superadmin/notifications", icon: Bell },
  { title: "Settings", url: "/superadmin/settings", icon: Settings },
];

export function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold font-football bg-accent-gradient bg-clip-text text-transparent">
                ADMIN PANEL
              </h1>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {superAdminNavItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-secondary/50 hover:text-foreground",
              isActive(item.url)
                ? "bg-accent/20 text-accent border border-accent/30 glow-border"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium truncate">{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 h-auto",
            "hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
