import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Trophy,
  Clock,
  Users,
  Target,
  AlertTriangle,
  RotateCcw,
  Eye,
  Filter,
} from "lucide-react";
import { useMatches } from "@/hooks/api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

interface MatchEvent {
  minute: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  playerId?: string;
  description: string;
}

interface MatchResult {
  homeScore: number;
  awayScore: number;
  winner?: "home" | "away" | "draw";
  duration: number;
  events: MatchEvent[];
}

interface Team {
  id: string;
  name: string;
  username: string;
  type: "player" | "manager";
  clubName?: string;
}

interface Match {
  _id: string;
  homeTeam: Team;
  awayTeam: Team;
  type: string;
  status: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  matchday: string;
  tournament?: {
    id: string;
    name: string;
  };
  result?: MatchResult;
  statistics: {
    totalGoals: number;
    yellowCards: number;
    redCards: number;
    substitutions: number;
    events: number;
  };
  rewards?: {
    homeTeam: { coins: number; experience: number };
    awayTeam: { coins: number; experience: number };
  };
}

// Helper function for formatting date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

// Helper function for getting event icons
const getEventIcon = (type: string) => {
  switch (type) {
    case "goal":
      return "⚽";
    case "yellow_card":
      return "🟨";
    case "red_card":
      return "🟥";
    case "substitution":
      return "🔄";
    default:
      return "📝";
  }
};

export default function MatchReports() {
  const [selectedMatchday, setSelectedMatchday] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: matchData,
    isLoading,
    isFetching,
    refetch,
  } = useMatches({
    page,
    limit: 10,
    matchday:
      selectedMatchday && selectedMatchday !== "all"
        ? selectedMatchday
        : undefined,
    status:
      selectedStatus && selectedStatus !== "all" ? selectedStatus : undefined,
    type: selectedType && selectedType !== "all" ? selectedType : undefined,
    club: selectedClub && selectedClub !== "all" ? selectedClub : undefined,
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedMatchday, selectedStatus, selectedType, selectedClub]);

  const matches = matchData?.data?.matches || [];
  const matchDays = matchData?.data?.matchDays || [];
  const pagination = matchData?.data?.pagination;
  const summary = matchData?.data?.summary;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "scheduled":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleClearFilters = () => {
    setSelectedMatchday("");
    setSelectedStatus("");
    setSelectedType("");
    setSelectedClub("");
    setPage(1);
  };

  const handleViewMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const matchColumns: ColumnDef<Match>[] = [
    {
      accessorKey: "matchday",
      header: "Date",
      cell: ({ row }) => {
        const { date, time } = formatDateTime(row.original.scheduledAt);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{date}</span>
            <span className="text-sm text-muted-foreground">{time}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "teams",
      header: "Match",
      cell: ({ row }) => {
        const match = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{match.homeTeam.name}</span>
              <span className="text-xs text-muted-foreground">vs</span>
              <span className="font-medium">{match.awayTeam.name}</span>
            </div>
            {match.result && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg font-bold">
                  {match.result.homeScore} - {match.result.awayScore}
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="secondary" className="capitalize">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusColor(status)} className="capitalize">
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "statistics",
      header: "Events",
      cell: ({ row }) => {
        const stats = row.original.statistics;
        return (
          <div className="flex space-x-2 text-sm">
            <span title="Goals">⚽ {stats.totalGoals}</span>
            <span title="Yellow Cards">🟨 {stats.yellowCards}</span>
            <span title="Red Cards">🟥 {stats.redCards}</span>
            <span title="Substitutions">🔄 {stats.substitutions}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const match = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewMatch(match)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Detail
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Match Reports</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="stat-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Match Reports</h1>
        <Button onClick={() => refetch()} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <CardTitle className="text-sm font-medium">
                  Total Matches
                </CardTitle>
                <div className="text-2xl font-bold">
                  {summary?.totalMatches || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="text-2xl font-bold">
                  {summary?.completedMatches || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <div className="text-2xl font-bold">
                  {summary?.inProgressMatches || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <div className="text-2xl font-bold">
                  {summary?.scheduledMatches || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchday">Matchday</Label>
              <Select
                value={selectedMatchday}
                onValueChange={setSelectedMatchday}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select matchday" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All days</SelectItem>
                  {matchDays.map((day) => (
                    <SelectItem key={day.date} value={day.date}>
                      {new Date(day.date).toLocaleDateString()} ({day.count}{" "}
                      matches)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="ranked">Ranked</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger>
                  <SelectValue placeholder="Select club" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clubs</SelectItem>
                  {[
                    ...new Set(
                      matches
                        .flatMap((match) => [
                          match.homeTeam.clubName,
                          match.awayTeam.clubName,
                        ])
                        .filter(Boolean)
                    ),
                  ]
                    .sort()
                    .map((club) => (
                      <SelectItem key={club} value={club}>
                        {club}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={matchColumns} data={matches} />

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} matches
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1 || isFetching}
                >
                  Previous
                </Button>
                <div className="text-sm flex items-center space-x-2">
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  {isFetching && (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
          </DialogHeader>
          {selectedMatch && <MatchDetailContent match={selectedMatch} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Match Detail Component
function MatchDetailContent({ match }: { match: Match | null }) {
  if (!match) return null;

  const { date, time } = formatDateTime(match.scheduledAt);

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-right">
            <h3 className="text-lg font-bold">{match.homeTeam.name}</h3>
            <p className="text-sm text-muted-foreground">
              {match.homeTeam.username}
            </p>
            {match.homeTeam.clubName && (
              <p className="text-xs text-muted-foreground">
                {match.homeTeam.clubName}
              </p>
            )}
          </div>

          <div className="text-center">
            {match.result ? (
              <div className="text-4xl font-bold">
                {match.result.homeScore} - {match.result.awayScore}
              </div>
            ) : (
              <div className="text-2xl text-muted-foreground">vs</div>
            )}
            <Badge variant="outline" className="mt-2">
              {match.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="text-left">
            <h3 className="text-lg font-bold">{match.awayTeam.name}</h3>
            <p className="text-sm text-muted-foreground">
              {match.awayTeam.username}
            </p>
            {match.awayTeam.clubName && (
              <p className="text-xs text-muted-foreground">
                {match.awayTeam.clubName}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            {date} at {time}
          </p>
          {match.tournament && <p>Tournament: {match.tournament.name}</p>}
        </div>
      </div>

      {/* Match Information */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Match Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="secondary" className="capitalize">
                {match.type}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize">
                {match.status.replace("_", " ")}
              </Badge>
            </div>
            {match.result && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{match.result.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winner:</span>
                  <span className="capitalize">
                    {match.result.winner || "Draw"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">⚽ Goals:</span>
              <span>{match.statistics.totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">🟨 Yellow Cards:</span>
              <span>{match.statistics.yellowCards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">🟥 Red Cards:</span>
              <span>{match.statistics.redCards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">🔄 Substitutions:</span>
              <span>{match.statistics.substitutions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Events */}
      {match.result && match.result.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Minute</TableHead>
                  <TableHead className="w-16">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {match.result.events.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {event.minute}'
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-lg"
                        title={event.type.replace("_", " ")}
                      >
                        {getEventIcon(event.type)}
                      </span>
                    </TableCell>
                    <TableCell>{event.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Rewards */}
      {match.rewards && (
        <Card>
          <CardHeader>
            <CardTitle>Match Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{match.homeTeam.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Coins:</span>
                    <span>{match.rewards.homeTeam.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{match.rewards.homeTeam.experience}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{match.awayTeam.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Coins:</span>
                    <span>{match.rewards.awayTeam.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{match.rewards.awayTeam.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
