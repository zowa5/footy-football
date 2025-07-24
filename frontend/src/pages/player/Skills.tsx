import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLAYER_SKILLS, COM_STYLES } from "@/constants/gameConstants";

// Mock player data
const mockPlayerData = {
  level: 25,
  skillPoints: 3,
  stylePoints: 2,
  skills: ["longRangeShot", "oneTouch", "throughPassing"],
  styles: ["tikiTaka", "counterAttack"],
  experience: 7500,
  nextLevelExp: 10000,
};

export default function SkillsAndStyles() {
  const [selectedTab, setSelectedTab] = useState("skills");

  const calculateProgress = (current: number, total: number) => {
    return (current / total) * 100;
  };

  const SkillCard = ({ skill }: { skill: (typeof PLAYER_SKILLS)[0] }) => {
    const isOwned = mockPlayerData.skills.includes(skill.id);

    return (
      <Card
        className={`skill-card transition-all duration-300 ${
          isOwned ? "border-primary/50 bg-primary/5" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{skill.name}</h3>
                {isOwned && (
                  <Badge variant="secondary" className="bg-primary/20">
                    Equipped
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
                  <p className="text-sm">{skill.details}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StyleCard = ({ style }: { style: (typeof COM_STYLES)[0] }) => {
    const isOwned = mockPlayerData.styles.includes(style.id);

    return (
      <Card
        className={`style-card transition-all duration-300 ${
          isOwned ? "border-primary/50 bg-primary/5" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{style.name}</h3>
                {isOwned && (
                  <Badge variant="secondary" className="bg-primary/20">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {style.description}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{style.details}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-football">
              Skills & Styles
            </h1>
            <p className="text-muted-foreground">
              Manage your player's skills and playing style
            </p>
          </div>

          <Card className="w-full md:w-auto">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm">Level {mockPlayerData.level}</span>
                </div>
                <Progress
                  value={calculateProgress(
                    mockPlayerData.experience,
                    mockPlayerData.nextLevelExp
                  )}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {mockPlayerData.experience} / {mockPlayerData.nextLevelExp} XP
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold">Available Skill Points</span>
              </div>
              <div className="text-2xl font-bold">
                {mockPlayerData.skillPoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Use these to unlock new skills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-semibold">Style Points</span>
              </div>
              <div className="text-2xl font-bold">
                {mockPlayerData.stylePoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Use these to unlock playing styles
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
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
                  <Star className="h-4 w-4 mr-2" />
                  Playing Styles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLAYER_SKILLS.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="styles" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COM_STYLES.map((style) => (
                    <StyleCard key={style.id} style={style} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
