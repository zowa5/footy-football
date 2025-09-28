import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnergyBar } from "@/components/EnergyBar";
import { useAIPlayers } from "@/hooks/useAIPlayers";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

// AI Player interface from the hook
interface AIPlayer {
  id: string;
  username: string;
  profilePicture: string;
  bio: string;
  playerInfo: {
    firstName: string;
    lastName: string;
    position: string;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    club: string;
    offensiveAwareness: number;
    dribbling: number;
    lowPass: number;
    finishing: number;
    placeKicking: number;
    speed: number;
    kickingPower: number;
    physicalContact: number;
    stamina: number;
    ballWinning: number;
    ballControl: number;
    tightPossession: number;
    loftedPass: number;
    heading: number;
    curl: number;
    acceleration: number;
    jump: number;
    balance: number;
    defensiveAwareness: number;
    aggression: number;
    gkAwareness: number;
    gkClearing: number;
    gkReach: number;
    gkCatching: number;
    gkReflexes: number;
    weakFootUsage: number;
    weakFootAcc: number;
    form: number;
    injuryResistance: number;
    style: string;
  };
  energy: number;
  coins: number;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    tournamentsWon: number;
    skillPoints: number;
    totalEarnings: number;
  };
  overall: number;
}
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  Zap,
  Star,
  Users,
  Globe,
  TrendingUp,
  Calendar,
  Award,
  Shirt,
  Clock,
  Loader2,
  AlertCircle,
  X,
  Shield,
} from "lucide-react";

// Position mappings - sesuai format yang digunakan di aplikasi
const positionLabels: { [key: string]: string } = {
  GK: "Goalkeeper",
  CB: "Centre Back",
  LB: "Left Back",
  RB: "Right Back",
  CDM: "Central Defensive Midfielder",
  CM: "Central Midfielder",
  CAM: "Central Attacking Midfielder",
  LM: "Left Midfielder",
  RM: "Right Midfielder",
  LW: "Left Winger",
  RW: "Right Winger",
  ST: "Striker",
  CF: "Centre Forward",
};

// Helper function to get skill color based on value
const getSkillColor = (value: number) => {
  if (value >= 90) return "text-green-600 font-bold";
  if (value >= 80) return "text-blue-600 font-semibold";
  if (value >= 70) return "text-yellow-600";
  if (value >= 60) return "text-orange-600";
  return "text-red-600";
};

