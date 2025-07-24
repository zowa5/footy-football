import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  ShoppingBag,
  Coins,
  Zap,
  Star,
  TrendingUp,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PLAYER_SKILLS, COM_STYLES } from "@/constants/gameConstants";

// Mock player data
const mockPlayerData = {
  currencies: { gp: 2500, fc: 150 },
  ownedSkills: ["longRangeShot", "oneTouch"],
  ownedComStyles: ["tikiTaka", "counterAttack"],
  level: 25,
};

// Slidable Stat Attributes
const statUpgrades = [
  "Offensive Awareness",
  "Ball Control",
  "Dribbling",
  "Tight Possession",
  "Low Pass",
  "Lofted Pass",
  "Finishing",
  "Heading",
  "Place Kicking",
  "Curl",
  "Speed",
  "Acceleration",
  "Kicking Power",
  "Jump",
  "Physical Contact",
  "Balance",
  "Stamina",
  "Defensive Awareness",
  "Ball Winning",
  "Aggression",
  "GK Awareness",
  "GK Catching",
  "GK Clearing",
  "GK Reflexes",
  "GK Reach",
  "Weak Foot Usage",
  "Weak Foot Acc.",
  "Form",
  "Injury Resistance",
].map((attr) => ({
  id: attr.toLowerCase().replace(/\s+/g, "_"),
  name: attr,
  description: `${attr} (1-99)`,
  cost: 400,
  currency: "gp",
  type: "stat",
}));

// Special premium items
const premiumItems = [
  {
    id: "energy_drink",
    name: "Energy Drink",
    description: "Restore 25 energy instantly",
    cost: 50,
    currency: "fc",
    type: "consumable",
  },
  {
    id: "super_energy",
    name: "Super Energy Boost",
    description: "Restore 50 energy instantly",
    cost: 80,
    currency: "fc",
    type: "consumable",
  },
  {
    id: "skill_reset",
    name: "Skill Reset Token",
    description: "Reset and choose new skills",
    cost: 200,
    currency: "fc",
    type: "special",
  },
  {
    id: "style_reset",
    name: "Style Reset Token",
    description: "Reset and choose new COM styles",
    cost: 150,
    currency: "fc",
    type: "special",
  },
  {
    id: "appearance_change",
    name: "Appearance Editor",
    description: "Modify player appearance",
    cost: 100,
    currency: "fc",
    type: "special",
  },
  {
    id: "position_change",
    name: "Position Change Card",
    description: "Change player position",
    cost: 300,
    currency: "fc",
    type: "special",
  },
];

