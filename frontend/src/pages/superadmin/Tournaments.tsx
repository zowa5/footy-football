import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Plus } from "lucide-react";

const tournamentColumns = [
  {
    accessorKey: "name",
    header: "Tournament Name",
  },
  {
    accessorKey: "teams",
    header: "Teams",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "upcoming"
              ? "secondary"
              : "outline"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            View
          </Button>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      );
    },
  },
];

const demoTournaments = [
  {
    name: "Summer Championship 2025",
    teams: 16,
    startDate: "2025-08-01",
    endDate: "2025-08-30",
    status: "upcoming",
  },
  {
    name: "Premier League 2025",
    teams: 20,
    startDate: "2025-07-01",
    endDate: "2026-05-30",
    status: "active",
  },
  {
    name: "Spring Cup 2025",
    teams: 32,
    startDate: "2025-03-01",
    endDate: "2025-06-30",
    status: "completed",
  },
];

export default function Tournaments() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tournaments
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              Across all tournaments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Starting this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={tournamentColumns} data={demoTournaments} />
        </CardContent>
      </Card>
    </div>
  );
}
