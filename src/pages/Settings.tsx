import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RecurringShiftPatterns from "@/components/settings/RecurringShiftPatterns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, User, Building2, Calendar, Bell } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface ClinicType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data for providers and clinic types
  const [providers, setProviders] = useState<Provider[]>([
    { id: "1", name: "Bibiana Patrick", color: "#8BC34A", isActive: true },
    { id: "2", name: "Joy Ferro", color: "#FF9800", isActive: true },
    { id: "3", name: "Julia Friederich", color: "#E91E63", isActive: true },
    { id: "4", name: "John Pound", color: "#607D8B", isActive: true },
    { id: "5", name: "Jim Knox", color: "#9E9D24", isActive: true },
    { id: "6", name: "Ludjelie Manigat", color: "#673AB7", isActive: true },
    { id: "7", name: "Tiffany Good", color: "#00BCD4", isActive: true },
    { id: "8", name: "Elizabeth Swaggerty", color: "#4CAF50", isActive: true },
    { id: "9", name: "Philip Sutherland", color: "#2196F3", isActive: true },
    { id: "10", name: "Carlos Mondragon", color: "#795548", isActive: true },
    { id: "11", name: "Olivia Gonzales", color: "#689F38", isActive: true },
    { id: "12", name: "Heidi Kelly", color: "#F48FB1", isActive: true },
  ]);

  const [clinicTypes, setClinicTypes] = useState<ClinicType[]>([
    { id: "1", name: "Clinica Medicos", color: "#4CAF50", isActive: true },
    { id: "2", name: "Urgent Care", color: "#FF9800", isActive: true },
  ]);

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoSave: true,
    darkMode: false,
    defaultView: "month",
    defaultCalendarDays: 5,
    adminEmail: "admin@example.com",
  });

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    console.log("Settings saved:", settings);
    // Here you would typically save to a database
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        userName="Admin User"
        userRole="admin"
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="recurring-patterns">
                  Recurring Patterns
                </TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Calendar Settings
                    </CardTitle>
                    <CardDescription>
                      Configure your default calendar view and behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="defaultView">
                          Default Calendar View
                        </Label>
                        <select
                          id="defaultView"
                          className="w-full p-2 border rounded-md"
                          value={settings.defaultView}
                          onChange={(e) =>
                            handleSettingChange("defaultView", e.target.value)
                          }
                        >
                          <option value="month">Month</option>
                          <option value="three-month">Three Month</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultCalendarDays">
                          Default Calendar Days
                        </Label>
                        <Input
                          id="defaultCalendarDays"
                          type="number"
                          min="1"
                          max="31"
                          value={settings.defaultCalendarDays}
                          onChange={(e) =>
                            handleSettingChange(
                              "defaultCalendarDays",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoSave"
                        checked={settings.autoSave}
                        onCheckedChange={(checked) =>
                          handleSettingChange("autoSave", checked)
                        }
                      />
                      <Label htmlFor="autoSave">
                        Auto-save calendar changes
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>
                      Update your account information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) =>
                          handleSettingChange("adminEmail", e.target.value)
                        }
                      />
                    </div>

                    <Button onClick={handleSaveSettings} className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Configure how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("emailNotifications", checked)
                        }
                      />
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("smsNotifications", checked)
                        }
                      />
                      <Label htmlFor="smsNotifications">
                        SMS Notifications
                      </Label>
                    </div>

                    <Button onClick={handleSaveSettings} className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recurring-patterns" className="space-y-6">
                <RecurringShiftPatterns
                  providers={providers}
                  clinicTypes={clinicTypes}
                />
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="darkMode"
                        checked={settings.darkMode}
                        onCheckedChange={(checked) =>
                          handleSettingChange("darkMode", checked)
                        }
                      />
                      <Label htmlFor="darkMode">Dark Mode</Label>
                    </div>

                    <Button onClick={handleSaveSettings} className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Appearance Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