export default function PlayerStore() {
  const [playerData, setPlayerData] = useState(mockPlayerData);
  const [selectedTab, setSelectedTab] = useState("skills");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const canAfford = (cost: number, currency: "gp" | "fc") => {
    return playerData.currencies[currency] >= cost;
  };

  const isOwned = (itemId: string, type: "skill" | "style") => {
    if (type === "skill") return playerData.ownedSkills.includes(itemId);
    return playerData.ownedComStyles.includes(itemId);
  };

  interface StoreItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    currency: "gp" | "fc";
    type?: "stat" | "skill" | "style" | "consumable" | "special";
  }

  const handlePurchase = (item: StoreItem) => {
    const cost = item.cost;
    const currency = item.currency;

    if (!canAfford(cost, currency)) return;

    setPlayerData((prev) => ({
      ...prev,
      currencies: {
        ...prev.currencies,
        [currency]: prev.currencies[currency] - cost,
      },
    }));
  };

  // Pagination helpers
  const getPaginatedItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const PaginationControls = ({ items }: { items: any[] }) => {
    const totalPages = getTotalPages(items);

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "football-button" : ""}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  const StoreItem = ({
    item,
    type = "general",
  }: {
    item: StoreItem;
    type?: string;
  }) => {
    const owned =
      type === "skill"
        ? isOwned(item.id, "skill")
        : type === "style"
        ? isOwned(item.id, "style")
        : false;
    const affordable = canAfford(item.cost, item.currency);
    const [sliderValue, setSliderValue] = useState(40);

    const handleSliderChange = (value: number[]) => {
      setSliderValue(value[0]);
      // You can add additional logic here to handle the stat upgrade
    };

    if (item.type === "stat") {
      return (
        <Card className="stat-card transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                </div>
                <div className="space-y-4">
                  <Slider
                    defaultValue={[40]}
                    min={40}
                    max={99}
                    step={1}
                    value={[sliderValue]}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Current: {sliderValue}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-bold">
                        {item.cost * (sliderValue - 40)}
                      </span>
                      <span className="text-sm text-muted-foreground">GP</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!affordable}
                    onClick={() =>
                      handlePurchase({
                        ...item,
                        cost: item.cost * (sliderValue - 40),
                      })
                    }
                    className={affordable ? "football-button w-full" : "w-full"}
                  >
                    {!affordable ? <Lock className="h-4 w-4 mr-2" /> : null}
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={`stat-card transition-all duration-300 hover:scale-[1.02] ${
          owned ? "border-accent/50 bg-accent/5" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{item.name}</h3>
                {owned && (
                  <Badge
                    variant="outline"
                    className="text-accent border-accent/50"
                  >
                    Owned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.currency === "fc" ? (
                <Coins className="h-4 w-4 text-yellow-500" />
              ) : (
                <Star className="h-4 w-4 text-primary" />
              )}
              <span className="font-bold text-lg">{item.cost}</span>
              <span className="text-sm text-muted-foreground">
                {item.currency.toUpperCase()}
              </span>
            </div>

            <Button
              size="sm"
              disabled={owned || !affordable}
              onClick={() => handlePurchase(item)}
              className={
                owned ? "bg-accent/20" : affordable ? "football-button" : ""
              }
              variant={owned ? "outline" : affordable ? "default" : "outline"}
            >
              {owned ? (
                "Owned"
              ) : !affordable ? (
                <Lock className="h-4 w-4" />
              ) : (
                "Buy"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">Player Store</h1>
            <p className="text-muted-foreground">
              Upgrade your skills and boost your performance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Card className="stat-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">
                    {playerData.currencies.gp}
                  </span>
                  <span className="text-sm text-muted-foreground">GP</span>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-lg">
                    {playerData.currencies.fc}
                  </span>
                  <span className="text-sm text-muted-foreground">FC</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Store Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="styles" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  COM Styles
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stat Upgrades
                </TabsTrigger>
                <TabsTrigger
                  value="premium"
                  className="flex items-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  Premium
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedItems(PLAYER_SKILLS).map((skill) => (
                    <StoreItem
                      key={skill.id}
                      item={{ ...skill, currency: "gp" }}
                      type="skill"
                    />
                  ))}
                </div>
                <PaginationControls items={PLAYER_SKILLS} />
              </TabsContent>

              <TabsContent value="styles" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedItems(COM_STYLES).map((style) => (
                    <StoreItem
                      key={style.id}
                      item={{ ...style, currency: "gp" }}
                      type="style"
                    />
                  ))}
                </div>
                <PaginationControls items={COM_STYLES} />
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedItems(statUpgrades).map((upgrade) => (
                    <StoreItem key={upgrade.id} item={upgrade} />
                  ))}
                </div>
                <PaginationControls items={statUpgrades} />
              </TabsContent>

              <TabsContent value="premium" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedItems(premiumItems).map((item) => (
                    <StoreItem key={item.id} item={item} />
                  ))}
                </div>
                <PaginationControls items={premiumItems} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                General Points (GP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Earned through matches, training, and achievements. Used for
                skills, styles, and stat upgrades.
              </p>
              <div className="text-xs text-muted-foreground">
                • Win matches: +150 GP
                <br />
                • Draw matches: +75 GP
                <br />• Goals/Assists: +25 GP each
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <Coins className="h-5 w-5" />
                Football Coins (FC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Premium currency for special items, boosts, and exclusive
                content. Can be purchased or earned.
              </p>
              <div className="text-xs text-muted-foreground">
                • Weekly login bonus
                <br />
                • Special achievements
                <br />• Tournament rewards
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
