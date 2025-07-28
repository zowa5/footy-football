import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userRole="manager" onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
