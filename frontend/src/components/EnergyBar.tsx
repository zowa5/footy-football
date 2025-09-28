import { cn } from "@/lib/utils";

interface EnergyBarProps {
  current: number;
  max: number;
  className?: string;
  showText?: boolean;
}

export function EnergyBar({ current, max, className, showText = true }: EnergyBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const getEnergyColor = (percentage: number) => {
    if (percentage > 60) return "from-green-500 to-green-400";
    if (percentage > 30) return "from-yellow-500 to-yellow-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Energy</span>
          <span className="text-sm font-semibold">{current}/{max}</span>
        </div>
      )}
      <div className="energy-bar">
        <div 
          className={cn(
            "energy-fill bg-gradient-to-r transition-all duration-500",
            getEnergyColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}