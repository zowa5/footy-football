import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useManagerMatches } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerMatches() {
  const { data: matchesData, isLoading, error, refetch } = useManagerMatches();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recent" | "upcoming">("recent");

  const currentUserId = user?._id;
  const managerClubName = user?.managerInfo?.clubName;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Memuat data pertandingan...
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
          <p className="text-lg text-red-600 mb-4">
            Gagal memuat data pertandingan
          </p>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const matches = matchesData?.matches || [];
  const recentMatches = matches.filter((match) => match.status === "completed");
  const upcomingMatches = matches.filter(
    (match) => match.status === "scheduled"
  );

  const getMatchResult = (match: any, isHome: boolean) => {
    if (match.status !== "completed") return null;

    const homeScore = match.result?.homeScore || 0;
    const awayScore = match.result?.awayScore || 0;

    if (homeScore === awayScore) return "DRAW";

    const won = isHome ? homeScore > awayScore : awayScore > homeScore;
    return won ? "WIN" : "LOSS";
  };

  const isHomeTeam = (match: any) => {
    return match.homeTeam.teamName === managerClubName;
  };

  const getOpponent = (match: any) => {
    return isHomeTeam(match) ? match.awayTeam : match.homeTeam;
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case "WIN":
        return "bg-green-500";
      case "LOSS":
        return "bg-red-500";
      case "DRAW":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayMatches =
    activeTab === "recent" ? recentMatches : upcomingMatches;

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-football">Pertandingan</h1>
            <p className="text-muted-foreground">
              Kelola jadwal dan hasil pertandingan klub Anda
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <h2 className="text-2xl font-bold">{matches.length}</h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Menang</p>
                  <h2 className="text-2xl font-bold">
                    {
                      recentMatches.filter((match) => {
                        const isHome = isHomeTeam(match);
                        return getMatchResult(match, isHome) === "WIN";
                      }).length
                    }
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Seri</p>
                  <h2 className="text-2xl font-bold">
                    {
                      recentMatches.filter((match) => {
                        const isHome = isHomeTeam(match);
                        return getMatchResult(match, isHome) === "DRAW";
                      }).length
                    }
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Kalah</p>
                  <h2 className="text-2xl font-bold">
                    {
                      recentMatches.filter((match) => {
                        const isHome = isHomeTeam(match);
                        return getMatchResult(match, isHome) === "LOSS";
                      }).length
                    }
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("recent")}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "recent"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            Pertandingan Selesai
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "upcoming"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            Jadwal Mendatang
          </Button>
        </div>

        {/* Matches List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              {activeTab === "recent"
                ? "Pertandingan Selesai"
                : "Jadwal Mendatang"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayMatches.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {activeTab === "recent"
                    ? "Belum ada pertandingan yang selesai"
                    : "Belum ada jadwal pertandingan"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayMatches.map((match: any) => {
                  const isHome = isHomeTeam(match);
                  const opponent = getOpponent(match);
                  const result = getMatchResult(match, isHome);

                  return (
                    <div
                      key={match._id}
                      className="border rounded-lg p-4 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            {/* Result indicator for completed matches */}
                            {match.status === "completed" && result && (
                              <div
                                className={`w-3 h-3 rounded-full ${getResultColor(
                                  result
                                )}`}
                              />
                            )}

                            <div>
                              <div className="font-semibold text-lg">
                                vs {opponent.teamName}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(
                                    match.scheduledAt || match.completedAt
                                  )}
                                </div>
                                {match.status === "scheduled" && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(match.scheduledAt)}
                                  </div>
                                )}
                                {match.venue && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {match.venue}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Match result/score */}
                          {match.status === "completed" && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                {match.result?.homeScore || 0} -{" "}
                                {match.result?.awayScore || 0}
                              </div>
                              {result && (
                                <Badge
                                  variant={
                                    result === "WIN"
                                      ? "default"
                                      : result === "DRAW"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {result}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Match status */}
                          <Badge
                            variant={
                              match.status === "completed"
                                ? "outline"
                                : match.status === "scheduled"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {match.status === "completed"
                              ? "Selesai"
                              : match.status === "scheduled"
                              ? "Terjadwal"
                              : match.status}
                          </Badge>

                          {/* Home/Away indicator */}
                          <Badge variant="outline">
                            {isHome ? "Home" : "Away"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
