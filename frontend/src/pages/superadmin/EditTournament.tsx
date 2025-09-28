import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useTournament, useUpdateTournament } from "@/hooks/api";

interface PrizeStructure {
  position: string;
  amount: number;
}

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateTournament = useUpdateTournament();

  const { data: tournamentData, isLoading: dataLoading } = useTournament(id!);
  const tournament = tournamentData?.data?.tournament;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    maxParticipants: 32,
    entryFee: 0,
    registrationStart: "",
    registrationEnd: "",
    tournamentStart: "",
    tournamentEnd: "",
    status: "",
  });

  const [prizeStructure, setPrizeStructure] = useState<PrizeStructure[]>([
    { position: "1st Place", amount: 0 },
    { position: "2nd Place", amount: 0 },
    { position: "3rd Place", amount: 0 },
  ]);

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        description: tournament.description || "",
        type: tournament.type,
        maxParticipants: tournament.maxParticipants,
        entryFee: tournament.entryFee,
        registrationStart: new Date(tournament.schedule.registrationStart)
          .toISOString()
          .slice(0, 16),
        registrationEnd: new Date(tournament.schedule.registrationEnd)
          .toISOString()
          .slice(0, 16),
        tournamentStart: new Date(tournament.schedule.tournamentStart)
          .toISOString()
          .slice(0, 16),
        tournamentEnd: new Date(tournament.schedule.tournamentEnd)
          .toISOString()
          .slice(0, 16),
        status: tournament.status,
      });

      if (tournament.prizes && tournament.prizes.length > 0) {
        setPrizeStructure(
          tournament.prizes.map((prize) => ({
            position: prize.title || `${prize.position} Place`,
            amount: prize.coins,
          }))
        );
      }
    }
  }, [tournament]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrizeChange = (
    index: number,
    field: keyof PrizeStructure,
    value: string | number
  ) => {
    setPrizeStructure((prev) =>
      prev.map((prize, i) =>
        i === index ? { ...prize, [field]: value } : prize
      )
    );
  };

  const addPrize = () => {
    setPrizeStructure((prev) => [
      ...prev,
      { position: `${prev.length + 1}th Place`, amount: 0 },
    ]);
  };

  const removePrize = (index: number) => {
    if (prizeStructure.length > 1) {
      setPrizeStructure((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tournamentUpdateData = {
        id: id!,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        maxParticipants: formData.maxParticipants,
        entryFee: formData.entryFee,
        schedule: {
          registrationStart: formData.registrationStart,
          registrationEnd: formData.registrationEnd,
          tournamentStart: formData.tournamentStart,
          tournamentEnd: formData.tournamentEnd || undefined,
        },
        prizes: prizeStructure
          .filter((prize) => prize.amount > 0)
          .map((prize, index) => ({
            position: index + 1,
            coins: prize.amount,
            title: prize.position,
          })),
      };

      await updateTournament.mutateAsync(tournamentUpdateData);
      navigate(`/superadmin/tournaments/${id}`);
    } catch (error) {
      console.error("Error updating tournament:", error);
    }
  };

  if (dataLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading tournament...</div>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/superadmin/tournaments/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament
        </Button>
        <h1 className="text-3xl font-bold">
          Edit Tournament: {tournament.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="type">Tournament Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="group_stage">Group Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration_open">
                      Registration Open
                    </SelectItem>
                    <SelectItem value="registration_closed">
                      Registration Closed
                    </SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    handleInputChange(
                      "maxParticipants",
                      parseInt(e.target.value)
                    )
                  }
                  min="2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="entryFee">Entry Fee (coins)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) =>
                    handleInputChange("entryFee", parseInt(e.target.value))
                  }
                  min="0"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="registrationStart">Registration Start</Label>
                <Input
                  id="registrationStart"
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={(e) =>
                    handleInputChange("registrationStart", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="registrationEnd">Registration End</Label>
                <Input
                  id="registrationEnd"
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={(e) =>
                    handleInputChange("registrationEnd", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="tournamentStart">Tournament Start</Label>
                <Input
                  id="tournamentStart"
                  type="datetime-local"
                  value={formData.tournamentStart}
                  onChange={(e) =>
                    handleInputChange("tournamentStart", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="tournamentEnd">Tournament End</Label>
                <Input
                  id="tournamentEnd"
                  type="datetime-local"
                  value={formData.tournamentEnd}
                  onChange={(e) =>
                    handleInputChange("tournamentEnd", e.target.value)
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Prize Structure
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrize}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prize
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prizeStructure.map((prize, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Position (e.g., 1st Place)"
                      value={prize.position}
                      onChange={(e) =>
                        handlePrizeChange(index, "position", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Prize amount"
                      value={prize.amount}
                      onChange={(e) =>
                        handlePrizeChange(
                          index,
                          "amount",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                    />
                  </div>
                  {prizeStructure.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrize(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/superadmin/tournaments/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateTournament.isPending}>
            {updateTournament.isPending ? "Updating..." : "Update Tournament"}
          </Button>
        </div>
      </form>
    </div>
  );
}
