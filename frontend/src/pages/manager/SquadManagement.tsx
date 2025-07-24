import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerCard } from "@/components/PlayerCard";
import { EnergyBar } from "@/components/EnergyBar";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Crown,
  Settings,
  UserCheck,
  Clock
} from "lucide-react";

// Mock club and player data
const mockClubData = {
  name: "Thunder Bolts FC",
  founded: "2024",
  players: [
    {
      id: "1",
      name: "Alex Rodriguez",
      position: "Central Midfielder",
      overall: 78,
      energy: 85,
      maxEnergy: 100,
      stats: { goals: 12, assists: 18, rating: 7.8 },
      status: "active",
      joinDate: "2024-01-15"
    },
    {
      id: "2", 
      name: "Marcus Silva",
      position: "Striker",
      overall: 82,
      energy: 90,
      maxEnergy: 100,
      stats: { goals: 28, assists: 5, rating: 8.2 },
      status: "active",
      joinDate: "2024-01-10"
    },
    {
      id: "3",
      name: "Sarah Johnson", 
      position: "Fullback",
      overall: 75,
      energy: 70,
      maxEnergy: 100,
      stats: { goals: 3, assists: 14, rating: 7.4 },
      status: "resting",
      joinDate: "2024-02-01"
    },
    {
      id: "4",
      name: "David Chen",
      position: "Centre-Back", 
      overall: 80,
      energy: 95,
      maxEnergy: 100,
      stats: { goals: 4, assists: 2, rating: 7.9 },
      status: "active",
      joinDate: "2024-01-20"
    },
    {
      id: "5",
      name: "Emma Wilson",
      position: "Goalkeeper",
      overall: 77,
      energy: 100,
      maxEnergy: 100,
      stats: { goals: 0, assists: 1, rating: 7.6 },
      status: "active",
      joinDate: "2024-01-25"
    }
  ],
  settings: {
    maxPlayers: 25,
    recruitmentOpen: true,
    minOverall: 70
  }
};

export default function SquadManagement() {
  const [clubData, setClubData] = useState(mockClubData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const positions = ["all", "Goalkeeper", "Centre-Back", "Fullback", "Defensive Midfielder", 
                    "Central Midfielder", "Attacking Midfielder", "Winger", "Striker"];

  const filteredPlayers = clubData.players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === "all" || player.position === filterPosition;
    const matchesStatus = filterStatus === "all" || player.status === filterStatus;
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground">Active</Badge>;
      case "resting":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Resting</Badge>;
      case "injured":
        return <Badge variant="destructive">Injured</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAverageStats = () => {
    const totalPlayers = clubData.players.length;
    if (totalPlayers === 0) return { overall: 0, energy: 0, goals: 0, assists: 0 };

    const totals = clubData.players.reduce((acc, player) => ({
      overall: acc.overall + player.overall,
      energy: acc.energy + player.energy,
      goals: acc.goals + player.stats.goals,
      assists: acc.assists + player.stats.assists
    }), { overall: 0, energy: 0, goals: 0, assists: 0 });

    return {
      overall: Math.round(totals.overall / totalPlayers),
      energy: Math.round(totals.energy / totalPlayers),
      goals: totals.goals,
      assists: totals.assists
    };
  };

  const stats = getAverageStats();

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">Squad Management</h1>
            <p className="text-muted-foreground">{clubData.name} • {clubData.players.length}/{clubData.settings.maxPlayers} Players</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="football-button">
              <Plus className="h-4 w-4 mr-2" />
              Recruit Player
            </Button>
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Settings className="h-4 w-4 mr-2" />
              Club Settings
            </Button>
          </div>
        </div>

        {/* Club Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Squad Size</p>
                  <p className="text-2xl font-bold">{clubData.players.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Overall</p>
                  <p className="text-2xl font-bold">{stats.overall}</p>
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
                  <p className="text-sm text-muted-foreground">Active Players</p>
                  <p className="text-2xl font-bold">
                    {clubData.players.filter(p => p.status === "active").length}
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
                <Select value={filterPosition} onValueChange={setFilterPosition}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position === "all" ? "All Positions" : position}
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
                    <SelectItem value="resting">Resting</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
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
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">{player.position}</p>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant="outline" className="text-primary border-primary/50">
                          OVR {player.overall}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Energy</p>
                        <EnergyBar current={player.energy} max={player.maxEnergy} showText={false} />
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-semibold">{player.stats.goals}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-semibold">{player.stats.assists}</p>
                        <p className="text-xs text-muted-foreground">Assists</p>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2">
                        {getStatusBadge(player.status)}
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.goals}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{stats.assists}</p>
                <p className="text-sm text-muted-foreground">Total Assists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">{stats.overall}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{stats.energy}%</p>
                <p className="text-sm text-muted-foreground">Squad Fitness</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}