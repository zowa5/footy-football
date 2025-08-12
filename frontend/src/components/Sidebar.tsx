import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  User,
  Trophy,
  Calendar,
  ShoppingBag,
  Settings,
  Target,
  Zap,
  Shield,
  BarChart3,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const playerNavItems = [
  { title: "Dashboard", url: "/player", icon: BarChart3 },
  { title: "Character", url: "/player/character", icon: User },
  { title: "Skills & Styles", url: "/player/skills", icon: Zap },
  { title: "Matches", url: "/player/matches", icon: Calendar },
  { title: "Leaderboard", url: "/player/leaderboard", icon: Trophy },
  { title: "Store", url: "/player/store", icon: ShoppingBag },
];

const managerNavItems = [
  { title: "Club Dashboard", url: "/manager", icon: Shield },
  { title: "Squad Management", url: "/manager/squad", icon: Users },
  { title: "Formation", url: "/manager/formation", icon: Target },
  { title: "Matches", url: "/manager/matches", icon: Calendar },
  { title: "Leaderboard", url: "/manager/leaderboard", icon: Trophy },
  { title: "AI Players", url: "/manager/store", icon: ShoppingBag },
];

interface SidebarProps {
  userRole: "player" | "manager";
  onLogout?: () => void;
}

export function Sidebar({ userRole, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  let navItems = userRole === "player" ? playerNavItems : managerNavItems;

  // Hide Character link if player already has character
  if (userRole === "player" && user && user.playerInfo) {
    navItems = navItems.filter((item) => item.url !== "/player/character");
  }

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setIsCollapsed(isMobile);
    };

    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <h1 className="text-xl font-bold font-football bg-primary-gradient bg-clip-text text-transparent whitespace-nowrap">
              FOOTY CLUB
            </h1>
            <p className="text-xs text-muted-foreground capitalize whitespace-nowrap">
              {userRole} Mode
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
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
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-secondary/50 hover:text-foreground",
              isActive(item.url)
                ? "bg-primary/20 text-primary border border-primary/30 glow-border"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={cn(
                "font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
              )}
            >
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-secondary/50 hover:text-foreground text-muted-foreground"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span
            className={cn(
              "font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Settings
          </span>
        </NavLink>

        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 h-auto",
            "hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={cn(
              "font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
}
