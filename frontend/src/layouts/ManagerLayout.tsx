import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

interface ManagerLayoutProps {
  onLogout?: () => void;
}

export default function ManagerLayout({ onLogout }: ManagerLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userRole="manager" onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
