import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Bell, Users, Mail, Send, Trash2 } from "lucide-react";

const notificationColumns = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          variant={
            type === "announcement"
              ? "default"
              : type === "alert"
              ? "destructive"
              : "secondary"
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "recipients",
    header: "Recipients",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "sent"
              ? "success"
              : status === "scheduled"
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
    accessorKey: "scheduledFor",
    header: "Scheduled For",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

const demoNotifications = [
  {
    title: "Server Maintenance Notice",
    type: "announcement",
    recipients: "All Users",
    status: "scheduled",
    scheduledFor: "2025-07-25 02:00",
  },
  {
    title: "New Tournament Registration Open",
    type: "notification",
    recipients: "Club Managers",
    status: "sent",
    scheduledFor: "2025-07-24 12:00",
  },
  {
    title: "Critical Security Update",
    type: "alert",
    recipients: "System Admins",
    status: "draft",
    scheduledFor: "Not set",
  },
];

export default function Notifications() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            New Notification
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5k</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Pending notifications
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={notificationColumns} data={demoNotifications} />
        </CardContent>
      </Card>
    </div>
  );
}
