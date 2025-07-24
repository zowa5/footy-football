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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  Mail,
  Server,
  Bell,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your basic application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="PES Manager" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="UTC+7" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance" />
                <Label htmlFor="maintenance">Maintenance Mode</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
                <Input id="sessionTimeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="2fa" />
                <Label htmlFor="2fa">Require 2FA for Admin Access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="strongPassword" />
                <Label htmlFor="strongPassword">
                  Enforce Strong Password Policy
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpServer">SMTP Server</Label>
                <Input id="smtpServer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" type="number" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="ssl" />
                <Label htmlFor="ssl">Use SSL</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage system-wide settings and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Max Players per Club</Label>
                <Input id="maxPlayers" type="number" defaultValue="25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matchDuration">
                  Default Match Duration (minutes)
                </Label>
                <Input id="matchDuration" type="number" defaultValue="90" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="autoBackup" />
                <Label htmlFor="autoBackup">Enable Auto Backup</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="emailNotifs" defaultChecked />
                <Label htmlFor="emailNotifs">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="systemAlerts" defaultChecked />
                <Label htmlFor="systemAlerts">System Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceAlerts" defaultChecked />
                <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
