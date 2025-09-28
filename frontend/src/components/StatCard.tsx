import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  maxValue?: number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ title, value, maxValue, icon, trend, className }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-accent";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "";
    }
  };

  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        {trend && (
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {getTrendIcon()}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {maxValue && (
          <span className="text-sm text-muted-foreground">/{maxValue}</span>
        )}
      </div>
      
      {maxValue && typeof value === 'number' && (
        <div className="mt-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}