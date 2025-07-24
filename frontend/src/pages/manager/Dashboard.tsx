import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Target, TrendingUp } from "lucide-react";

export default function ManagerDashboard() {
  // Mock data
  const clubStats = {
    name: "FC Universe",
    ranking: 3,
    points: 28,
    gamesPlayed: 12,
    wins: 8,
    draws: 4,
    losses: 0,
    goalsFor: 24,
    goalsAgainst: 8,
    squadSize: 25,
    averageAge: 24.5,
    formationUsed: "4-3-3",
    nextMatch: {
      opponent: "Bayern Munich",
      date: "2025-07-26",
      competition: "Champions League",
    },
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-football">{clubStats.name}</h1>
          <p className="text-muted-foreground">Club Management Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    League Position
                  </p>
                  <h2 className="text-2xl font-bold">{clubStats.ranking}rd</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Squad Size</p>
                  <h2 className="text-2xl font-bold">{clubStats.squadSize}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Formation</p>
                  <h2 className="text-2xl font-bold">
                    {clubStats.formationUsed}
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <h2 className="text-2xl font-bold">{clubStats.points}</h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Season Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Games Played</p>
                  <p className="text-lg font-semibold">
                    {clubStats.gamesPlayed}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Wins</p>
                  <p className="text-lg font-semibold text-green-500">
                    {clubStats.wins}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Draws</p>
                  <p className="text-lg font-semibold text-yellow-500">
                    {clubStats.draws}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Losses</p>
                  <p className="text-lg font-semibold text-red-500">
                    {clubStats.losses}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals For</p>
                  <p className="text-lg font-semibold">{clubStats.goalsFor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals Against</p>
                  <p className="text-lg font-semibold">
                    {clubStats.goalsAgainst}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Next Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-semibold">
                  vs {clubStats.nextMatch.opponent}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {clubStats.nextMatch.date}
                </div>
                <div className="inline-block">
                  <div className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {clubStats.nextMatch.competition}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
