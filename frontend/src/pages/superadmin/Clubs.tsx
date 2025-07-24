import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Trophy, Star } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const clubColumns = [
  {
    accessorKey: "name",
    header: "Club Name",
  },
  {
    accessorKey: "manager",
    header: "Manager",
  },
  {
    accessorKey: "players",
    header: "Players",
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
              : status === "pending"
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
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span>{row.getValue("rating")}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const club = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            View
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            Delete
          </Button>
        </div>
      );
    },
  },
];

const demoClubs = [
  {
    name: "FC United",
    manager: "John Manager",
    players: 23,
    status: "active",
    rating: 4.5,
  },
  {
    name: "City Warriors",
    manager: "Sarah Coach",
    players: 18,
    status: "active",
    rating: 4.2,
  },
  {
    name: "New Team",
    manager: "Pending",
    players: 0,
    status: "pending",
    rating: 0,
  },
];

export default function ClubsManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clubs Management</h1>
        <Button>
          <Shield className="mr-2 h-4 w-4" />
          Add New Club
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">+12 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Players
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7,842</div>
            <p className="text-xs text-muted-foreground">Across all clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active competitions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clubs List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={clubColumns} data={demoClubs} />
        </CardContent>
      </Card>
    </div>
  );
}
