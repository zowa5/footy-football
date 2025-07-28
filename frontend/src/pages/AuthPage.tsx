import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useLogin, useRegister } from "@/hooks/api";
import stadiumHero from "@/assets/stadium-hero.jpg";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"player" | "manager" | "superadmin">(
    "player"
  );
  const [error, setError] = useState("");

  const { login: authLogin, isAuthenticated, user, isLoading } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

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

      // Access user and token from result.data based on API response structure
      const { user, token } = result.data || result;
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

    try {
      const result = await registerMutation.mutateAsync({
        username,
        email,
        password,
        role,
      });

      // Access user and token from result.data based on API response structure
      const { user, token } = result.data || result;
      authLogin(user, token);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const handleDemoLogin = (demoRole: "player" | "manager" | "superadmin") => {
    // Pre-fill with demo credentials based on role
    if (demoRole === "player") {
      setEmail("alexander_anderson_0_0@arsenalfc.com");
      setPassword("password123");
    } else if (demoRole === "manager") {
      setEmail("manager1@arsenalfc.com");
      setPassword("password123");
    } else if (demoRole === "superadmin") {
      setEmail("admin@footyclub.com");
      setPassword("admin123");
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
                          <Label
                            htmlFor="superadmin"
                            className="cursor-pointer"
                          >
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

        {/* Demo Buttons */}
        <div className="text-center space-y-2">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="border-primary/50 hover:bg-primary/10"
              onClick={() => handleDemoLogin("player")}
            >
              🎮 Quick Demo Login (Player Mode)
            </Button>
            <Button
              variant="outline"
              className="border-accent/50 hover:bg-accent/10"
              onClick={() => handleDemoLogin("manager")}
            >
              ⚔️ Quick Demo Login (Manager Mode)
            </Button>
            <Button
              variant="outline"
              className="border-destructive/50 hover:bg-destructive/10"
              onClick={() => handleDemoLogin("superadmin")}
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
