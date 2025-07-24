import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

interface PlayerLayoutProps {
  onLogout?: () => void;
}

export default function PlayerLayout({ onLogout }: PlayerLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userRole="player" onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
