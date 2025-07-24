import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, Flag, Timer, Activity } from "lucide-react";

const matchReportColumns = [
  {
    accessorKey: "matchId",
    header: "Match ID",
  },
  {
    accessorKey: "homeTeam",
    header: "Home Team",
  },
  {
    accessorKey: "awayTeam",
    header: "Away Team",
  },
  {
    accessorKey: "score",
    header: "Score",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "completed"
              ? "success"
              : status === "ongoing"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        </div>
      );
    },
  },
];

const demoMatches = [
  {
    matchId: "M123456",
    homeTeam: "FC United",
    awayTeam: "City Warriors",
    score: "2 - 1",
    status: "completed",
    date: "2025-07-24",
  },
  {
    matchId: "M123457",
    homeTeam: "Royal Eagles",
    awayTeam: "Metro Knights",
    score: "1 - 1",
    status: "ongoing",
    date: "2025-07-24",
  },
  {
    matchId: "M123458",
    homeTeam: "Valley FC",
    awayTeam: "Mountain United",
    score: "Cancelled",
    status: "cancelled",
    date: "2025-07-24",
  },
];

export default function MatchReports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Match Reports</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+48 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Matches
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={matchReportColumns} data={demoMatches} />
        </CardContent>
      </Card>
    </div>
  );
}
