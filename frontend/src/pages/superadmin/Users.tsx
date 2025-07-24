import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserX, Shield } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const userColumns = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={
            role === "player"
              ? "default"
              : role === "manager"
              ? "secondary"
              : "destructive"
          }
        >
          {role}
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
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "suspended"
              ? "destructive"
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
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            Delete
          </Button>
        </div>
      );
    },
  },
];

const demoUsers = [
  {
    username: "john_player",
    email: "john@example.com",
    role: "player",
    status: "active",
  },
  {
    username: "sarah_manager",
    email: "sarah@example.com",
    role: "manager",
    status: "active",
  },
  {
    username: "blocked_user",
    email: "blocked@example.com",
    role: "player",
    status: "suspended",
  },
];

export default function UsersManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,423</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,892</div>
            <p className="text-xs text-muted-foreground">
              96.7% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suspended Users
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">531</div>
            <p className="text-xs text-muted-foreground">3.3% of total users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={userColumns} data={demoUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
