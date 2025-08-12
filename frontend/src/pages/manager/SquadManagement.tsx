import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerCard } from "@/components/PlayerCard";
import { EnergyBar } from "@/components/EnergyBar";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSquadData } from "@/hooks/useSquadData";

export default function SquadManagement() {
  const { squad, loading, error } = useSquadData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const positions = [
    "all",
    "GK",
    "CB",
    "LB",
    "RB",
    "CDM",
    "CM",
    "CAM",
    "LM",
    "RM",
    "LW",
    "RW",
    "ST",
  ];

  // Mapping function to convert position codes to readable labels
  const getPositionLabel = (positionCode: string) => {
    const positionMap: { [key: string]: string } = {
      GK: "Goalkeeper",
      CB: "Centre-Back",
      LB: "Left Back",
      RB: "Right Back",
      CDM: "Defensive Midfielder",
      CM: "Central Midfielder",
      CAM: "Attacking Midfielder",
      LM: "Left Midfielder",
      RM: "Right Midfielder",
      LW: "Left Winger",
      RW: "Right Winger",
      ST: "Striker",
    };
    return positionMap[positionCode] || positionCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Memuat data squad...</p>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-yellow-600">Data squad tidak tersedia</p>
        </div>
      </div>
    );
  }

  const filteredPlayers = squad.filter((player) => {
    const matchesSearch =
      player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.playerInfo?.position || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesPosition =
      filterPosition === "all" ||
      player.playerInfo?.position === filterPosition;
    const matchesStatus =
      filterStatus === "all" || (player.isActive ? "active" : "inactive");

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
    } else {
      return (
        <Badge variant="outline" className="text-red-500 border-red-500">
          Inactive
        </Badge>
      );
    }
  };

  const getAverageStats = () => {
    const totalPlayers = squad.length;
    if (totalPlayers === 0) return { energy: 0, goals: 0, assists: 0 };

    const totals = squad.reduce(
      (acc, player) => {
        const stats = player.stats;

        return {
          energy: acc.energy + (player.energy || 100),
          goals: acc.goals + (stats?.goals || 0),
          assists: acc.assists + (stats?.assists || 0),
        };
      },
      { energy: 0, goals: 0, assists: 0 }
    );

    return {
      energy: Math.round(totals.energy / totalPlayers),
      goals: totals.goals,
      assists: totals.assists,
    };
  };

  const stats = getAverageStats();

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Squad Management
            </h1>
            <p className="text-muted-foreground">
              Squad • {squad.length} Players
            </p>
          </div>
        </div>

        {/* Club Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Squad Size</p>
                  <p className="text-2xl font-bold">{squad.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Energy</p>
                  <p className="text-2xl font-bold">{stats.energy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Players
                  </p>
                  <p className="text-2xl font-bold">
                    {squad.filter((p) => p.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Player Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search Players</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={filterPosition}
                  onValueChange={setFilterPosition}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position === "all"
                          ? "All Positions"
                          : getPositionLabel(position)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterPosition("all");
                    setFilterStatus("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player List */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Squad Players ({filteredPlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No players found</p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map((player, index) => {
                  const playerInfo = player.playerInfo;
                  const stats = player.stats;

                  // Calculate overall rating
                  const overall = playerInfo
                    ? Math.round(
                        (playerInfo.offensiveAwareness +
                          playerInfo.dribbling +
                          playerInfo.finishing +
                          playerInfo.speed +
                          playerInfo.physicalContact +
                          playerInfo.stamina) /
                          6
                      )
                    : 70;

                  return (
                    <div
                      key={player._id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                          <h3 className="font-semibold">{player.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            {playerInfo?.position
                              ? getPositionLabel(playerInfo.position)
                              : "Unknown Position"}
                          </p>
                        </div>

                        <div className="text-center">
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/50"
                          >
                            OVR {overall}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Energy
                          </p>
                          <EnergyBar
                            current={player.energy || 100}
                            max={100}
                            showText={false}
                          />
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-semibold">
                            {stats?.goals || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Goals</p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-semibold">
                            {stats?.assists || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assists
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(player.isActive)}
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Squad Statistics */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Squad Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.goals}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">
                  {stats.assists}
                </p>
                <p className="text-sm text-muted-foreground">Total Assists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {stats.energy}%
                </p>
                <p className="text-sm text-muted-foreground">Squad Fitness</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
