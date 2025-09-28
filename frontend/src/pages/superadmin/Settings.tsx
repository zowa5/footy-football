import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export default function Settings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();

  // Load current settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiClient.request("/admin/settings");
        if (response.data) {
          setMaintenanceMode(response.data.maintenanceMode || false);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load current settings.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.request("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          maintenanceMode,
        }),
      });

      if (response.success) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been saved successfully.",
          duration: 3000,
        });

        // If maintenance mode is enabled, show warning
        if (maintenanceMode) {
          toast({
            title: "Maintenance Mode Enabled",
            description: "Only super admins can access the system now.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Settings save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Settings...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {maintenanceMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Maintenance Mode is Active!</strong> Only super admins can
            access the system. Regular users will be unable to login until this
            is disabled.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your basic application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
            <Label htmlFor="maintenance">Maintenance Mode</Label>
          </div>
          {maintenanceMode && (
            <div className="text-sm text-muted-foreground">
              ⚠️ When enabled, only super admins can access the system. All
              other users will be blocked from logging in.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
