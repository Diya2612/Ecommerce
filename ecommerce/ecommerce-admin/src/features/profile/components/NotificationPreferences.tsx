import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { NotificationPreferences } from "../types";

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: NotificationPreferences) => void;
}

export default function NotificationPreferencesComponent({ preferences, onUpdate }: NotificationPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleChannelChange = (channel: keyof Pick<NotificationPreferences, "inAppNotifications" | "emailNotifications" | "smsNotifications">, enabled: boolean) => {
    const updated = { ...localPreferences, [channel]: enabled };
    setLocalPreferences(updated);
    onUpdate(updated);
  };



  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Notification Channels</CardTitle>
          <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">In-App Notifications</Label>
              <p className="text-xs text-gray-500">Receive notifications within the platform</p>
            </div>
            <Switch
              checked={localPreferences.inAppNotifications}
              onCheckedChange={(checked) => handleChannelChange("inAppNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={localPreferences.emailNotifications}
              onCheckedChange={(checked) => handleChannelChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-xs text-gray-500">Phone number verification required</p>
            </div>
            <Switch
              checked={localPreferences.smsNotifications}
              onCheckedChange={(checked) => handleChannelChange("smsNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      {/* Notification Types - HIDDEN
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Notification Types</CardTitle>
          <p className="text-sm text-gray-600">Select which notifications you want to receive</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="systemAlerts"
              checked={localPreferences.systemAlerts}
              onCheckedChange={(checked) => handleTypeChange("systemAlerts", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="systemAlerts" className="text-sm font-medium">System Alerts</Label>
              <p className="text-xs text-gray-500">Platform updates and maintenance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="securityEvents"
              checked={localPreferences.securityEvents}
              onCheckedChange={(checked) => handleTypeChange("securityEvents", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="securityEvents" className="text-sm font-medium">Security Events</Label>
              <p className="text-xs text-gray-500">Login attempts and security changes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="userActivity"
              checked={localPreferences.userActivity}
              onCheckedChange={(checked) => handleTypeChange("userActivity", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="userActivity" className="text-sm font-medium">User Activity</Label>
              <p className="text-xs text-gray-500">Student and counselor actions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eventUpdates"
              checked={localPreferences.eventUpdates}
              onCheckedChange={(checked) => handleTypeChange("eventUpdates", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="eventUpdates" className="text-sm font-medium">Event Updates</Label>
              <p className="text-xs text-gray-500">Event registration and changes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financialUpdates"
              checked={localPreferences.financialUpdates}
              onCheckedChange={(checked) => handleTypeChange("financialUpdates", checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="financialUpdates" className="text-sm font-medium">Financial Updates</Label>
              <p className="text-xs text-gray-500">Payments and invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Frequency - HIDDEN
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Frequency</CardTitle>
          <p className="text-sm text-gray-600">Applies to all enabled notifications</p>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={localPreferences.frequency} 
            onValueChange={handleFrequencyChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="real-time" id="real-time" />
              <div className="flex-1">
                <Label htmlFor="real-time" className="text-sm font-medium">Real-time</Label>
                <p className="text-xs text-gray-500">Instant notifications as they happen</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <div className="flex-1">
                <Label htmlFor="daily" className="text-sm font-medium">Daily Digest</Label>
                <p className="text-xs text-gray-500">Once per day summary</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <div className="flex-1">
                <Label htmlFor="weekly" className="text-sm font-medium">Weekly Digest</Label>
                <p className="text-xs text-gray-500">Weekly summary on Mondays</p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      */}
    </div>
  );
}