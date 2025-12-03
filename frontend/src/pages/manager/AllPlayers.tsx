import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

interface Player {
  _id: string;
  username: string;
  playerInfo?: {
    firstName?: string;
    lastName?: string;
    position?: string;
    club?: string;
    age?: number;
    height?: number;
    weight?: number;
    nationality?: string;
  };
  coins?: number;
  createdAt?: string;
}

export default function AllPlayers() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [clubFilter, setClubFilter] = useState<"all" | "with-club" | "without-club">("all");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load players on mount
  const loadPlayers = async () => {
    setIsLoading(true);
    setError("");
    try {
      console.log("Loading all players...");
      
      const data = await apiClient.getAllPlayers();
      console.log("Players data received:", data);
      setPlayers(data.data?.players || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load players";
      setError(errorMessage);
      console.error("Error loading players:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load players on mount
  useEffect(() => {
    loadPlayers();
  }, []);

  // Filter and search players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        player.username?.toLowerCase().includes(searchLower) ||
        player.playerInfo?.firstName?.toLowerCase().includes(searchLower) ||
        player.playerInfo?.lastName?.toLowerCase().includes(searchLower) ||
        player.playerInfo?.position?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Club filter
      if (clubFilter === "with-club") {
        return player.playerInfo?.club && player.playerInfo.club !== "Free Agent";
      } else if (clubFilter === "without-club") {
        return !player.playerInfo?.club || player.playerInfo.club === "Free Agent";
      }

      return true;
    });
  }, [players, searchQuery, clubFilter]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Players</h1>
          <p className="text-muted-foreground mt-1">
            Browse and view all players available on the platform
          </p>
        </div>
        <Button onClick={loadPlayers} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Player</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Club Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Club Status</label>
              <Select value={clubFilter} onValueChange={(value: "all" | "with-club" | "without-club") => setClubFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Players</SelectItem>
                  <SelectItem value="with-club">With Club</SelectItem>
                  <SelectItem value="without-club">Without Club</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          Showing {filteredPlayers.length} of {players.length} players
        </span>
      </div>

      {/* Players Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <Card key={player._id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {player.playerInfo?.firstName || ""}{" "}
                      {player.playerInfo?.lastName || player.username}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">@{player.username}</p>
                  </div>
                  <Badge
                    variant={
                      player.playerInfo?.club && player.playerInfo.club !== "Free Agent"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {player.playerInfo?.club || "Free Agent"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Position */}
                {player.playerInfo?.position && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Position:</span>
                    <span className="font-semibold uppercase text-sm">
                      {player.playerInfo.position}
                    </span>
                  </div>
                )}

                {/* Age */}
                {player.playerInfo?.age && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="font-semibold">{player.playerInfo.age}</span>
                  </div>
                )}

                {/* Height & Weight */}
                {(player.playerInfo?.height || player.playerInfo?.weight) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Physical:</span>
                    <span className="font-semibold text-sm">
                      {player.playerInfo?.height}cm / {player.playerInfo?.weight}kg
                    </span>
                  </div>
                )}

                {/* Nationality */}
                {player.playerInfo?.nationality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nationality:</span>
                    <span className="font-semibold text-sm">
                      {player.playerInfo.nationality}
                    </span>
                  </div>
                )}

                {/* Coins */}
                {player.coins !== undefined && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Coins:</span>
                    <span className="font-semibold text-primary">
                      {player.coins.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {players.length === 0
                ? "No players found. Click refresh to load players."
                : "No players match your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
