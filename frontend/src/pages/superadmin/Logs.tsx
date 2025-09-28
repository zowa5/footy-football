import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Info,
  Download,
  Bug,
  Shield,
  Search,
  Filter,
} from "lucide-react";
import { useSystemLogs } from "@/hooks/api";
import { SystemLog } from "@/types/api";

const logColumns = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const timestamp = row.getValue("createdAt") as string;
      return new Date(timestamp).toLocaleString();
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string;
      return (
        <Badge
          variant={
            level === "error" || level === "critical"
              ? "destructive"
              : level === "warning"
              ? "secondary"
              : "default"
          }
        >
          {level.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="outline">
          {category.replace("_", " ").toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return (
        <div className="max-w-md truncate" title={message}>
          {message}
        </div>
      );
    },
  },
  {
    accessorKey: "metadata.ip",
    header: "IP Address",
    cell: ({ row }) => {
      const log = row.original as SystemLog;
      return log.metadata?.ip || log.ipAddress || "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const log = row.original as SystemLog;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Show detailed view in modal or navigate to detail page
            console.log("View details for log:", log._id);
          }}
        >
          Details
        </Button>
      );
    },
  },
];

export default function SystemLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: logsResponse,
    isLoading,
    error,
  } = useSystemLogs({
    action: selectedCategory !== "all" ? selectedCategory : undefined,
    page: currentPage,
    limit: 20,
  });

  const logs = logsResponse?.data?.logs || [];
  const pagination = logsResponse?.data?.pagination;

  // Debug logging
  console.log("🔍 Logs Response:", logsResponse);
  console.log("🔍 Logs Data:", logs);
  console.log("🔍 Error:", error);

  // Calculate stats from logs
  const stats = {
    critical: logs.filter(
      (log) => log.level === "critical" || log.level === "error"
    ).length,
    warnings: logs.filter((log) => log.level === "warning").length,
    info: logs.filter((log) => log.level === "info").length,
    security: logs.filter(
      (log) => log.category === "security" || log.category === "auth"
    ).length,
  };

  const handleExport = () => {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }

    // Prepare log data for export
    const exportData = logs
      .map((log) => {
        const timestamp = new Date(log.createdAt).toLocaleString();
        const level = log.level.toUpperCase();
        const category = log.category.replace("_", " ").toUpperCase();
        const ip = log.metadata?.ip || log.ipAddress || "-";

        return `[${timestamp}] ${level} | ${category} | ${
          log.message
        } | IP: ${ip}${log.details ? ` | Details: ${log.details}` : ""}`;
      })
      .join("\n");

    // Create file content
    const fileContent = `System Logs Export
Generated on: ${new Date().toLocaleString()}
Total logs: ${logs.length}
Filter: ${selectedCategory !== "all" ? selectedCategory : "All Categories"}

${"=".repeat(80)}

${exportData}

${"=".repeat(80)}
End of Export`;

    // Create and download file
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("📁 Logs exported successfully");
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load system logs: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="user_management">User Management</SelectItem>
            <SelectItem value="tournament">Tournament</SelectItem>
            <SelectItem value="match">Match</SelectItem>
            <SelectItem value="store">Store</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical/Errors
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {stats.critical}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <Bug className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-yellow-500">
                {stats.warnings}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info Logs</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-blue-500">
                {stats.info}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Current page</p>
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
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.security}</div>
            )}
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent System Logs</CardTitle>
            {pagination && (
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                total)
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <DataTable columns={logColumns} data={logs} />

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
