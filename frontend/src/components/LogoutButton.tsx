import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  onLogout: () => void;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <Button
      variant="outline"
      className="ml-auto border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
      onClick={onLogout}
    >
      🚪 Logout
    </Button>
  );
}
