import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function PlayerLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userRole="player" onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