// PlayerStatsModal Component
interface PlayerStatsModalProps {
  player: AIPlayer;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerStatsModal = ({
  player,
  isOpen,
  onClose,
}: PlayerStatsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{player.profilePicture}</span>
            <div>
              <h2 className="text-xl font-bold">{player.username}</h2>
              <p className="text-muted-foreground">
                {player.playerInfo.firstName} {player.playerInfo.lastName} |{" "}
                {positionLabels[player.playerInfo.position] ||
                  player.playerInfo.position}
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/50 font-bold ml-auto">
              OVR {player.overall}
            </Badge>
          </DialogTitle>
          <DialogDescription>{player.bio}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skills & Attributes</TabsTrigger>
            <TabsTrigger value="stats">Career Statistics</TabsTrigger>
            <TabsTrigger value="info">Player Information</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attacking Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Attacking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Offensive Awareness:</span>
                    <span
                      className={getSkillColor(
                        player.playerInfo.offensiveAwareness
                      )}
                    >
                      {player.playerInfo.offensiveAwareness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finishing:</span>
                    <span
                      className={getSkillColor(player.playerInfo.finishing)}
                    >
                      {player.playerInfo.finishing}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heading:</span>
                    <span className={getSkillColor(player.playerInfo.heading)}>
                      {player.playerInfo.heading}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Place Kicking:</span>
                    <span
                      className={getSkillColor(player.playerInfo.placeKicking)}
                    >
                      {player.playerInfo.placeKicking}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Curl:</span>
                    <span className={getSkillColor(player.playerInfo.curl)}>
                      {player.playerInfo.curl}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Ball Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Ball Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ball Control:</span>
                    <span
                      className={getSkillColor(player.playerInfo.ballControl)}
                    >
                      {player.playerInfo.ballControl}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dribbling:</span>
                    <span
                      className={getSkillColor(player.playerInfo.dribbling)}
                    >
                      {player.playerInfo.dribbling}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tight Possession:</span>
                    <span
                      className={getSkillColor(
                        player.playerInfo.tightPossession
                      )}
                    >
                      {player.playerInfo.tightPossession}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Pass:</span>
                    <span className={getSkillColor(player.playerInfo.lowPass)}>
                      {player.playerInfo.lowPass}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lofted Pass:</span>
                    <span
                      className={getSkillColor(player.playerInfo.loftedPass)}
                    >
                      {player.playerInfo.loftedPass}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Physical */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Physical
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className={getSkillColor(player.playerInfo.speed)}>
                      {player.playerInfo.speed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acceleration:</span>
                    <span
                      className={getSkillColor(player.playerInfo.acceleration)}
                    >
                      {player.playerInfo.acceleration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical Contact:</span>
                    <span
                      className={getSkillColor(
                        player.playerInfo.physicalContact
                      )}
                    >
                      {player.playerInfo.physicalContact}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jump:</span>
                    <span className={getSkillColor(player.playerInfo.jump)}>
                      {player.playerInfo.jump}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamina:</span>
                    <span className={getSkillColor(player.playerInfo.stamina)}>
                      {player.playerInfo.stamina}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance:</span>
                    <span className={getSkillColor(player.playerInfo.balance)}>
                      {player.playerInfo.balance}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Defending */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    Defending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Defensive Awareness:</span>
                    <span
                      className={getSkillColor(
                        player.playerInfo.defensiveAwareness
                      )}
                    >
                      {player.playerInfo.defensiveAwareness}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ball Winning:</span>
                    <span
                      className={getSkillColor(player.playerInfo.ballWinning)}
                    >
                      {player.playerInfo.ballWinning}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aggression:</span>
                    <span
                      className={getSkillColor(player.playerInfo.aggression)}
                    >
                      {player.playerInfo.aggression}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Goalkeeping */}
              {player.playerInfo.position === "GK" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Goalkeeping
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>GK Awareness:</span>
                      <span
                        className={getSkillColor(player.playerInfo.gkAwareness)}
                      >
                        {player.playerInfo.gkAwareness}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GK Catching:</span>
                      <span
                        className={getSkillColor(player.playerInfo.gkCatching)}
                      >
                        {player.playerInfo.gkCatching}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GK Clearing:</span>
                      <span
                        className={getSkillColor(player.playerInfo.gkClearing)}
                      >
                        {player.playerInfo.gkClearing}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GK Reflexes:</span>
                      <span
                        className={getSkillColor(player.playerInfo.gkReflexes)}
                      >
                        {player.playerInfo.gkReflexes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GK Reach:</span>
                      <span
                        className={getSkillColor(player.playerInfo.gkReach)}
                      >
                        {player.playerInfo.gkReach}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Special Attributes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    Special Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Weak Foot Usage:</span>
                    <span className="font-semibold">
                      {player.playerInfo.weakFootUsage}/4
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weak Foot Accuracy:</span>
                    <span className="font-semibold">
                      {player.playerInfo.weakFootAcc}/4
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Form:</span>
                    <span className="font-semibold">
                      {player.playerInfo.form}/8
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Injury Resistance:</span>
                    <span className="font-semibold">
                      {player.playerInfo.injuryResistance}/3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <span className="font-semibold capitalize">
                      {player.playerInfo.style}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Match Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches Played:</span>
                    <span className="font-bold">
                      {player.stats.matchesPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matches Won:</span>
                    <span className="font-bold text-green-600">
                      {player.stats.matchesWon}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-bold text-blue-600">
                      {player.stats.matchesPlayed > 0
                        ? Math.round(
                            (player.stats.matchesWon /
                              player.stats.matchesPlayed) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Attacking Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className="font-bold text-green-600">
                      {player.stats.goals}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span className="font-bold text-blue-600">
                      {player.stats.assists}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals per Match:</span>
                    <span className="font-bold">
                      {player.stats.matchesPlayed > 0
                        ? (
                            player.stats.goals / player.stats.matchesPlayed
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shirt className="h-5 w-5 text-yellow-500" />
                    Disciplinary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Yellow Cards:</span>
                    <span className="font-bold text-yellow-600">
                      {player.stats.yellowCards}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cards:</span>
                    <span className="font-bold text-red-600">
                      {player.stats.redCards}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clean Sheets:</span>
                    <span className="font-bold text-green-600">
                      {player.stats.cleanSheets}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tournaments Won:</span>
                    <span className="font-bold text-purple-600">
                      {player.stats.tournamentsWon}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Points:</span>
                    <span className="font-bold">
                      {player.stats.skillPoints}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings:</span>
                    <span className="font-bold text-green-600">
                      {player.stats.totalEarnings.toLocaleString()} FC
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Full Name:</span>
                    <span className="font-semibold">
                      {player.playerInfo.firstName} {player.playerInfo.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-semibold">
                      {player.playerInfo.age} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="font-semibold">
                      {player.playerInfo.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-semibold">
                      {player.playerInfo.weight} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nationality:</span>
                    <span className="font-semibold">
                      {player.playerInfo.nationality}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Career Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Current Club:</span>
                    <span className="font-semibold">
                      {player.playerInfo.club}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-semibold">
                      {positionLabels[player.playerInfo.position] ||
                        player.playerInfo.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Rating:</span>
                    <span className="font-bold text-primary text-lg">
                      {player.overall}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coins:</span>
                    <span className="font-semibold text-green-600">
                      {player.coins.toLocaleString()} FC
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold">Energy:</span>
                    <EnergyBar
                      current={player.energy}
                      max={100}
                      showText={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default function ManagerStore() {
  const { aiPlayers, loading, error, refetch } = useAIPlayers();
  const [selectedPlayer, setSelectedPlayer] = useState<AIPlayer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyPlayer, setBuyPlayer] = useState<AIPlayer | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const openPlayerModal = (player: AIPlayer) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const closePlayerModal = () => {
    setSelectedPlayer(null);
    setIsModalOpen(false);
  };

  const openBuyModal = (player: AIPlayer) => {
    setBuyPlayer(player);
    setIsBuyModalOpen(true);
  };

  const closeBuyModal = () => {
    setBuyPlayer(null);
    setIsBuyModalOpen(false);
  };

  const handleBuyPlayer = async () => {
    if (!buyPlayer) return;

    setIsBuying(true);
    try {
      const response = await apiClient.buyAIPlayer(buyPlayer.id);

      if (response.success) {
        toast.success(`${buyPlayer.username} berhasil dibeli!`, {
          description: `Harga: ${response.data.price.toLocaleString()} FC`,
        });

        // Refresh AI players list
        await refetch();

        // Close modal
        closeBuyModal();
      }
    } catch (error) {
      toast.error("Gagal membeli player", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat membeli player",
      });
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-20 w-40" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="stat-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                <Button onClick={refetch} variant="outline" size="sm">
                  Coba Lagi
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!aiPlayers || aiPlayers.length === 0) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="stat-card text-center p-8">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Belum Ada AI Players
              </h3>
              <p className="text-muted-foreground">
                AI Players belum tersedia saat ini.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Pemain AI Elite
            </h1>
            <p className="text-muted-foreground">
              Koleksi pemain AI terbaik dengan skill dan statistik luar biasa
            </p>
          </div>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">
                  {aiPlayers.length} Pemain AI
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiPlayers.map((player) => (
            <Card
              key={player.id}
              className="stat-card transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{player.profilePicture}</div>
                    <div>
                      <CardTitle className="text-lg">
                        {player.username}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {player.playerInfo.firstName}{" "}
                        {player.playerInfo.lastName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/50 font-bold"
                  >
                    OVR {player.overall}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Posisi</p>
                    <p className="font-semibold">
                      {positionLabels[player.playerInfo.position] ||
                        player.playerInfo.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Umur</p>
                    <p className="font-semibold">
                      {player.playerInfo.age} tahun
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kebangsaan</p>
                    <p className="font-semibold">
                      {player.playerInfo.nationality}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Klub</p>
                    <p className="font-semibold">{player.playerInfo.club}</p>
                  </div>
                </div>

                {/* Energy Bar */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Energy</p>
                  <EnergyBar
                    current={player.energy}
                    max={100}
                    showText={true}
                  />
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3 text-primary" />
                      <span className="text-sm font-bold">
                        {player.stats.goals}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Goals</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-3 w-3 text-accent" />
                      <span className="text-sm font-bold">
                        {player.stats.assists}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Assists</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-bold">
                        {player.stats.matchesPlayed}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Matches</p>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Key Skills</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {/* Show different skills based on position */}
                    {player.playerInfo.position === "GK" ? (
                      <>
                        <div className="flex justify-between">
                          <span>GK Reflexes:</span>
                          <span className="font-bold">
                            {player.playerInfo.gkReflexes}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>GK Awareness:</span>
                          <span className="font-bold">
                            {player.playerInfo.gkAwareness}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>GK Catching:</span>
                          <span className="font-bold">
                            {player.playerInfo.gkCatching}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low Pass:</span>
                          <span className="font-bold">
                            {player.playerInfo.lowPass}
                          </span>
                        </div>
                      </>
                    ) : player.playerInfo.position === "CB" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Def Awareness:</span>
                          <span className="font-bold">
                            {player.playerInfo.defensiveAwareness}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ball Winning:</span>
                          <span className="font-bold">
                            {player.playerInfo.ballWinning}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heading:</span>
                          <span className="font-bold">
                            {player.playerInfo.heading}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Physical:</span>
                          <span className="font-bold">
                            {player.playerInfo.physicalContact}
                          </span>
                        </div>
                      </>
                    ) : player.playerInfo.position === "LW" ||
                      player.playerInfo.position === "RW" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Dribbling:</span>
                          <span className="font-bold">
                            {player.playerInfo.dribbling}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className="font-bold">
                            {player.playerInfo.speed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ball Control:</span>
                          <span className="font-bold">
                            {player.playerInfo.ballControl}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Finishing:</span>
                          <span className="font-bold">
                            {player.playerInfo.finishing}
                          </span>
                        </div>
                      </>
                    ) : player.playerInfo.position === "ST" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Finishing:</span>
                          <span className="font-bold">
                            {player.playerInfo.finishing}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Off Awareness:</span>
                          <span className="font-bold">
                            {player.playerInfo.offensiveAwareness}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heading:</span>
                          <span className="font-bold">
                            {player.playerInfo.heading}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className="font-bold">
                            {player.playerInfo.speed}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Default for midfielders
                      <>
                        <div className="flex justify-between">
                          <span>Low Pass:</span>
                          <span className="font-bold">
                            {player.playerInfo.lowPass}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ball Control:</span>
                          <span className="font-bold">
                            {player.playerInfo.ballControl}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stamina:</span>
                          <span className="font-bold">
                            {player.playerInfo.stamina}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dribbling:</span>
                          <span className="font-bold">
                            {player.playerInfo.dribbling}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    {player.bio}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openPlayerModal(player)}
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    View Stats
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 football-button"
                    onClick={() => openBuyModal(player)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-xl font-bold">
                    {aiPlayers.reduce(
                      (sum, player) => sum + player.stats.goals,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Assists</p>
                  <p className="text-xl font-bold">
                    {aiPlayers.reduce(
                      (sum, player) => sum + player.stats.assists,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Championships</p>
                  <p className="text-xl font-bold">
                    {aiPlayers.reduce(
                      (sum, player) => sum + player.stats.tournamentsWon,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-xl font-bold">
                    {Math.round(
                      aiPlayers.reduce(
                        (sum, player) => sum + player.overall,
                        0
                      ) / aiPlayers.length
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Tentang Pemain AI Elite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Koleksi pemain AI ini adalah representasi dari kemampuan terbaik
              dalam dunia sepak bola. Setiap AI memiliki karakteristik unik,
              gaya bermain yang berbeda, dan statistik yang mencerminkan
              performa mereka. Mereka tidak memerlukan login dan dapat langsung
              dimainkan kapan saja. Tantang mereka untuk menguji kemampuan Anda!
            </p>
          </CardContent>
        </Card>

        {/* Player Stats Modal */}
        {selectedPlayer && (
          <PlayerStatsModal
            player={selectedPlayer}
            isOpen={isModalOpen}
            onClose={closePlayerModal}
          />
        )}

        {/* Buy Confirmation Modal */}
        {buyPlayer && (
          <Dialog open={isBuyModalOpen} onOpenChange={closeBuyModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-2xl">{buyPlayer.profilePicture}</span>
                  <div>
                    <h2 className="text-xl font-bold">Konfirmasi Pembelian</h2>
                    <p className="text-muted-foreground">
                      {buyPlayer.playerInfo.firstName}{" "}
                      {buyPlayer.playerInfo.lastName}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Player:</span>
                    <span className="font-semibold">{buyPlayer.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-semibold">
                      {positionLabels[buyPlayer.playerInfo.position] ||
                        buyPlayer.playerInfo.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Rating:</span>
                    <Badge className="bg-primary/10 text-primary border-primary/50 font-bold">
                      OVR {buyPlayer.overall}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-semibold">
                      {buyPlayer.playerInfo.age} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Price:</span>
                    <span className="font-bold text-green-600">
                      {(50000 + buyPlayer.overall * 1000).toLocaleString()} FC
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Peringatan:</strong> Setelah dibeli, player ini akan
                    menjadi bagian dari tim Anda dan tidak dapat dikembalikan.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeBuyModal}
                    disabled={isBuying}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleBuyPlayer}
                    disabled={isBuying}
                    className="football-button"
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Membeli...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Konfirmasi Beli
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
