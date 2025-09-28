import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useManagerData } from "@/hooks/useManagerData";

export default function ManagerDashboard() {
  const { data, loading, error, refreshData } = useManagerData();

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Memuat data manager...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-yellow-600">Data tidak tersedia</p>
        </div>
      </div>
    );
  }

  const { manager, stats, recentMatches } = data;
  const managerInfo = manager.managerInfo;
  const userStats = manager.stats;

  // Calculate additional stats
  const winRate = parseFloat(stats.winRate.replace("%", ""));
  const totalMatches = stats.totalMatches;
  const wins = Math.round((winRate / 100) * totalMatches);
  const draws = Math.max(
    0,
    totalMatches - wins - Math.floor(totalMatches * 0.3)
  ); // Estimate draws
  const losses = totalMatches - wins - draws;

  // Get next match from recent matches (if any)
  const nextMatch = recentMatches.find(
    (match) =>
      match.status === "scheduled" && new Date(match.scheduledAt) > new Date()
  );

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-football">
              {managerInfo?.clubName || manager.username}
            </h1>
            <p className="text-muted-foreground">Club Management Dashboard</p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <h2 className="text-2xl font-bold">{stats.winRate}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                  <h2 className="text-2xl font-bold">{totalMatches}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Formations</p>
                  <h2 className="text-2xl font-bold">
                    {stats.formationsOwned}
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
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <h2 className="text-2xl font-bold">
                    {managerInfo?.budget?.toLocaleString() || 0} Coins
                  </h2>
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
                  <p className="text-lg font-semibold">{totalMatches}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Wins</p>
                  <p className="text-lg font-semibold text-green-500">{wins}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Draws</p>
                  <p className="text-lg font-semibold text-yellow-500">
                    {draws}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Losses</p>
                  <p className="text-lg font-semibold text-red-500">{losses}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals For</p>
                  <p className="text-lg font-semibold">
                    {userStats?.goals || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Goals Against</p>
                  <p className="text-lg font-semibold">
                    {userStats?.matchesPlayed > 0
                      ? Math.round((userStats?.goals || 0) * 0.8)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                {nextMatch ? "Next Match" : "Recent Matches"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextMatch ? (
                <div className="space-y-4">
                  <div className="text-2xl font-semibold">
                    vs {nextMatch.awayTeam}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(nextMatch.scheduledAt).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <div className="inline-block">
                    <div className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      League Match
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-lg text-muted-foreground">
                    Tidak ada pertandingan yang dijadwalkan
                  </div>
                  {recentMatches.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium mb-2">Pertandingan Terakhir:</p>
                      <div className="space-y-2">
                        {recentMatches.slice(0, 3).map((match) => (
                          <div
                            key={match._id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>
                              {match.homeTeam} vs {match.awayTeam}
                            </span>
                            <span className="text-muted-foreground">
                              {match.status === "completed"
                                ? `${match.homeScore} - ${match.awayScore}`
                                : match.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
