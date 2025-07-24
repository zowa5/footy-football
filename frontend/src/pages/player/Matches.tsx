import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trophy, Calendar, Star, Users, Clock, MapPin } from "lucide-react";

// Mock upcoming matches data
const mockUpcomingMatches = [
  {
    id: 1,
    opponent: "Bayern Munich",
    date: "2025-07-26",
    time: "20:00",
    competition: "Champions League",
    venue: "Allianz Arena",
    awayGame: true
  },
  {
    id: 2,
    opponent: "Liverpool",
    date: "2025-07-29",
    time: "19:45",
    competition: "Premier League",
    venue: "Home Stadium",
    awayGame: false
  },
  {
    id: 3,
    opponent: "AC Milan",
    date: "2025-08-02",
    time: "21:00",
    competition: "Champions League",
    venue: "San Siro",
    awayGame: true
  }
];

// Mock match history data
const mockMatches = [
  {
    id: 1,
    opponent: "FC Barcelona",
    result: "WIN",
    score: "3-1",
    date: "2025-07-24",
    gp: 150,
    competition: "Champions League",
    details: {
      possession: 55,
      shots: 12,
      shotsOnTarget: 7,
      passes: 423,
      tackles: 15,
      goals: [
        { player: "Your Player", minute: 23 },
        { player: "Teammate 1", minute: 45 },
        { player: "Your Player", minute: 78 }
      ]
    }
  },
  {
    id: 2,
    opponent: "Real Madrid",
    result: "LOSS",
    score: "1-2",
    date: "2025-07-23",
    gp: 50,
    competition: "La Liga",
    details: {
      possession: 48,
      shots: 8,
      shotsOnTarget: 4,
      passes: 389,
      tackles: 12,
      goals: [
        { player: "Your Player", minute: 56 }
      ]
    }
  },
  {
    id: 3,
    opponent: "Manchester United",
    result: "DRAW",
    score: "2-2",
    date: "2025-07-22",
    gp: 75,
    competition: "Premier League",
    details: {
      possession: 52,
      shots: 10,
      shotsOnTarget: 6,
      passes: 405,
      tackles: 14,
      goals: [
        { player: "Teammate 2", minute: 34 },
        { player: "Your Player", minute: 89 }
      ]
    }
  },
  {
    id: 4,
    opponent: "Juventus",
    result: "WIN",
    score: "2-0",
    date: "2025-07-20",
    gp: 150,
    competition: "Serie A",
    details: {
      possession: 58,
      shots: 15,
      shotsOnTarget: 8,
      passes: 445,
      tackles: 18,
      goals: [
        { player: "Your Player", minute: 12 },
        { player: "Teammate 3", minute: 67 }
      ]
    }
  },
  {
    id: 5,
    opponent: "PSG",
    result: "WIN",
    score: "4-2",
    date: "2025-07-18",
    gp: 150,
    competition: "Champions League",
    details: {
      possession: 51,
      shots: 14,
      shotsOnTarget: 9,
      passes: 412,
      tackles: 16,
      goals: [
        { player: "Your Player", minute: 15 },
        { player: "Teammate 1", minute: 34 },
        { player: "Your Player", minute: 56 },
        { player: "Teammate 2", minute: 78 }
      ]
    }
  },
  {
    id: 6,
    opponent: "Arsenal",
    result: "LOSS",
    score: "1-3",
    date: "2025-07-15",
    gp: 50,
    competition: "Premier League",
    details: {
      possession: 45,
      shots: 9,
      shotsOnTarget: 4,
      passes: 378,
      tackles: 14,
      goals: [
        { player: "Your Player", minute: 23 }
      ]
    }
  },
  {
    id: 7,
    opponent: "Borussia Dortmund",
    result: "WIN",
    score: "3-0",
    date: "2025-07-12",
    gp: 150,
    competition: "Champions League",
    details: {
      possession: 62,
      shots: 18,
      shotsOnTarget: 10,
      passes: 468,
      tackles: 20,
      goals: [
        { player: "Your Player", minute: 34 },
        { player: "Teammate 1", minute: 56 },
        { player: "Teammate 3", minute: 89 }
      ]
    }
  },
  {
    id: 8,
    opponent: "Atletico Madrid",
    result: "DRAW",
    score: "1-1",
    date: "2025-07-09",
    gp: 75,
    competition: "La Liga",
    details: {
      possession: 49,
      shots: 11,
      shotsOnTarget: 5,
      passes: 395,
      tackles: 17,
      goals: [
        { player: "Your Player", minute: 67 }
      ]
    }
  },
  {
    id: 9,
    opponent: "Inter Milan",
    result: "WIN",
    score: "2-1",
    date: "2025-07-06",
    gp: 150,
    competition: "Serie A",
    details: {
      possession: 54,
      shots: 13,
      shotsOnTarget: 7,
      passes: 428,
      tackles: 15,
      goals: [
        { player: "Teammate 2", minute: 45 },
        { player: "Your Player", minute: 82 }
      ]
    }
  },
  {
    id: 10,
    opponent: "Chelsea",
    result: "DRAW",
    score: "2-2",
    date: "2025-07-03",
    gp: 75,
    competition: "Premier League",
    details: {
      possession: 50,
      shots: 12,
      shotsOnTarget: 6,
      passes: 402,
      tackles: 16,
      goals: [
        { player: "Your Player", minute: 23 },
        { player: "Teammate 1", minute: 78 }
      ]
    }
  }
];

export default function Matches() {
  const [selectedTab, setSelectedTab] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 5;
  
  // Calculate pagination
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = mockMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(mockMatches.length / matchesPerPage);

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

  const MatchCard = ({ match }: { match: typeof mockMatches[0] }) => {
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
              <h3 className="font-semibold text-lg mb-1">vs {match.opponent}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {match.date}
              </div>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              {match.competition}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Possession</div>
              <div className="font-semibold">{match.details.possession}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Shots (On Target)</div>
              <div className="font-semibold">{match.details.shots} ({match.details.shotsOnTarget})</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Passes</div>
              <div className="font-semibold">{match.details.passes}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Goals:</div>
            {match.details.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                {goal.minute}' - {goal.player}
              </div>
            ))}
          </div>
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
                {currentMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 mt-6">
                {mockUpcomingMatches.map((match) => (
                  <Card key={match.id} className="match-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">vs {match.opponent}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {match.date} at {match.time}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary">
                          {match.competition}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {match.venue} ({match.awayGame ? 'Away' : 'Home'})
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
