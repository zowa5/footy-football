import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
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
import NotFound from "./pages/NotFound";

// Import layouts
import PlayerLayout from "./layouts/PlayerLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (
          error?.message?.includes("401") ||
          error?.message?.includes("403")
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log("🔍 AppContent render:", {
    isAuthenticated,
    user: user?.role,
    isLoading,
  });

  if (isLoading) {
    console.log("⏳ Still loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, showing AuthPage");
    return <AuthPage />;
  }

  const userRole = user?.role;
  console.log("✅ Authenticated, rendering dashboard for role:", userRole);
  console.log("🔍 User object:", user);

  // Add fallback if no userRole matches
  if (!userRole || !["player", "manager", "super_admin"].includes(userRole)) {
    console.log("❌ Unknown or invalid user role:", userRole);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid User Role</h2>
          <p>Role: {userRole || "undefined"}</p>
          <p>Please contact administrator</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Player Routes */}
      {userRole === "player" && (
        <Route element={<PlayerLayout />}>
          <Route path="/" element={<PlayerDashboard />} />
          <Route path="/player" element={<PlayerDashboard />} />
          <Route path="/player/character" element={<CharacterCreation />} />
          <Route path="/player/skills" element={<PlayerSkills />} />
          <Route path="/player/store" element={<PlayerStore />} />
          <Route path="/player/leaderboard" element={<Leaderboard />} />
          <Route path="/player/matches" element={<PlayerMatches />} />
          <Route path="*" element={<Navigate to="/player" replace />} />
        </Route>
      )}

      {/* Manager Routes */}
      {userRole === "manager" && (
        <Route element={<ManagerLayout />}>
          <Route path="/" element={<ManagerDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/squad" element={<SquadManagement />} />
          <Route path="/manager/formation" element={<FormationBuilder />} />
          <Route path="/manager/store" element={<ManagerStore />} />
          <Route path="/manager/matches" element={<PlayerMatches />} />
          <Route path="/manager/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Route>
      )}

      {/* Super Admin Routes */}
      {userRole === "super_admin" && (
        <Route element={<SuperAdminLayout />}>
          <Route path="/" element={<SuperAdminDashboard />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/users" element={<UsersManagement />} />
          <Route path="/superadmin/clubs" element={<ClubsManagement />} />
          <Route path="/superadmin/reports" element={<MatchReports />} />
          <Route path="/superadmin/tournaments" element={<Tournaments />} />
          <Route path="/superadmin/logs" element={<SystemLogs />} />
          <Route path="/superadmin/notifications" element={<Notifications />} />
          <Route path="/superadmin/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Route>
      )}

      {/* Fallback for unknown roles */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
