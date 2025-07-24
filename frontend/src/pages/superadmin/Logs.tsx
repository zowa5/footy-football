import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Info,
  Download,
  Bug,
  Shield,
  Search,
} from "lucide-react";

const logColumns = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string;
      return (
        <Badge
          variant={
            level === "error"
              ? "destructive"
              : level === "warning"
              ? "secondary"
              : "success"
          }
        >
          {level}
        </Badge>
      );
    },
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          Details
        </Button>
      );
    },
  },
];

const demoLogs = [
  {
    timestamp: "2025-07-24 13:45:23",
    level: "error",
    service: "Authentication",
    message: "Failed login attempt detected",
  },
  {
    timestamp: "2025-07-24 13:44:12",
    level: "warning",
    service: "Database",
    message: "High CPU usage detected",
  },
  {
    timestamp: "2025-07-24 13:42:55",
    level: "info",
    service: "Match Engine",
    message: "New match started successfully",
  },
];

export default function SystemLogs() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search Logs
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Errors
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <Bug className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">12</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info Logs</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">1.2k</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Events
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={logColumns} data={demoLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
