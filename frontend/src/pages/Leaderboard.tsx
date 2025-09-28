import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Target,
  Users,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useLeaderboard } from "@/hooks/api";
import type { LeaderboardEntry } from "@/types/api";

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

const LeaderboardCard = ({
  title,
  icon,
  data,
  statKey,
  statLabel,
}: {
  title: string;
  icon: React.ReactNode;
  data: LeaderboardEntry[];
  statKey: keyof LeaderboardEntry;
  statLabel: string;
}) => (
  <Card className="stat-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((player) => (
            <div
              key={`${player.id}-${player.rank}`}
              className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[60px]">
                  {getRankIcon(player.rank)}
                  <span className="font-bold text-lg">#{player.rank}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {player.club}
                    </Badge>
                    <span>{player.position}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">
                  {player[statKey] as number}
                </div>
                <div className="text-sm text-muted-foreground">{statLabel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Leaderboard() {
  const { data: leaderboardData, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-football">
              Global Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Loading player statistics...
            </p>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="stat-card">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-football">
              Global Leaderboard
            </h1>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load leaderboard data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-football">
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top players competing across different categories
          </p>
        </div>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="assists">Assists</TabsTrigger>
            <TabsTrigger value="cleanSheets">Clean Sheets</TabsTrigger>
            <TabsTrigger value="matchesWon">Wins</TabsTrigger>
            <TabsTrigger value="yellowCards">Yellow Cards</TabsTrigger>
            <TabsTrigger value="redCards">Red Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-6">
            <LeaderboardCard
              title="Top Goal Scorers"
              icon={<Target className="h-5 w-5" />}
              data={leaderboardData?.goals || []}
              statKey="goals"
              statLabel="goals"
            />
          </TabsContent>

          <TabsContent value="assists" className="mt-6">
            <LeaderboardCard
              title="Top Assist Providers"
              icon={<Users className="h-5 w-5" />}
              data={leaderboardData?.assists || []}
              statKey="assists"
              statLabel="assists"
            />
          </TabsContent>

          <TabsContent value="cleanSheets" className="mt-6">
            <LeaderboardCard
              title="Clean Sheet Leaders (Goalkeepers)"
              icon={<Shield className="h-5 w-5" />}
              data={leaderboardData?.cleanSheets || []}
              statKey="cleanSheets"
              statLabel="clean sheets"
            />
          </TabsContent>

          <TabsContent value="matchesWon" className="mt-6">
            <LeaderboardCard
              title="Most Matches Won"
              icon={<Trophy className="h-5 w-5" />}
              data={leaderboardData?.matchesWon || []}
              statKey="matchesWon"
              statLabel="wins"
            />
          </TabsContent>

          <TabsContent value="yellowCards" className="mt-6">
            <LeaderboardCard
              title="Most Yellow Cards"
              icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
              data={leaderboardData?.yellowCards || []}
              statKey="yellowCards"
              statLabel="yellow cards"
            />
          </TabsContent>

          <TabsContent value="redCards" className="mt-6">
            <LeaderboardCard
              title="Most Red Cards"
              icon={<XCircle className="h-5 w-5 text-red-500" />}
              data={leaderboardData?.redCards || []}
              statKey="redCards"
              statLabel="red cards"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
