import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Users, Trophy, Calendar, Coins } from "lucide-react";
import { useTournament } from "@/hooks/api";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tournamentData, isLoading } = useTournament(id!);
  const tournament = tournamentData?.data?.tournament;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading tournament details...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Tournament not found</div>
      </div>
    );
  }

  const statusMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    registration_open: { variant: "secondary", label: "Registration Open" },
    registration_closed: { variant: "outline", label: "Registration Closed" },
    in_progress: { variant: "default", label: "In Progress" },
    completed: { variant: "secondary", label: "Completed" },
    cancelled: { variant: "destructive", label: "Cancelled" },
  };

  const statusInfo = statusMap[tournament.status] || {
    variant: "outline",
    label: tournament.status,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/superadmin/tournaments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
        </div>
        <Button onClick={() => navigate(`/superadmin/tournaments/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Tournament
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Tournament Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <div className="mt-1">
                <Badge variant="outline">{tournament.type.toUpperCase()}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="mt-1 text-sm">
                {tournament.description || "No description available"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Current Participants
              </label>
              <div className="mt-1 text-2xl font-bold">
                {tournament.currentParticipants}/{tournament.maxParticipants}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Entry Fee
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="text-lg font-semibold">
                  {tournament.entryFee.toLocaleString()} coins
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Registration Period
              </label>
              <div className="mt-1 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Start:</span>{" "}
                  {new Date(
                    tournament.schedule.registrationStart
                  ).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">End:</span>{" "}
                  {new Date(
                    tournament.schedule.registrationEnd
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tournament Period
              </label>
              <div className="mt-1 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Start:</span>{" "}
                  {new Date(
                    tournament.schedule.tournamentStart
                  ).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">End:</span>{" "}
                  {new Date(
                    tournament.schedule.tournamentEnd
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Prize Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tournament.prizes?.map((prize, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">
                    {prize.title || `${prize.position} Place`}
                  </span>
                  <span className="text-lg font-bold">
                    {prize.coins.toLocaleString()} coins
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {tournament.participants && tournament.participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {tournament.participants.map((participant, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">
                    {participant.username || `Participant ${index + 1}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Registered:{" "}
                    {new Date(participant.joinedAt).toLocaleDateString()}
                  </div>
                  {participant.eliminated && (
                    <div className="text-sm text-red-500">Eliminated</div>
                  )}
                  {participant.finalPosition && (
                    <div className="text-sm text-green-600">
                      Position: {participant.finalPosition}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
