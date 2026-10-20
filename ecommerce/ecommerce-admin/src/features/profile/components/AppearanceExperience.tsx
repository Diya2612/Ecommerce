import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppearanceSettings } from "../types";

interface AppearanceExperienceProps {
  settings: AppearanceSettings;
  onUpdate: (settings: AppearanceSettings) => void;
  onLogoutAllSessions: () => void;
}

export default function AppearanceExperience({ settings, onUpdate, onLogoutAllSessions }: AppearanceExperienceProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleUpdate = (updates: Partial<AppearanceSettings>) => {
    const updated = { ...localSettings, ...updates };
    setLocalSettings(updated);
    onUpdate(updated);
  };

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out of all sessions? You will be signed out from all devices.")) {
      onLogoutAllSessions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Table Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rows per page</Label>
            <Select
              value={localSettings.rowsPerPage.toString()}
              onValueChange={(value) => handleUpdate({ rowsPerPage: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-red-600 flex items-center space-x-2">
            <span>⚠️</span>
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">Log out of all sessions</h4>
              <p className="text-sm text-red-700">You will be logged out from all devices and browsers</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogoutAll}>
              Log Out All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
