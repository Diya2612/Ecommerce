import React from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Save,
  Users,
  Plus,
  Shield,
  Mail,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const UsersPermissionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const users = [
    { id: 1, name: 'Pankaj Avhad', email: 'pankaj@anantenterprises.com', role: 'Admin', status: 'active', lastActive: '2 min ago' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@anantenterprises.com', role: 'Manager', status: 'active', lastActive: '1 hour ago' },
    { id: 3, name: 'Priya Patel', email: 'priya@anantenterprises.com', role: 'Sales', status: 'active', lastActive: '3 hours ago' },
    { id: 4, name: 'Amit Kumar', email: 'amit@anantenterprises.com', role: 'Support', status: 'invited', lastActive: 'Pending' },
  ];

  const roles = [
    { id: 1, name: 'Admin', description: 'Full access to all settings and data', users: 1, permissions: 'all' },
    { id: 2, name: 'Manager', description: 'Manage orders, products, and customers', users: 1, permissions: 'most' },
    { id: 3, name: 'Sales', description: 'View and manage orders', users: 1, permissions: 'limited' },
    { id: 4, name: 'Support', description: 'Handle customer inquiries', users: 1, permissions: 'limited' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-500">
      {/* Fixed Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={handleBack} className="hover:text-slate-800 transition-colors hover:underline">Settings</button>
            <ChevronRight className="size-4" />
            <span className="font-medium text-slate-900">Users & Permissions</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 lg:hidden">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Users & Permissions</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900">
            Cancel
          </Button>
          <Button className="bg-[#2e1065] hover:bg-[#2e1065]/90 text-white shadow-sm gap-2">
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-6">

          {/* SECTION 1 — Team Members */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="size-5 text-gray-400" />
                  Team Members
                </CardTitle>
                <CardDescription>Manage users who can access your admin panel.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Invite User
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-purple-50 rounded-full flex items-center justify-center text-[#2e1065] font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{user.name}</h3>
                            {user.status === 'invited' && (
                              <Badge variant="secondary" className="text-xs">Invited</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Mail size={12} />
                            <span>{user.email}</span>
                            <span>•</span>
                            <span>{user.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-100 text-[#2e1065] hover:bg-purple-100">{user.role}</Badge>
                        <Button variant="ghost" size="icon">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Roles */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="size-5 text-gray-400" />
                  Roles
                </CardTitle>
                <CardDescription>Define permission sets for different user types.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Create Role
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Shield className="text-gray-400" size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{role.name}</h3>
                          <p className="text-sm text-slate-500">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{role.users} user{role.users !== 1 ? 's' : ''}</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Invite New User */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Invite New User</CardTitle>
              <CardDescription>Send an invitation to join your team.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter name" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="user@company.com" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue="sales">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base">Quick Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['View Orders', 'Edit Products', 'Manage Customers', 'Access Reports', 'Process Refunds', 'Edit Settings', 'Manage Users', 'View Analytics'].map((perm) => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox id={`perm-${perm}`} defaultChecked={['View Orders', 'View Analytics'].includes(perm)} />
                      <Label htmlFor={`perm-${perm}`} className="font-normal text-sm">{perm}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="bg-[#2e1065] hover:bg-[#2e1065]/90 text-white">
                <Mail size={16} className="mr-2" /> Send Invitation
              </Button>
            </CardContent>
          </Card>

          {/* SECTION 4 — Security Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Security Settings</CardTitle>
              <CardDescription>Configure authentication and access policies.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-slate-500">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>IP Whitelisting</Label>
                    <p className="text-xs text-slate-500">Restrict access by IP</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-xs text-slate-500">Email on new device login</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 sm:left-[280px] right-0 p-4 bg-white border-t border-slate-200 z-50 flex items-center justify-between md:justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="text-sm text-slate-500 hidden md:block mr-auto">
          Permission changes take effect immediately.
        </span>
        <Button variant="ghost" onClick={handleBack} className="flex-1 md:flex-none text-slate-600 hover:text-slate-900">
          Cancel
        </Button>
        <Button className="flex-1 md:flex-none bg-[#2e1065] hover:bg-[#2e1065]/90 text-white min-w-[140px] shadow-md">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UsersPermissionsPage;
