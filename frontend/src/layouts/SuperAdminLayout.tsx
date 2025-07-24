import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/SuperAdminSidebar";

interface SuperAdminLayoutProps {
  onLogout?: () => void;
}

export default function SuperAdminLayout({ onLogout }: SuperAdminLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
