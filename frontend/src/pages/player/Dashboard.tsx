import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { EnergyBar } from "@/components/EnergyBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlayerDashboard } from "../../hooks/usePlayerDashboard";
import {
  User,
  Target,
  Zap,
  Award,
  Calendar,
  TrendingUp,
  Star,
  Shield,
  Swords,
  Activity,
  Eye,
  Settings,
} from "lucide-react";

export default function PlayerDashboard() {
  const { data: dashboardData, isLoading, error } = usePlayerDashboard();
  const [selectedAttributeTab, setSelectedAttributeTab] = useState("offensive");

  // Debug logging
  console.log("🔍 Player Dashboard Data:", {
    dashboardData,
    isLoading,
    error,
    user: dashboardData?.user,
    playerInfo: dashboardData?.user?.playerInfo,
  });

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const player = dashboardData?.user;
  const playerInfo = player?.playerInfo;
  const recentMatches = dashboardData?.recentMatches || [];
  const upcomingMatches = dashboardData?.upcomingMatches || [];

  // Get next upcoming match
  const nextMatch = upcomingMatches[0];

  // Convert recent matches to form (W/L/D)
  const recentForm = recentMatches.slice(0, 5).map((match) => {
    if (match.status !== "completed") return "U"; // Upcoming
    // Simple form calculation - would need more logic for actual team matching
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;

    if (homeScore === awayScore) return "D";
    return homeScore > awayScore ? "W" : "L";
  });

  // Helper function to extract team name
  const getTeamName = (
    team: { userId?: { username: string } } | string
  ): string => {
    if (typeof team === "string") return team;
    return team?.userId?.username || "Unknown Team";
  }; // Convert player skills to attributes format for display
  const playerAttributes = [
    // Basic PES-like skills from our model
    {
      name: "Pace",
      value: playerInfo?.pace || 50,
      max: 99,
      category: "physical",
    },
    {
      name: "Shooting",
      value: playerInfo?.shooting || 50,
      max: 99,
      category: "offensive",
    },
    {
      name: "Passing",
      value: playerInfo?.passing || 50,
      max: 99,
      category: "offensive",
    },
    {
      name: "Dribbling",
      value: playerInfo?.dribbling || 50,
      max: 99,
      category: "offensive",
    },
    {
      name: "Defending",
      value: playerInfo?.defending || 50,
      max: 99,
      category: "defensive",
    },
    {
      name: "Physical",
      value: playerInfo?.physical || 50,
      max: 99,
      category: "physical",
    },
  ];

  const getFormColor = (result: string) => {
    switch (result) {
      case "W":
        return "bg-accent text-accent-foreground";
      case "D":
        return "bg-yellow-500 text-yellow-50";
      case "L":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "offensive":
        return <Swords className="h-4 w-4" />;
      case "physical":
        return <Activity className="h-4 w-4" />;
      case "defensive":
        return <Shield className="h-4 w-4" />;
      case "goalkeeper":
        return <Eye className="h-4 w-4" />;
      case "special":
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getAttributesByCategory = (category: string) => {
    return playerAttributes.filter((attr) => attr.category === category);
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Player Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back,{" "}
              {player?.firstName && player?.lastName
                ? `${player.firstName} ${player.lastName}`
                : player?.firstName || "Player"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary/50">
              {playerInfo?.position || "No Position"}
            </Badge>
            <Badge variant="secondary">Level: {player?.level || 1}</Badge>
            {player?.club && (
              <Badge
                variant="secondary"
                className="bg-accent text-accent-foreground"
              >
                {player.club}
              </Badge>
            )}
          </div>
        </div>

        {/* Energy & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <EnergyBar current={80} max={100} />
            </CardContent>
          </Card>

          <StatCard
            title="Goals"
            value={player?.stats?.goals || 0}
            icon={<Target className="h-4 w-4 text-primary" />}
            trend="up"
          />

          <StatCard
            title="Assists"
            value={player?.stats?.assists || 0}
            icon={<Zap className="h-4 w-4 text-accent" />}
            trend="up"
          />

          <StatCard
            title="Matches Played"
            value={player?.stats?.matches || 0}
            icon={<Star className="h-4 w-4 text-yellow-500" />}
            trend="neutral"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Attributes */}
          <Card className="lg:col-span-2 stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Player Attributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={selectedAttributeTab}
                onValueChange={setSelectedAttributeTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4 h-auto">
                  <TabsTrigger
                    value="offensive"
                    className="flex items-center gap-1 text-xs p-2 h-auto"
                  >
                    <Swords className="h-3 w-3" />
                    <span className="hidden sm:inline">Attack</span>
                    <span className="sm:hidden">ATK</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="physical"
                    className="flex items-center gap-1 text-xs p-2 h-auto"
                  >
                    <Activity className="h-3 w-3" />
                    <span className="hidden sm:inline">Physical</span>
                    <span className="sm:hidden">PHY</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="defensive"
                    className="flex items-center gap-1 text-xs p-2 h-auto col-span-2 md:col-span-1"
                  >
                    <Shield className="h-3 w-3" />
                    <span className="hidden sm:inline">Defense</span>
                    <span className="sm:hidden">DEF</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="goalkeeper"
                    className="flex items-center gap-1 text-xs p-2 h-auto"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">GK</span>
                    <span className="sm:hidden">GK</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="special"
                    className="flex items-center gap-1 text-xs p-2 h-auto"
                  >
                    <Settings className="h-3 w-3" />
                    <span className="hidden sm:inline">Special</span>
                    <span className="sm:hidden">SPC</span>
                  </TabsTrigger>
                </TabsList>

                {[
                  "offensive",
                  "physical",
                  "defensive",
                  "goalkeeper",
                  "special",
                ].map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAttributesByCategory(category).map((attr) => (
                        <div key={attr.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {attr.name}
                            </span>
                            <span className="font-semibold">
                              {attr.value}
                              {attr.max <= 4 ? `/${attr.max}` : ""}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                category === "offensive"
                                  ? "bg-red-500"
                                  : category === "physical"
                                  ? "bg-green-500"
                                  : category === "defensive"
                                  ? "bg-blue-500"
                                  : category === "goalkeeper"
                                  ? "bg-purple-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${(attr.value / attr.max) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Club & Match Info */}
          <div className="space-y-4">
            {/* Club Info */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Club Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Club</p>
                  <p className="font-semibold text-primary">
                    {player?.club || "No club assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Matches Played
                  </p>
                  <p className="font-semibold">{player.stats.matches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recent Form
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {recentForm.map((result, index) => (
                      <Badge
                        key={index}
                        className={`${getFormColor(
                          result
                        )} text-xs px-2 py-1 min-w-[24px] text-center`}
                        variant="secondary"
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Match */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextMatch ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Opponent</p>
                      <p className="font-semibold">
                        {getTeamName(nextMatch.homeTeam) === player?.club
                          ? getTeamName(nextMatch.awayTeam)
                          : getTeamName(nextMatch.homeTeam)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(
                            nextMatch.scheduledDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">
                          {new Date(nextMatch.scheduledDate).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full football-button text-sm px-2 py-2 h-auto">
                      <span className="truncate">View Match Details</span>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">No upcoming matches</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="football-button">
            <TrendingUp className="h-4 w-4 mr-2" />
            Train Stats
          </Button>
          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
          >
            <Award className="h-4 w-4 mr-2" />
            View Skills
          </Button>
          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Match Schedule
          </Button>
          <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Character
          </Button>
        </div>
      </div>
    </div>
  );
}
