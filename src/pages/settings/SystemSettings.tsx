
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Shield,
  Cloud,
  Bell,
  Save,
  Undo2,
} from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            System Settings
        </h1>
        {/* Optional: Add a button or other actions here if needed, similar to Departments */}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 rounded-none shadow-none">
          <TabsTrigger 
            value="general" 
            className="flex items-center justify-center py-2.5 px-4 relative transition-all duration-300 
                       data-[state=active]:text-black data-[state=active]:font-semibold 
                       data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                       data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                       data-[state=active]:after:w-full data-[state=active]:after:h-[2px] 
                       data-[state=active]:after:bg-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-none"
          >
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center justify-center py-2.5 px-4 relative transition-all duration-300 
                       data-[state=active]:text-black data-[state=active]:font-semibold 
                       data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                       data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                       data-[state=active]:after:w-full data-[state=active]:after:h-[2px] 
                       data-[state=active]:after:bg-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-none"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center justify-center py-2.5 px-4 relative transition-all duration-300 
                       data-[state=active]:text-black data-[state=active]:font-semibold 
                       data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                       data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                       data-[state=active]:after:w-full data-[state=active]:after:h-[2px] 
                       data-[state=active]:after:bg-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-none"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="integrations" 
            className="flex items-center justify-center py-2.5 px-4 relative transition-all duration-300 
                       data-[state=active]:text-black data-[state=active]:font-semibold 
                       data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                       data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                       data-[state=active]:after:w-full data-[state=active]:after:h-[2px] 
                       data-[state=active]:after:bg-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-none"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 min-h-[500px]">
          <Card className="border border-gray-200 shadow-none rounded-xl bg-white h-full">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Settings className="h-5 w-5 text-gray-700" />
                General Settings
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                <Input id="company-name" defaultValue="Dvij Infotech LLP" className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">Default Timezone</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata" className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format" className="text-sm font-medium">Date Format</Label>
                <Input id="date-format" defaultValue="DD/MM/YYYY" className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" className="h-10 px-4 rounded-lg text-sm bg-white hover:bg-gray-50 border-gray-200">
                  <Undo2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button className="h-10 px-4 rounded-lg text-sm bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 min-h-[500px]">
          <Card className="border border-gray-200 shadow-none rounded-xl bg-white h-full">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5 text-gray-700" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Configure security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require 2FA for all users
                  </p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary h-5 w-9" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Session Timeout</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary h-5 w-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-duration" className="text-sm font-medium">Session Duration (minutes)</Label>
                <Input id="session-duration" type="number" defaultValue="30" className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" className="h-10 px-4 rounded-lg text-sm bg-white hover:bg-gray-50 border-gray-200">
                  <Undo2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button className="h-10 px-4 rounded-lg text-sm bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 min-h-[500px]">
          <Card className="border border-gray-200 shadow-none rounded-xl bg-white h-full">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Bell className="h-5 w-5 text-gray-700" />
                Email Notifications
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">System Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive system-wide alerts
                  </p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary h-5 w-9" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Security Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about security events
                  </p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary h-5 w-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-email" className="text-sm font-medium">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="admin@dvijinfotech.com"
                  className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" className="h-10 px-4 rounded-lg text-sm bg-white hover:bg-gray-50 border-gray-200">
                  <Undo2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button className="h-10 px-4 rounded-lg text-sm bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 min-h-[500px]">
          <Card className="border border-gray-200 shadow-none rounded-xl bg-white h-full">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Cloud className="h-5 w-5 text-gray-700" />
                API & Integrations
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Manage system integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
                <Input id="api-key" type="password" defaultValue="••••••••••••••••" className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable API Access</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow external systems to access the API
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-primary h-5 w-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-sm font-medium">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://api.example.com/webhook"
                  className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" className="h-10 px-4 rounded-lg text-sm bg-white hover:bg-gray-50 border-gray-200">
                  <Undo2 className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button className="h-10 px-4 rounded-lg text-sm bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}