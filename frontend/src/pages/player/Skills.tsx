import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Zap,
  Star,
  Info,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerSkills, useToggleSkill } from "@/hooks/api";
import { useAuth } from "@/hooks/useAuth";
import type { PlayerSkill, SkillTemplate } from "@/types/api";

export default function SkillsAndStyles() {
  const [selectedTab, setSelectedTab] = useState("skills");
  const { user } = useAuth();
  const { data: skillsData, isLoading } = usePlayerSkills();
  const toggleSkillMutation = useToggleSkill();

  const playerSkills = skillsData?.data?.playerSkills || [];
  const skillTemplates = skillsData?.data?.skillTemplates || [];
  const skillPoints = skillsData?.data?.skillPoints || 0;
  const stylePoints = skillsData?.data?.stylePoints || 0;

  const handleToggleSkill = (skillId: string) => {
    toggleSkillMutation.mutate(skillId);
  };

  // Get owned skills with their template data
  const getOwnedSkills = (skillType: "playerSkill" | "style") => {
    return playerSkills
      .map((playerSkill) => {
        const template = skillTemplates.find(
          (t) => t.skillId === playerSkill.skillId && t.skillType === skillType
        );
        return template ? { ...template, playerSkill } : null;
      })
      .filter(Boolean) as (SkillTemplate & { playerSkill: PlayerSkill })[];
  };

  const OwnedSkillCard = ({
    skill,
    playerSkill,
  }: {
    skill: SkillTemplate;
    playerSkill: PlayerSkill;
  }) => {
    return (
      <Card className="skill-card transition-all duration-300 border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{skill.skillName}</h3>
                <Badge
                  variant={playerSkill.isActive ? "default" : "secondary"}
                  className={
                    playerSkill.isActive ? "bg-green-600" : "bg-gray-500"
                  }
                >
                  {playerSkill.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {skill.description}
              </p>

              {/* Level & Cost Info */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Level:</span>
                  <span className="text-primary">{playerSkill.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Original Cost:</span>
                  {skill.currency === "skillPoints" && (
                    <Zap className="h-3 w-3 text-primary" />
                  )}
                  {skill.currency === "stylePoints" && (
                    <Star className="h-3 w-3 text-primary" />
                  )}
                  <span className="text-muted-foreground">
                    {skill.cost} {skill.currency}
                  </span>
                </div>
              </div>

              {/* Toggle Action */}
              <Button
                size="sm"
                variant={playerSkill.isActive ? "destructive" : "default"}
                onClick={() => handleToggleSkill(skill.skillId)}
                disabled={toggleSkillMutation.isPending}
                className="w-full"
              >
                {toggleSkillMutation.isPending
                  ? "Processing..."
                  : playerSkill.isActive
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">{skill.longDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyStateCard = ({
    skillType,
  }: {
    skillType: "skills" | "styles";
  }) => (
    <Alert className="col-span-full">
      <ShoppingCart className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium mb-1">No {skillType} owned yet!</p>
          <p className="text-sm text-muted-foreground">
            Visit the store to purchase {skillType} that you can activate and
            deactivate here.
          </p>
        </div>
        <Link to="/player/store">
          <Button variant="outline" size="sm" className="ml-4">
            Go to Store
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading skills...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Skills & Styles
            </h1>
            <p className="text-muted-foreground">
              Activate and deactivate your owned skills and playing styles
            </p>
          </div>

          <div className="flex gap-4">
            <Card className="w-full md:w-auto">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm">Skill Points</span>
                  </div>
                  <div className="text-2xl font-bold">{skillPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    Go to store to buy skills
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full md:w-auto">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Style Points</span>
                  </div>
                  <div className="text-2xl font-bold">{stylePoints}</div>
                  <p className="text-xs text-muted-foreground">
                    Go to store to buy styles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Skill & Style Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="skills">
                  <Zap className="h-4 w-4 mr-2" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="styles">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  COM Playing Styles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const ownedSkills = getOwnedSkills("playerSkill");
                    if (ownedSkills.length === 0) {
                      return <EmptyStateCard skillType="skills" />;
                    }
                    return ownedSkills.map((skill) => (
                      <OwnedSkillCard
                        key={skill._id}
                        skill={skill}
                        playerSkill={skill.playerSkill}
                      />
                    ));
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="styles" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const ownedStyles = getOwnedSkills("style");
                    if (ownedStyles.length === 0) {
                      return <EmptyStateCard skillType="styles" />;
                    }
                    return ownedStyles.map((skill) => (
                      <OwnedSkillCard
                        key={skill._id}
                        skill={skill}
                        playerSkill={skill.playerSkill}
                      />
                    ));
                  })()}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
