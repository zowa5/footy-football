import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";

// Player Pages
import PlayerDashboard from "./pages/player/Dashboard";
import PlayerStore from "./pages/player/Store";
import PlayerSkills from "./pages/player/Skills";
import PlayerMatches from "./pages/player/Matches";
import CharacterCreation from "./pages/player/CharacterCreation";
import Leaderboard from "./pages/Leaderboard";

// Manager Pages
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerStore from "./pages/manager/Store";
import SquadManagement from "./pages/manager/SquadManagement";
import FormationBuilder from "./pages/manager/FormationBuilder";

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import UsersManagement from "./pages/superadmin/Users";
import ClubsManagement from "./pages/superadmin/Clubs";
import MatchReports from "./pages/superadmin/Reports";
import Tournaments from "./pages/superadmin/Tournaments";
import SystemLogs from "./pages/superadmin/Logs";
import Notifications from "./pages/superadmin/Notifications";
import Settings from "./pages/superadmin/Settings";
import { Sidebar } from "./components/Sidebar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Import layouts
import PlayerLayout from "./layouts/PlayerLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"player" | "manager" | "superadmin">(
    "player"
  );

  // Mock authentication check - replace with real auth logic
  const handleLogin = (role: "player" | "manager" | "superadmin") => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("player");
    // Navigate to home page after logout
    navigate("/", { replace: true });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isAuthenticated ? (
          <AuthPage onLogin={handleLogin} />
        ) : (
          <Routes>
            {/* Player Routes */}
            {userRole === "player" && (
              <Route element={<PlayerLayout onLogout={handleLogout} />}>
                <Route path="/" element={<PlayerDashboard />} />
                <Route path="/player" element={<PlayerDashboard />} />
                <Route
                  path="/player/character"
                  element={<CharacterCreation />}
                />
                <Route path="/player/skills" element={<PlayerSkills />} />
                <Route path="/player/store" element={<PlayerStore />} />
                <Route path="/player/leaderboard" element={<Leaderboard />} />
                <Route path="/player/matches" element={<PlayerMatches />} />
                {/* Redirect any other path to player dashboard */}
                <Route path="*" element={<Navigate to="/player" replace />} />
              </Route>
            )}

            {/* Manager Routes */}
            {userRole === "manager" && (
              <Route element={<ManagerLayout onLogout={handleLogout} />}>
                <Route path="/" element={<ManagerDashboard />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/manager/squad" element={<SquadManagement />} />
                <Route
                  path="/manager/formation"
                  element={<FormationBuilder />}
                />
                <Route path="/manager/store" element={<ManagerStore />} />
                <Route path="/manager/matches" element={<PlayerMatches />} />
                <Route path="/manager/leaderboard" element={<Leaderboard />} />
                {/* Redirect any other path to manager dashboard */}
                <Route path="*" element={<Navigate to="/manager" replace />} />
              </Route>
            )}

            {/* Super Admin Routes */}
            {userRole === "superadmin" && (
              <Route element={<SuperAdminLayout onLogout={handleLogout} />}>
                <Route path="/" element={<SuperAdminDashboard />} />
                <Route path="/superadmin" element={<SuperAdminDashboard />} />
                <Route path="/superadmin/users" element={<UsersManagement />} />
                <Route path="/superadmin/clubs" element={<ClubsManagement />} />
                <Route path="/superadmin/reports" element={<MatchReports />} />
                <Route
                  path="/superadmin/tournaments"
                  element={<Tournaments />}
                />
                <Route path="/superadmin/logs" element={<SystemLogs />} />
                <Route
                  path="/superadmin/notifications"
                  element={<Notifications />}
                />
                <Route path="/superadmin/settings" element={<Settings />} />
                {/* Redirect any other path to superadmin dashboard */}
                <Route
                  path="*"
                  element={<Navigate to="/superadmin" replace />}
                />
              </Route>
            )}
          </Routes>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
