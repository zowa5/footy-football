import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Alex Rodriguez", points: 2450, matches: 28, wins: 25 },
  { rank: 2, name: "Sarah Johnson", points: 2380, matches: 27, wins: 23 },
  { rank: 3, name: "Marcus Silva", points: 2320, matches: 26, wins: 22 },
  { rank: 4, name: "David Chen", points: 2280, matches: 25, wins: 21 },
  { rank: 5, name: "Emma Wilson", points: 2240, matches: 24, wins: 20 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <Trophy className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-football">
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top players competing for the championship
          </p>
        </div>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboardData.map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(player.rank)}
                      <span className="font-bold text-lg">#{player.rank}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {player.wins} wins out of {player.matches} matches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {player.points}
                    </div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
