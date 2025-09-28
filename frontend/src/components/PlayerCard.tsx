import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Star, Zap, Target } from "lucide-react";
import { EnergyBar } from "./EnergyBar";

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    overall: number;
    energy: number;
    maxEnergy: number;
    stats: {
      goals: number;
      assists: number;
      rating: number;
    };
  };
  className?: string;
}

export function PlayerCard({ player, className }: PlayerCardProps) {
  return (
    <Card className={`stat-card hover:scale-105 transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{player.name}</h3>
              <p className="text-xs text-muted-foreground">{player.position}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary/50">
            {player.overall}
          </Badge>
        </div>

        <div className="space-y-3">
          <EnergyBar 
            current={player.energy} 
            max={player.maxEnergy} 
            showText={false}
          />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">{player.stats.goals}</span>
              </div>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-3 w-3 text-accent" />
                <span className="text-xs font-medium">{player.stats.assists}</span>
              </div>
              <p className="text-xs text-muted-foreground">Assists</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">{player.stats.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}