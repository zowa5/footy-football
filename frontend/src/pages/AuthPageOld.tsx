import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useLogin, useRegister } from "@/hooks/api";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"player" | "manager">("player");
  const [error, setError] = useState("");

  const { login: authLogin } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      authLogin(result.user, result.token);
    } catch (error: unknown) {
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
        email,
        password,
        role,
        firstName,
        lastName,
      });
      authLogin(result.user, result.token);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 text-white">
          <h1 className="text-4xl font-bold">FOOTY CLUB</h1>
          <p className="text-xl font-semibold">UNIVERSE</p>
          <p className="text-green-100">
            Enter the ultimate football management experience
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-green-600/20 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-green-800">
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
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">First Name</Label>
                      <Input
                        id="register-firstName"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Last Name</Label>
                      <Input
                        id="register-lastName"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Role</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={role === "player" ? "default" : "outline"}
                        onClick={() => setRole("player")}
                        className="flex-1"
                      >
                        Player
                      </Button>
                      <Button
                        type="button"
                        variant={role === "manager" ? "default" : "outline"}
                        onClick={() => setRole("manager")}
                        className="flex-1"
                      >
                        Manager
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="border-green-600/20 bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-green-800">Demo Accounts</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Player:</strong> player@demo.com / password</p>
                <p><strong>Manager:</strong> manager@demo.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
