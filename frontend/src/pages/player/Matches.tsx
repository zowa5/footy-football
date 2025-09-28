import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trophy, Calendar, Star, Users, Clock, MapPin } from "lucide-react";
import { usePlayerMatches } from "@/hooks/api";

export default function Matches() {
  const [selectedTab, setSelectedTab] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 5;

  // Fetch data from API
  const { data: matchesData, isLoading, error } = usePlayerMatches();

  // Debug logging
  console.log("🔍 Player Matches Data:", {
    matchesData,
    isLoading,
    error,
    recentMatches: matchesData?.recentMatches,
    upcomingMatches: matchesData?.upcomingMatches,
  });

  // Use API data or fallback to empty arrays
  const recentMatches = matchesData?.recentMatches || [];
  const upcomingMatches = matchesData?.upcomingMatches || [];

  // Calculate pagination for recent matches
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = recentMatches.slice(
    indexOfFirstMatch,
    indexOfLastMatch
  );
  const totalPages = Math.ceil(recentMatches.length / matchesPerPage);

  const getResultColor = (result: string) => {
    switch (result) {
      case "WIN":
        return "text-green-500";
      case "LOSS":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-football">Matches</h1>
            <p className="text-muted-foreground">
              View your match history and upcoming fixtures
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Match Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="grid grid-cols-3 gap-4">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-football">Matches</h1>
            <p className="text-muted-foreground">
              View your match history and upcoming fixtures
            </p>
          </div>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load match data: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const MatchCard = ({ match }: { match: any }) => {
    return (
      <Card className="match-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{match.score}</div>
              <div className={`font-semibold ${getResultColor(match.result)}`}>
                {match.result}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-medium">+{match.gp} GP</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                vs {match.opponent}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(match.date).toLocaleDateString()}
              </div>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              {match.competition}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Possession
              </div>
              <div className="font-semibold">{match.details.possession}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Shots (On Target)
              </div>
              <div className="font-semibold">
                {match.details.shots} ({match.details.shotsOnTarget})
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Passes</div>
              <div className="font-semibold">{match.details.passes}</div>
            </div>
          </div>

          {match.details?.goals && match.details.goals.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Goals:</div>
              {match.details.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  {goal.minute}' -{" "}
                  {goal.playerName || goal.player || "Unknown Player"}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-football">Matches</h1>
          <p className="text-muted-foreground">
            View your match history and upcoming fixtures
            {matchesData?.playerClub && (
              <span className="ml-2 font-medium text-primary">
                • {matchesData.playerClub}
              </span>
            )}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Match Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  Match History
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming Matches
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4 mt-6">
                {currentMatches.length > 0 ? (
                  <>
                    {currentMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i + 1)}
                                isActive={currentPage === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1)
                                )
                              }
                              disabled={currentPage === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No match history available
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 mt-6">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <Card key={match.id} className="match-card">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              vs {match.opponent}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                match.date
                              ).toLocaleDateString()} at {match.time}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-primary border-primary"
                          >
                            {match.competition}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {match.venue} ({match.awayGame ? "Away" : "Home"})
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No upcoming matches scheduled
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
