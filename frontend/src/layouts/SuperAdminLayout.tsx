import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/SuperAdminSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function SuperAdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
