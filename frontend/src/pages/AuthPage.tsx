import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import stadiumHero from "@/assets/stadium-hero.jpg";

interface AuthPageProps {
  onLogin?: (role: "player" | "manager" | "superadmin") => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [role, setRole] = useState<"player" | "manager" | "superadmin">(
    "player"
  );

  const handleDemoLogin = () => {
    onLogin?.(role);
  };

  return (
    <div className="min-h-screen bg-stadium-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-football bg-primary-gradient bg-clip-text text-transparent">
            FOOTY CLUB
          </h1>
          <p className="text-xl font-semibold">UNIVERSE</p>
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

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    placeholder="Enter your username"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <Button
                  className="w-full football-button"
                  onClick={handleDemoLogin}
                >
                  Sign In
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    placeholder="Choose a username"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Choose Your Role</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) =>
                      setRole(value as "player" | "manager" | "superadmin")
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

                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value="manager" id="manager" />
                      <div className="flex-1">
                        <Label htmlFor="manager" className="cursor-pointer">
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

                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value="superadmin" id="superadmin" />
                      <div className="flex-1">
                        <Label htmlFor="superadmin" className="cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Super Admin</span>
                            <Badge
                              variant="outline"
                              className="text-destructive border-destructive/50"
                            >
                              System Admin
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Manage the entire system, users, clubs, and game
                            settings
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full football-button"
                  onClick={handleDemoLogin}
                >
                  Create Account & Start Playing
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Buttons */}
        <div className="text-center space-y-2">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
              onClick={() => onLogin?.("player")}
            >
              🎮 Quick Demo Login (Player Mode)
            </Button>
            <Button
              variant="outline"
              className="border-accent/50 hover:bg-accent/10"
              onClick={() => onLogin?.("manager")}
            >
              ⚔️ Quick Demo Login (Manager Mode)
            </Button>
            <Button
              variant="outline"
              className="border-destructive/50 hover:bg-destructive/10"
              onClick={() => onLogin?.("superadmin")}
            >
              🛡️ Quick Demo Login (Super Admin Mode)
            </Button>
          </div>
        </div>

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
