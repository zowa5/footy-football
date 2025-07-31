import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Activity,
  Globe,
  Shield,
  Bell,
  Server,
  Calendar,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/api";
import type { User, Match } from "@/types/api";

export default function SuperAdminDashboard() {
  const { data: dashboardStats, isLoading, error } = useDashboardStats();

  // Debug logging
  console.log("🔍 SuperAdmin Dashboard Data:", {
    dashboardStats,
    isLoading,
    error,
    dataExists: !!dashboardStats,
    usersData: dashboardStats?.data?.users,
    tournamentsData: dashboardStats?.data?.tournaments,
    recentActivity: dashboardStats?.data?.recentActivity,
    systemStats: {
      matches: dashboardStats?.data?.matches,
      store: dashboardStats?.data?.store,
      transactions: dashboardStats?.data?.transactions,
    },
  });

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardStats?.data?.users?.total?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.data?.users?.active || 0} active users
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardStats?.data?.users?.managers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.data?.users?.players || 0} total players
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tournaments
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardStats?.data?.tournaments?.active || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.data?.tournaments?.total || 0} total
                  tournaments
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recent Users */}
                {dashboardStats?.data?.recentActivity?.users
                  ?.slice(0, 3)
                  .map((user: User, i: number) => (
                    <div key={`user-${i}`} className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        New {user.role} registered:{" "}
                        <strong>{user.username}</strong>
                        <span className="text-muted-foreground ml-1">
                          ({user.email})
                        </span>
                      </span>
                    </div>
                  ))}

                {/* Recent Matches */}
                {dashboardStats?.data?.recentActivity?.matches
                  ?.slice(0, 3)
                  .map((match: Match, i: number) => (
                    <div key={`match-${i}`} className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Match created: ID <strong>{match._id}</strong>
                        <span className="text-muted-foreground ml-1">
                          ({match.status})
                        </span>
                      </span>
                    </div>
                  ))}

                {/* Show message if no activity */}
                {!dashboardStats?.data?.recentActivity?.users?.length &&
                  !dashboardStats?.data?.recentActivity?.matches?.length && (
                    <div className="text-sm text-muted-foreground">
                      No recent activity
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Total Matches:{" "}
                    <strong>
                      {dashboardStats?.data?.matches?.total?.toLocaleString() ||
                        0}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Active Matches:{" "}
                    <strong>
                      {dashboardStats?.data?.matches?.active || 0}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Completed Matches:{" "}
                    <strong>
                      {dashboardStats?.data?.matches?.completed || 0}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">
                    Store Items:{" "}
                    <strong>{dashboardStats?.data?.store?.items || 0}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">
                    Total Purchases:{" "}
                    <strong>
                      {dashboardStats?.data?.store?.purchases?.toLocaleString() ||
                        0}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">
                    Revenue:{" "}
                    <strong>
                      $
                      {dashboardStats?.data?.transactions?.revenue?.toLocaleString() ||
                        0}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
