import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useLogin, useRegister, useAvailableClubs } from "@/hooks/api";
import type { RegisterData } from "@/types/api";
import stadiumHero from "@/assets/stadium-hero.jpg";
import { Slider } from "@/components/ui/slider";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"player" | "manager">("player");
  const [position, setPosition] = useState("");
  const [clubName, setClubName] = useState("");
  const [error, setError] = useState("");

  // State untuk semua skill
  const [skills, setSkills] = useState(() => {
    const base = {};
    SKILL_ATTRS.forEach((attr) => {
      base[attr.id] = SKILL_DEFAULT;
    });
    SPECIAL_SKILLS.forEach((attr) => {
      base[attr.id] = attr.default;
    });
    return base;
  });

  // Tambahkan state untuk semua field playerInfo
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState(18);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [nationality, setNationality] = useState("");
  const [club, setClub] = useState("Free Agent");
  const [style, setStyle] = useState("balanced");

  // Calculate used and remaining points
  const usedPoints = useMemo(() => {
    let used = 0;
    for (const attr of SKILL_ATTRS) {
      used += skills[attr.id] - SKILL_DEFAULT;
    }
    for (const attr of SPECIAL_SKILLS) {
      used += (skills[attr.id] - attr.default) * SPECIAL_COST;
    }
    return used;
  }, [skills]);
  const remainingPoints = TOTAL_POINTS - usedPoints;

  const { login: authLogin, isAuthenticated, user, isLoading } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { data: clubsData, isLoading: clubsLoading } = useAvailableClubs();

  // Check if user is authenticated and show loading or success message
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(
        "🎉 User authenticated, should redirect to dashboard for:",
        user.role
      );
    }
  }, [isAuthenticated, user]);

  // Show loading state while authentication is being processed
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stadium-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show success message if authenticated (this should not normally be reached due to App.tsx routing)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-stadium-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Login Successful!</h2>
          <p>
            Welcome back,{" "}
            {user.playerInfo?.firstName ||
              user.managerInfo?.clubName ||
              user.username}
            !
          </p>
          <p className="mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("🔄 Attempting login...");
      const result = await loginMutation.mutateAsync({ email, password });
      console.log("✅ Login successful:", result);
      console.log("🔍 Result structure:", JSON.stringify(result, null, 2));

      // Access user and token from result.data
      const { user, token } = result.data;
      console.log("🔍 Extracted user and token:", { user, token });
      console.log("🔍 User role:", user?.role);

      if (!user || !token) {
        console.error("❌ Missing user or token in response");
        setError("Invalid response from server");
        return;
      }

      authLogin(user, token);
      console.log("🚀 AuthLogin called, should redirect now");
    } catch (error: unknown) {
      console.error("❌ Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (role === "player" && remainingPoints < 0) {
      setError("Total skill points melebihi batas!");
      return;
    }

    try {
      const registerData: RegisterData = {
        username,
        email,
        password,
        role: role as "player" | "manager",
      };

      // Add position for players
      if (role === "player") {
        if (!position) {
          setError("Please select a player position");
          return;
        }
        registerData.position = position;

        // Ensure all required fields are provided with defaults if empty
        registerData.playerInfo = {
          ...skills, // This includes all skill attributes
          position,
          firstName: firstName || "Player",
          lastName: lastName || "User",
          age: age || 18,
          height: height || 175,
          weight: weight || 70,
          nationality: nationality || "Unknown",
          club: club || "Free Agent",
          style: style || "balanced",
        } as RegisterData["playerInfo"]; // Type assertion using the interface
      }

      // Add club name for managers
      if (role === "manager") {
        if (!clubName || clubName.trim().length < 3) {
          setError("Please enter a club name (at least 3 characters)");
          return;
        }
        registerData.clubName = clubName.trim();
      }

      const result = await registerMutation.mutateAsync(registerData);

      // Access user and token from result.data
      const { user, token } = result.data;
      authLogin(user, token);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const handleDemoLogin = (demoRole: "player" | "manager") => {
    // Pre-fill with demo credentials based on role
    if (demoRole === "player") {
      setEmail("alexander_anderson_0_0@arsenalfc.com");
      setPassword("password123");
    } else if (demoRole === "manager") {
      setEmail("manager1@arsenalfc.com");
      setPassword("password123");
    }

    // Automatically trigger login
    setTimeout(() => {
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-stadium-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-football bg-primary-gradient bg-clip-text text-transparent">
            FOOTY CLUB
          </h1>
          <p className="text-xl font-semibold">UNIVERSEA</p>
          <p className="text-muted-foreground">
            Enter the ultimate football management experience
          </p>
        </div>

        {/* Auth Card */}
        <Card className="stat-card border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              Join the Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full football-button"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      Confirm Password
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-secondary/50 border-border"
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <Label>Choose Your Role</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) =>
                        setRole(value as "player" | "manager")
                      }
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="player" id="player" />
                        <div className="flex-1">
                          <Label htmlFor="player" className="cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Player</span>
                              <Badge
                                variant="outline"
                                className="text-primary border-primary/50"
                              >
                                Create Character
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Create your custom player, develop skills, and
                              compete in matches
                            </p>
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border opacity-50 cursor-not-allowed">
                        <RadioGroupItem value="manager" id="manager" disabled />
                        <div className="flex-1">
                          <Label htmlFor="manager" className="cursor-not-allowed">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Manager</span>
                              <Badge
                                variant="outline"
                                className="text-accent border-accent/50"
                              >
                                Lead Club
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Manage your club, build formations, and guide your
                              team to victory
                            </p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Player Position Selection (only show for players) */}
                  {role === "player" && (
                    <div className="space-y-2">
                      <Label htmlFor="position">Player Position</Label>
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                          <SelectItem value="CB">Centre Back (CB)</SelectItem>
                          <SelectItem value="LB">Left Back (LB)</SelectItem>
                          <SelectItem value="RB">Right Back (RB)</SelectItem>
                          <SelectItem value="CDM">
                            Central Defensive Midfielder (CDM)
                          </SelectItem>
                          <SelectItem value="CM">
                            Central Midfielder (CM)
                          </SelectItem>
                          <SelectItem value="CAM">
                            Central Attacking Midfielder (CAM)
                          </SelectItem>
                          <SelectItem value="LM">
                            Left Midfielder (LM)
                          </SelectItem>
                          <SelectItem value="RM">
                            Right Midfielder (RM)
                          </SelectItem>
                          <SelectItem value="LW">Left Winger (LW)</SelectItem>
                          <SelectItem value="RW">Right Winger (RW)</SelectItem>
                          <SelectItem value="ST">Striker (ST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Player Info Fields (only show for players) */}
                  {role === "player" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          min={16}
                          max={45}
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          min={150}
                          max={220}
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          min={50}
                          max={120}
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                          id="nationality"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="club">Club</Label>
                        <Select value={club} onValueChange={setClub} disabled>
                          <SelectTrigger className="opacity-50 cursor-not-allowed">
                            <SelectValue placeholder="Select your club" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free Agent">
                              Free Agent (Assigned later)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Club will be assigned after registration
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="style">Playing Style</Label>
                        <select
                          id="style"
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          required
                          className="w-full px-2 py-1 border rounded bg-background"
                        >
                          <option value="aggressive">Aggressive</option>
                          <option value="technical">Technical</option>
                          <option value="balanced">Balanced</option>
                          <option value="defensive">Defensive</option>
                          <option value="attacking">Attacking</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Club Name Selection (only show for managers) */}
                  {role === "manager" && (
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Club Name</Label>
                      <Input
                        id="clubName"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        placeholder="Enter your club name"
                        className="bg-secondary/50 border-border"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose a unique name for your football club (minimum 3
                        characters)
                      </p>
                    </div>
                  )}

                  {/* Player Skill Selection (only show for players) */}
                  {role === "player" && (
                    <div className="space-y-2">
                      <Label>
                        Pilih Skill Pemain (Sisa Poin: {remainingPoints})
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SKILL_ATTRS.map((attr) => (
                          <div key={attr.id} className="space-y-1">
                            <Label>{attr.name}</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                min={SKILL_MIN}
                                max={SKILL_MAX}
                                value={[skills[attr.id]]}
                                onValueChange={([value]) => {
                                  const diff = value - skills[attr.id];
                                  if (diff > 0 && remainingPoints - diff < 0)
                                    return;
                                  setSkills((prev) => ({
                                    ...prev,
                                    [attr.id]: value,
                                  }));
                                }}
                                disabled={
                                  remainingPoints <= 0 &&
                                  skills[attr.id] === SKILL_MIN
                                }
                                className="flex-1"
                              />
                              <input
                                type="number"
                                min={SKILL_MIN}
                                max={SKILL_MAX}
                                value={skills[attr.id]}
                                onChange={(e) => {
                                  let value =
                                    parseInt(e.target.value, 10) || SKILL_MIN;
                                  if (value < SKILL_MIN) value = SKILL_MIN;
                                  if (value > SKILL_MAX) value = SKILL_MAX;
                                  const diff = value - skills[attr.id];
                                  if (diff > 0 && remainingPoints - diff < 0)
                                    return;
                                  setSkills((prev) => ({
                                    ...prev,
                                    [attr.id]: value,
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key !== "ArrowUp" &&
                                    e.key !== "ArrowDown" &&
                                    e.key !== "Tab"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => e.preventDefault()}
                                className="w-16 px-2 py-1 border rounded text-center bg-background"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {skills[attr.id]}
                            </div>
                          </div>
                        ))}
                        {SPECIAL_SKILLS.map((attr) => (
                          <div key={attr.id} className="space-y-1">
                            <Label>{attr.name}</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                min={attr.min}
                                max={attr.max}
                                value={[skills[attr.id]]}
                                onValueChange={([value]) => {
                                  const diff = value - skills[attr.id];
                                  if (
                                    diff > 0 &&
                                    remainingPoints - diff * SPECIAL_COST < 0
                                  )
                                    return;
                                  setSkills((prev) => ({
                                    ...prev,
                                    [attr.id]: value,
                                  }));
                                }}
                                disabled={
                                  remainingPoints <= 0 &&
                                  skills[attr.id] === attr.min
                                }
                                className="flex-1"
                              />
                              <input
                                type="number"
                                min={attr.min}
                                max={attr.max}
                                value={skills[attr.id]}
                                onChange={(e) => {
                                  let value =
                                    parseInt(e.target.value, 10) || attr.min;
                                  if (value < attr.min) value = attr.min;
                                  if (value > attr.max) value = attr.max;
                                  const diff = value - skills[attr.id];
                                  if (
                                    diff > 0 &&
                                    remainingPoints - diff * SPECIAL_COST < 0
                                  )
                                    return;
                                  setSkills((prev) => ({
                                    ...prev,
                                    [attr.id]: value,
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key !== "ArrowUp" &&
                                    e.key !== "ArrowDown" &&
                                    e.key !== "Tab"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => e.preventDefault()}
                                className="w-16 px-2 py-1 border rounded text-center bg-background"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {skills[attr.id]}
                            </div>
                          </div>
                        ))}
                      </div>
                      {remainingPoints < 0 && (
                        <div className="text-xs text-destructive">
                          Poin yang dibagikan melebihi batas!
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full football-button"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Creating Account..."
                      : "Create Account & Start Playing"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">21 Attributes</p>
            <p className="text-xs text-muted-foreground">
              Full stat customization
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent">36 Play Styles</p>
            <p className="text-xs text-muted-foreground">Unique gameplay</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Club Management</p>
            <p className="text-xs text-muted-foreground">Lead your team</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent">Live Leaderboards</p>
            <p className="text-xs text-muted-foreground">Compete globally</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const SKILL_ATTRS = [
  { id: "offensiveAwareness", name: "Offensive Awareness" },
  { id: "dribbling", name: "Dribbling" },
  { id: "lowPass", name: "Low Pass" },
  { id: "finishing", name: "Finishing" },
  { id: "placeKicking", name: "Place Kicking" },
  { id: "speed", name: "Speed" },
  { id: "kickingPower", name: "Kicking Power" },
  { id: "physicalContact", name: "Physical Contact" },
  { id: "stamina", name: "Stamina" },
  { id: "ballWinning", name: "Ball Winning" },
  { id: "ballControl", name: "Ball Control" },
  { id: "tightPossession", name: "Tight Possession" },
  { id: "loftedPass", name: "Lofted Pass" },
  { id: "heading", name: "Heading" },
  { id: "curl", name: "Curl" },
  { id: "acceleration", name: "Acceleration" },
  { id: "jump", name: "Jump" },
  { id: "balance", name: "Balance" },
  { id: "defensiveAwareness", name: "Defensive Awareness" },
  { id: "aggression", name: "Aggression" },
  { id: "gkAwareness", name: "GK Awareness" },
  { id: "gkClearing", name: "GK Clearing" },
  { id: "gkReach", name: "GK Reach" },
  { id: "gkCatching", name: "GK Catching" },
  { id: "gkReflexes", name: "GK Reflexes" },
];
const SPECIAL_SKILLS = [
  { id: "weakFootUsage", name: "Weak Foot Usage", min: 1, max: 4, default: 1 },
  { id: "weakFootAcc", name: "Weak Foot Acc", min: 1, max: 4, default: 1 },
  {
    id: "injuryResistance",
    name: "Injury Resistance",
    min: 1,
    max: 3,
    default: 1,
  },
  { id: "form", name: "Form", min: 4, max: 8, default: 4 },
];
const SKILL_MIN = 50;
const SKILL_MAX = 99;
const SKILL_DEFAULT = 50;
const SPECIAL_COST = 5;
const TOTAL_POINTS = 50;
