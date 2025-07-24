import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Target, 
  Zap, 
  Settings, 
  Check,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { 
  PLAYER_POSITIONS, 
  PLAYER_ATTRIBUTES, 
  PLAYING_STYLES, 
  PLAYER_SKILLS, 
  COM_STYLES 
} from "@/constants/gameConstants";

interface CharacterCreationProps {
  onComplete?: (characterData: any) => void;
}

export default function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState({
    name: "",
    position: "",
    stats: {} as Record<string, number>,
    appearance: {
      faceType: "face1",
      hairStyle: "hair1", 
      height: 175,
      skinColor: "light"
    },
    skills: [] as string[],
    comStyles: [] as string[],
    playingStyles: [] as string[]
  });

  const [availablePoints, setAvailablePoints] = useState(1500);
  const totalSteps = 5;

  // Initialize stats based on selected position
  const initializeStats = (positionId: string) => {
    const position = PLAYER_POSITIONS.find(p => p.id === positionId);
    if (!position) return;

    const newStats: Record<string, number> = {};
    let usedPoints = 0;

    // Set base stats for position
    PLAYER_ATTRIBUTES.forEach(attr => {
      const baseValue = position.baseStats[attr.id as keyof typeof position.baseStats] || attr.min;
      newStats[attr.id] = baseValue;
      usedPoints += baseValue;
    });

    setCharacterData(prev => ({ ...prev, position: positionId, stats: newStats }));
    setAvailablePoints(1500 - usedPoints);
  };

  const updateStat = (statId: string, value: number) => {
    const currentValue = characterData.stats[statId] || 40;
    const difference = value - currentValue;
    
    if (availablePoints - difference >= 0) {
      setCharacterData(prev => ({
        ...prev,
        stats: { ...prev.stats, [statId]: value }
      }));
      setAvailablePoints(prev => prev - difference);
    }
  };

  const resetStats = () => {
    if (characterData.position) {
      initializeStats(characterData.position);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeCreation = () => {
    onComplete?.(characterData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold
            ${step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            {step < currentStep ? <Check className="h-5 w-5" /> : step}
          </div>
          {step < totalSteps && (
            <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const getPositionStyles = (position: string) => {
    return PLAYING_STYLES.filter(style => {
      const pos = PLAYER_POSITIONS.find(p => p.id === position);
      if (!pos) return false;
      
      // Simple logic to match styles to positions
      if (position.includes("striker") || position.includes("attacking")) {
        return style.category === "Attack";
      } else if (position.includes("midfielder")) {
        return style.category === "Midfield";
      } else if (position.includes("back") || position === "goalkeeper") {
        return style.category === "Defense";
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-stadium-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-football">Create Your Player</h1>
          <p className="text-muted-foreground">Design your ultimate football player</p>
        </div>

        {renderStepIndicator()}

        <Card className="stat-card">
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                  <p className="text-muted-foreground">Start with your player's name and position</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="player-name">Player Name</Label>
                    <Input
                      id="player-name"
                      value={characterData.name}
                      onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your player's name"
                      className="bg-secondary/50"
                    />
                  </div>

                  <div>
                    <Label>Choose Your Position</Label>
                    <RadioGroup
                      value={characterData.position}
                      onValueChange={initializeStats}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                    >
                      {PLAYER_POSITIONS.map((position) => (
                        <div key={position.id} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                          <RadioGroupItem value={position.id} id={position.id} />
                          <Label htmlFor={position.id} className="cursor-pointer flex-1">
                            <div>
                              <h3 className="font-semibold">{position.name}</h3>
                              <p className="text-sm text-muted-foreground">{position.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Stat Allocation */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Attribute Allocation</h2>
                  <p className="text-muted-foreground">Distribute {availablePoints} remaining points across your attributes</p>
                  
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Badge variant="outline" className="text-primary border-primary/50">
                      Available: {availablePoints} points
                    </Badge>
                    <Button variant="outline" size="sm" onClick={resetStats}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLAYER_ATTRIBUTES.map((attr) => (
                    <div key={attr.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">{attr.name}</Label>
                        <Badge variant="outline">{attr.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[characterData.stats[attr.id] || attr.min]}
                          onValueChange={([value]) => updateStat(attr.id, value)}
                          min={attr.min}
                          max={attr.max}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-semibold">
                          {characterData.stats[attr.id] || attr.min}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Appearance */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Player Appearance</h2>
                  <p className="text-muted-foreground">Customize your player's look</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Face Type</Label>
                      <Select 
                        value={characterData.appearance.faceType}
                        onValueChange={(value) => setCharacterData(prev => ({
                          ...prev, 
                          appearance: { ...prev.appearance, faceType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="face1">Classic</SelectItem>
                          <SelectItem value="face2">Angular</SelectItem>
                          <SelectItem value="face3">Round</SelectItem>
                          <SelectItem value="face4">Athletic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Hair Style</Label>
                      <Select 
                        value={characterData.appearance.hairStyle}
                        onValueChange={(value) => setCharacterData(prev => ({
                          ...prev, 
                          appearance: { ...prev.appearance, hairStyle: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hair1">Short & Clean</SelectItem>
                          <SelectItem value="hair2">Modern Cut</SelectItem>
                          <SelectItem value="hair3">Curly</SelectItem>
                          <SelectItem value="hair4">Long</SelectItem>
                          <SelectItem value="hair5">Buzz Cut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Height: {characterData.appearance.height}cm</Label>
                      <Slider
                        value={[characterData.appearance.height]}
                        onValueChange={([value]) => setCharacterData(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, height: value }
                        }))}
                        min={160}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Skin Color</Label>
                      <RadioGroup
                        value={characterData.appearance.skinColor}
                        onValueChange={(value) => setCharacterData(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, skinColor: value }
                        }))}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Skills & Playing Styles */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Skills & Playing Styles</h2>
                  <p className="text-muted-foreground">Choose 3 skills and 3 playing styles</p>
                </div>

                <Tabs defaultValue="skills" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="skills">Player Skills (3)</TabsTrigger>
                    <TabsTrigger value="styles">Playing Styles (3)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="skills" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PLAYER_SKILLS.slice(0, 12).map((skill) => (
                        <Card 
                          key={skill.id} 
                          className={`cursor-pointer transition-all duration-200 ${
                            characterData.skills.includes(skill.id) 
                              ? 'border-primary bg-primary/10' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (characterData.skills.includes(skill.id)) {
                              setCharacterData(prev => ({
                                ...prev,
                                skills: prev.skills.filter(s => s !== skill.id)
                              }));
                            } else if (characterData.skills.length < 3) {
                              setCharacterData(prev => ({
                                ...prev,
                                skills: [...prev.skills, skill.id]
                              }));
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{skill.name}</h3>
                                <p className="text-sm text-muted-foreground">{skill.description}</p>
                              </div>
                              {characterData.skills.includes(skill.id) && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="styles" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getPositionStyles(characterData.position).slice(0, 12).map((style) => (
                        <Card 
                          key={style.id} 
                          className={`cursor-pointer transition-all duration-200 ${
                            characterData.playingStyles.includes(style.id) 
                              ? 'border-primary bg-primary/10' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (characterData.playingStyles.includes(style.id)) {
                              setCharacterData(prev => ({
                                ...prev,
                                playingStyles: prev.playingStyles.filter(s => s !== style.id)
                              }));
                            } else if (characterData.playingStyles.length < 3) {
                              setCharacterData(prev => ({
                                ...prev,
                                playingStyles: [...prev.playingStyles, style.id]
                              }));
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{style.name}</h3>
                                <p className="text-sm text-muted-foreground">{style.description}</p>
                              </div>
                              {characterData.playingStyles.includes(style.id) && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 5: COM Styles */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">COM Playing Styles</h2>
                  <p className="text-muted-foreground">Choose 3 team playing styles that suit your gameplay</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COM_STYLES.map((style) => (
                    <Card 
                      key={style.id} 
                      className={`cursor-pointer transition-all duration-200 ${
                        characterData.comStyles.includes(style.id) 
                          ? 'border-primary bg-primary/10' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (characterData.comStyles.includes(style.id)) {
                          setCharacterData(prev => ({
                            ...prev,
                            comStyles: prev.comStyles.filter(s => s !== style.id)
                          }));
                        } else if (characterData.comStyles.length < 3) {
                          setCharacterData(prev => ({
                            ...prev,
                            comStyles: [...prev.comStyles, style.id]
                          }));
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{style.name}</h3>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </div>
                          {characterData.comStyles.includes(style.id) && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  className="football-button"
                  onClick={completeCreation}
                  disabled={
                    !characterData.name ||
                    !characterData.position ||
                    characterData.skills.length !== 3 ||
                    characterData.playingStyles.length !== 3 ||
                    characterData.comStyles.length !== 3
                  }
                >
                  Create Player
                </Button>
              ) : (
                <Button
                  className="football-button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!characterData.name || !characterData.position)) ||
                    (currentStep === 4 && (characterData.skills.length !== 3 || characterData.playingStyles.length !== 3))
                  }
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}