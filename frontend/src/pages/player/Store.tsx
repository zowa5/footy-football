import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingBag,
  Coins,
  Zap,
  Star,
  TrendingUp,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info,
  Construction,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerSkills, useAcquireSkill } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";
import type { SkillTemplate, PlayerSkill } from "@/types/api";

export default function PlayerStore() {
  const [selectedTab, setSelectedTab] = useState("skills");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { user } = useAuth();
  const { data: skillsData, isLoading } = usePlayerSkills();
  const acquireSkillMutation = useAcquireSkill();

  const playerSkills = skillsData?.data?.playerSkills || [];
  const skillTemplates = skillsData?.data?.skillTemplates || [];
  const skillPoints = skillsData?.data?.skillPoints || 0;
  const stylePoints = skillsData?.data?.stylePoints || 0;

  const canAfford = (cost: number, currency: "skillPoints" | "stylePoints") => {
    if (currency === "skillPoints") return skillPoints >= cost;
    if (currency === "stylePoints") return stylePoints >= cost;
    return false;
  };

  const isOwned = (skillId: string) => {
    return playerSkills.some((ps) => ps.skillId === skillId);
  };

  const handlePurchase = (skillId: string) => {
    acquireSkillMutation.mutate(skillId);
  };

  // Get available skills that are not owned yet
  const getAvailableSkills = (skillType: "playerSkill" | "style") => {
    return skillTemplates
      .filter(
        (skill) => skill.skillType === skillType && !isOwned(skill.skillId)
      )
      .sort((a, b) => a.cost - b.cost); // Sort by cost
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

  const SkillStoreCard = ({ skill }: { skill: SkillTemplate }) => {
    const owned = isOwned(skill.skillId);
    const affordable = canAfford(skill.cost, skill.currency);

    return (
      <Card
        className={`stat-card transition-all duration-300 hover:scale-[1.02] ${
          owned ? "border-green-500/50 bg-green-500/5" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{skill.skillName}</h3>
                {owned && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-500/50"
                  >
                    Owned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {skill.description}
              </p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">{skill.longDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {skill.currency === "stylePoints" ? (
                <Star className="h-4 w-4 text-primary" />
              ) : (
                <Zap className="h-4 w-4 text-primary" />
              )}
              <span className="font-bold text-lg">{skill.cost}</span>
              <span className="text-sm text-muted-foreground">
                {skill.currency === "skillPoints" ? "SP" : "STP"}
              </span>
            </div>

            <Button
              size="sm"
              disabled={owned || !affordable || acquireSkillMutation.isPending}
              onClick={() => handlePurchase(skill.skillId)}
              className={
                owned ? "bg-green-500/20" : affordable ? "football-button" : ""
              }
              variant={owned ? "outline" : affordable ? "default" : "outline"}
            >
              {owned ? (
                "Owned"
              ) : !affordable ? (
                <Lock className="h-4 w-4" />
              ) : acquireSkillMutation.isPending ? (
                "Buying..."
              ) : (
                "Buy"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyStoreSection = ({ type }: { type: "skills" | "styles" }) => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        All available {type} have been purchased! Check back later for new{" "}
        {type}.
      </AlertDescription>
    </Alert>
  );

  const PremiumSection = () => (
    <Alert>
      <Construction className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium mb-1">Premium Features Coming Soon!</p>
          <p className="text-sm text-muted-foreground">
            Special items, boosts, and exclusive content will be available here
            in future updates.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-football">Player Store</h1>
              <p className="text-muted-foreground">Loading store data...</p>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </div>
          </div>
          <Card className="stat-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">Player Store</h1>
            <p className="text-muted-foreground">
              Purchase new skills and playing styles
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Card className="stat-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">{skillPoints}</span>
                  <span className="text-sm text-muted-foreground">SP</span>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">{stylePoints}</span>
                  <span className="text-sm text-muted-foreground">STP</span>
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="styles" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  COM Styles
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
                {(() => {
                  const availableSkills = getAvailableSkills("playerSkill");
                  if (availableSkills.length === 0) {
                    return <EmptyStoreSection type="skills" />;
                  }
                  const paginatedSkills = getPaginatedItems(availableSkills);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedSkills.map((skill) => (
                          <SkillStoreCard key={skill._id} skill={skill} />
                        ))}
                      </div>
                      <PaginationControls items={availableSkills} />
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="styles" className="space-y-4">
                {(() => {
                  const availableStyles = getAvailableSkills("style");
                  if (availableStyles.length === 0) {
                    return <EmptyStoreSection type="styles" />;
                  }
                  const paginatedStyles = getPaginatedItems(availableStyles);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedStyles.map((skill) => (
                          <SkillStoreCard key={skill._id} skill={skill} />
                        ))}
                      </div>
                      <PaginationControls items={availableStyles} />
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="premium" className="space-y-4">
                <PremiumSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                Skill Points (SP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Earned through matches and achievements. Used to purchase player
                skills.
              </p>
              <div className="text-xs text-muted-foreground">
                • Win matches: +10 SP
                <br />
                • Draw matches: +5 SP
                <br />• Goals/Assists: +2 SP each
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                Style Points (STP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Earned through special achievements and tournaments. Used to
                purchase playing styles.
              </p>
              <div className="text-xs text-muted-foreground">
                • Tournament wins: +15 STP
                <br />
                • Clean sheets: +3 STP
                <br />• Hat-tricks: +5 STP
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
