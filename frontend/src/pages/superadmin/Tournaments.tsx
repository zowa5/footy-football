import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, Plus } from "lucide-react";
import { useAdminTournaments } from "@/hooks/api";
import { ColumnDef } from "@tanstack/react-table";
import { Tournament } from "@/types/api";
import { useNavigate } from "react-router-dom";

export default function Tournaments() {
  const navigate = useNavigate();

  const {
    data: tournamentsData,
    isLoading,
    error,
  } = useAdminTournaments({
    page: 1,
    limit: 10,
  });

  const tournaments = tournamentsData?.data?.tournaments || [];

  const tournamentColumns: ColumnDef<Tournament>[] = [
    {
      accessorKey: "name",
      header: "Tournament Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <Badge variant="outline">{type.toUpperCase()}</Badge>;
      },
    },
    {
      header: "Participants",
      cell: ({ row }) => {
        const tournament = row.original;
        return `${tournament.currentParticipants}/${tournament.maxParticipants}`;
      },
    },
    {
      accessorKey: "entryFee",
      header: "Entry Fee",
      cell: ({ row }) => {
        const fee = row.getValue("entryFee") as number;
        return `${fee.toLocaleString()} coins`;
      },
    },
    {
      header: "Start Date",
      cell: ({ row }) => {
        const tournament = row.original;
        return new Date(
          tournament.schedule.tournamentStart
        ).toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusMap: Record<
          string,
          {
            variant: "default" | "secondary" | "destructive" | "outline";
            label: string;
          }
        > = {
          registration_open: {
            variant: "secondary",
            label: "Registration Open",
          },
          registration_closed: {
            variant: "outline",
            label: "Registration Closed",
          },
          in_progress: { variant: "default", label: "In Progress" },
          completed: { variant: "secondary", label: "Completed" },
          cancelled: { variant: "destructive", label: "Cancelled" },
        };
        const statusInfo = statusMap[status] || {
          variant: "outline",
          label: status,
        };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tournament = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/superadmin/tournaments/${tournament._id}`)
              }
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/superadmin/tournaments/${tournament._id}/edit`)
              }
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ];
  const summary = tournamentsData?.data?.summary || {
    totalTournaments: 0,
    activeTournaments: 0,
    upcomingTournaments: 0,
    completedTournaments: 0,
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error loading tournaments: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Button onClick={() => navigate("/superadmin/tournaments/create")}>
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
            <div className="text-2xl font-bold">
              {summary.activeTournaments}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tournaments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTournaments}</div>
            <p className="text-xs text-muted-foreground">
              All time tournaments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.upcomingTournaments}
            </div>
            <p className="text-xs text-muted-foreground">Registration open</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading tournaments...</div>
          ) : (
            <DataTable columns={tournamentColumns} data={tournaments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
