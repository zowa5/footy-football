import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Trophy,
  DollarSign,
  Activity,
  Shield,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { useReports } from "@/hooks/api";
import { ColumnDef } from "@tanstack/react-table";

// Column definitions for different report types
const userActivityColumns: ColumnDef<any>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "manager" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];

const financialColumns: ColumnDef<any>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "purchase" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return `$${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "userId.username",
    header: "User",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];

const clubPerformanceColumns: ColumnDef<any>[] = [
  {
    accessorKey: "clubName",
    header: "Club Name",
  },
  {
    accessorKey: "managerName",
    header: "Manager",
  },
  {
    accessorKey: "playerCount",
    header: "Players",
  },
  {
    accessorKey: "matchesPlayed",
    header: "Matches",
  },
  {
    accessorKey: "matchesWon",
    header: "Wins",
  },
  {
    accessorKey: "winRate",
    header: "Win Rate",
    cell: ({ row }) => {
      const winRate = row.getValue("winRate") as string;
      return <Badge variant="outline">{winRate}</Badge>;
    },
  },
  {
    accessorKey: "totalEarnings",
    header: "Earnings",
    cell: ({ row }) => {
      const earnings = row.getValue("totalEarnings") as number;
      return `$${earnings.toLocaleString()}`;
    },
  },
];

const systemLogsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string;
      const variant =
        level === "ERROR"
          ? "destructive"
          : level === "WARNING"
          ? "secondary"
          : "default";
      return <Badge variant={variant}>{level}</Badge>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "adminId.username",
    header: "Admin",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];

export default function Analytics() {
  const [reportType, setReportType] = useState<string>("overview");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);

  const {
    data: reportData,
    isLoading,
    refetch,
  } = useReports({
    type: reportType,
    startDate,
    endDate,
    page,
    limit: 10,
  });

  const handleDateRangeChange = () => {
    setPage(1);
    refetch();
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting report...");
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!reportData?.data) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      );
    }

    switch (reportType) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.data.overview?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active: {reportData.data.overview?.activeUsers || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Clubs
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.data.overview?.totalClubs || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(reportData.data.overview?.revenue || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Matches
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.data.overview?.totalMatches || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.data.recentActivity?.newUsers?.map(
                      (user: any) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.role}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.data.recentActivity?.systemAlerts?.map(
                      (alert: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Badge
                            variant={
                              alert.type === "error"
                                ? "destructive"
                                : alert.type === "warning"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {alert.type}
                          </Badge>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "user_activity":
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Activity Report</CardTitle>
              <p className="text-sm text-muted-foreground">
                Active users and registration trends
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userActivityColumns}
                data={reportData.data.activeUsers || []}
              />
            </CardContent>
          </Card>
        );

      case "financial":
        return (
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportData.data.financialSummary?.map((item: any) => (
                <Card key={item._id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {item._id.replace("_", " ")}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${item.totalAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.count} transactions
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={financialColumns}
                  data={reportData.data.transactions || []}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "club_performance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Club Performance Report</CardTitle>
              <p className="text-sm text-muted-foreground">
                Club statistics and performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={clubPerformanceColumns}
                data={reportData.data.clubs || []}
              />
            </CardContent>
          </Card>
        );

      case "system_logs":
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <p className="text-sm text-muted-foreground">
                System events and administrative actions
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={systemLogsColumns}
                data={reportData.data.logs || []}
              />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive system analytics and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <PieChart className="w-5 h-5" />
          <LineChart className="w-5 h-5" />
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Report Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="user_activity">User Activity</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="club_performance">
                    Club Performance
                  </SelectItem>
                  <SelectItem value="system_logs">System Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleDateRangeChange} className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Apply
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
}
