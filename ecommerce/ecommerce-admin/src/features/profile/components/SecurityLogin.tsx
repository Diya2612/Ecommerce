import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch"; // re-enable when MFA is active
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Monitor, Smartphone, Lock } from "lucide-react";
import type { SecuritySettings, ActiveSession, LoginHistory } from "../types";

interface SecurityLoginProps {
  securitySettings: SecuritySettings;
  activeSessions: ActiveSession[];
  loginHistory: LoginHistory[];
  onLogoutAllSessions: () => void;
  onLogoutSession: (sessionId: string) => void;
  onChangePassword: (data: any) => Promise<void>;
  onEnrollMfa: () => Promise<any>;
  onVerifyMfa: (factorId: string, code: string) => Promise<any>;
  onDisableMfa: (factorId: string) => Promise<void>;
}

export default function SecurityLogin({
  // securitySettings,
  activeSessions,
  onLogoutAllSessions,
  onLogoutSession,
  onChangePassword,
  // onEnrollMfa,
  // onVerifyMfa,
  // onDisableMfa
}: SecurityLoginProps) {
  // Password Change State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // MFA State
  // MFA state — re-enable when 2FA is active
  // const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false);
  // const [mfaStep, setMfaStep] = useState<'intro' | 'scan' | 'verify'>('intro');
  // const [mfaData, setMfaData] = useState<{ id: string; qr_code: string; secret: string } | null>(null);
  // const [mfaCode, setMfaCode] = useState("");

  // Session logout state
  const [logoutingSessionId, setLogoutingSessionId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password Handlers
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleChangePassword = async () => {
    setError(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // MFA Handlers
  // handleStartMfa — re-enable when 2FA is active
  // const handleStartMfa = async () => { ... };

  // handleVerifyMfa — re-enable when 2FA is active
  // const handleVerifyMfa = async () => { ... };

  // handleDisableMfa — re-enable when 2FA is active
  // const handleDisableMfa = async () => { ... };

  // handleMfaSwitch — re-enable when 2FA is active
  // const handleMfaSwitch = (checked: boolean) => { ... };

  // Session logout handlers
  const handleLogoutSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to log out this session?')) {
      return;
    }

    setLogoutingSessionId(sessionId);
    try {
      await onLogoutSession(sessionId);
    } catch (error) {
      console.error('Failed to logout session:', error);
    } finally {
      setLogoutingSessionId(null);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('This will log you out from ALL devices including this one. You will need to login again. Continue?')) {
      return;
    }

    try {
      await onLogoutAllSessions();
    } catch (error) {
      console.error('Failed to logout all sessions:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Column: Password and MFA */}
      <div className="space-y-6">
        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Password</CardTitle>
            <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
          </CardHeader>
          <CardContent>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password to update your login credentials.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="currentPassword"
                        type="password"
                        className="pl-9"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type="password"
                        className="pl-9"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-9"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication - temporarily disabled */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Status: <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                    {securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </p>
                {securitySettings.twoFactorEnabled && (
                  <p className="text-xs text-gray-500 mt-1">
                    Method: {securitySettings.twoFactorMethod || 'Authenticator App'}
                    <br />Last verified: {securitySettings.lastVerified || 'N/A'}
                  </p>
                )}
              </div>

              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={handleMfaSwitch}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
        </Card> */}

        {/* MFA Setup Dialog - temporarily disabled */}
        {/* <Dialog open={isMfaDialogOpen} onOpenChange={setIsMfaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Protect your account by adding an extra layer of security.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {mfaStep === 'scan' && mfaData && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">1. Scan this QR Code</p>
                    <p className="text-xs text-gray-500">Use your authenticator app (Google Authenticator, Authy, etc.)</p>
                  </div>
                  <div className="p-4 bg-white border rounded-lg shadow-sm" dangerouslySetInnerHTML={{ __html: mfaData.qr_code }} />

                  <div className="text-center w-full max-w-xs">
                    <p className="text-sm font-medium mb-1">Or enter this code manually:</p>
                    <code className="block p-2 bg-gray-100 rounded text-xs break-all">{mfaData.secret}</code>
                  </div>

                  <div className="w-full pt-4 border-t">
                    <Label>2. Enter the 6-digit code from your app</Label>
                    <Input
                      className="mt-2 text-center text-lg tracking-widest"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMfaDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleVerifyMfa} disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? "Verifying..." : "Verify and Enable"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>

      {/* Right Column: Active Sessions */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
              {activeSessions.length > 5 && (
                <p className="text-xs text-gray-500 mt-1">Showing 5 of {activeSessions.length} sessions</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="destructive"
              size="sm"
              className="w-full mb-2"
              onClick={handleLogoutAllSessions}
            >
              Log out from ALL devices
            </Button>
            {activeSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex flex-col p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                      {session.device.includes("Mobile") ? (
                        <Smartphone className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Monitor className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{session.device}</p>
                      <p className="text-xs text-gray-600">{session.location}</p>
                    </div>
                  </div>
                  <div>
                    {session.isCurrent ? (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px]">Current</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-red-600 hover:text-red-700 text-xs px-2"
                        disabled={logoutingSessionId === session.id}
                        onClick={() => handleLogoutSession(session.id)}
                      >
                        {logoutingSessionId === session.id ? 'Logging out...' : 'Log out'}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">{session.lastActive}</p>
              </div>
            ))}
            {activeSessions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No active sessions found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}