import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { EnergyBar } from "@/components/EnergyBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock data - would come from backend
const mockPlayerData = {
  name: "Alex Rodriguez",
  position: "Central Midfielder",
  overall: 78,
  energy: 85,
  maxEnergy: 100,
  club: "FC Thunderbolts",
  stats: {
    goals: 12,
    assists: 18,
    matches: 24,
    rating: 7.8,
  },
  nextMatch: {
    opponent: "Lightning United",
    date: "2024-01-25",
    time: "19:00",
  },
  recentForm: ["W", "W", "D", "W", "L"],
};

const playerAttributes = [
  // Offensive Attributes
  { name: "Offensive Awareness", value: 82, max: 99, category: "offensive" },
  { name: "Ball Control", value: 78, max: 99, category: "offensive" },
  { name: "Dribbling", value: 75, max: 99, category: "offensive" },
  { name: "Tight Possession", value: 73, max: 99, category: "offensive" },
  { name: "Low Pass", value: 85, max: 99, category: "offensive" },
  { name: "Lofted Pass", value: 80, max: 99, category: "offensive" },
  { name: "Finishing", value: 70, max: 99, category: "offensive" },
  { name: "Heading", value: 68, max: 99, category: "offensive" },
  { name: "Place Kicking", value: 65, max: 99, category: "offensive" },
  { name: "Curl", value: 72, max: 99, category: "offensive" },

  // Physical Attributes
  { name: "Speed", value: 77, max: 99, category: "physical" },
  { name: "Acceleration", value: 79, max: 99, category: "physical" },
  { name: "Kicking Power", value: 74, max: 99, category: "physical" },
  { name: "Jump", value: 71, max: 99, category: "physical" },
  { name: "Physical Contact", value: 76, max: 99, category: "physical" },
  { name: "Balance", value: 81, max: 99, category: "physical" },
  { name: "Stamina", value: 83, max: 99, category: "physical" },

  // Defensive Attributes
  { name: "Defensive Awareness", value: 69, max: 99, category: "defensive" },
  { name: "Ball Winning", value: 72, max: 99, category: "defensive" },
  { name: "Aggression", value: 67, max: 99, category: "defensive" },

  // Goalkeeper Attributes
  { name: "GK Awareness", value: 25, max: 99, category: "goalkeeper" },
  { name: "GK Catching", value: 25, max: 99, category: "goalkeeper" },
  { name: "GK Clearing", value: 25, max: 99, category: "goalkeeper" },
  { name: "GK Reflexes", value: 25, max: 99, category: "goalkeeper" },
  { name: "GK Reach", value: 25, max: 99, category: "goalkeeper" },

  // Special Attributes
  { name: "Weak Foot Usage", value: 2, max: 4, category: "special" },
  { name: "Weak Foot Accuracy", value: 2, max: 4, category: "special" },
  { name: "Form", value: 6, max: 8, category: "special" },
  { name: "Injury Resistance", value: 2, max: 3, category: "special" },
];

export default function PlayerDashboard() {
  const [player] = useState(mockPlayerData);
  const [selectedAttributeTab, setSelectedAttributeTab] = useState("offensive");

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
            <p className="text-muted-foreground">Welcome back, {player.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary/50">
              {player.position}
            </Badge>
            <Badge variant="secondary">Overall: {player.overall}</Badge>
          </div>
        </div>

        {/* Energy & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <EnergyBar current={player.energy} max={player.maxEnergy} />
            </CardContent>
          </Card>

          <StatCard
            title="Goals"
            value={player.stats.goals}
            icon={<Target className="h-4 w-4 text-primary" />}
            trend="up"
          />

          <StatCard
            title="Assists"
            value={player.stats.assists}
            icon={<Zap className="h-4 w-4 text-accent" />}
            trend="up"
          />

          <StatCard
            title="Match Rating"
            value={player.stats.rating}
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
                  <p className="font-semibold text-primary">{player.club}</p>
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
                    {player.recentForm.map((result, index) => (
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
                <div>
                  <p className="text-sm text-muted-foreground">Opponent</p>
                  <p className="font-semibold">{player.nextMatch.opponent}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">
                      {player.nextMatch.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">
                      {player.nextMatch.time}
                    </p>
                  </div>
                </div>
                <Button className="w-full football-button text-sm px-2 py-2 h-auto">
                  <span className="truncate">View Match Details</span>
                </Button>
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
