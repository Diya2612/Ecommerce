import { useState, useRef, useMemo } from 'react';
import { Shield, Check, Save, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layouts/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface AssignRoleToUserProps {
  userId: string;
  onBack: () => void;
  onSave: (userId: string, roles: string[]) => void;
}

const availableRoles = [
  {
    name: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access with all permissions',
    permissionsCount: 45,
  },
  {
    name: 'MANAGER',
    label: 'Manager',
    description: 'Can manage orders, products, and view reports',
    permissionsCount: 28,
  },
  {
    name: 'SALES_REP',
    label: 'Sales Representative',
    description: 'Can create and manage orders and customers',
    permissionsCount: 15,
  },
  {
    name: 'SUPPORT',
    label: 'Support Agent',
    description: 'Can view orders and customer information',
    permissionsCount: 12,
  },
  {
    name: 'GUEST',
    label: 'Guest',
    description: 'Read-only access to basic information',
    permissionsCount: 5,
  },
];

const mockUserPermissions = [
  'orders.view',
  'orders.create',
  'orders.update',
  'products.view',
  'products.update',
  'customers.view',
  'inventory.view',
];

export function AssignRoleToUser({ userId, onBack, onSave }: AssignRoleToUserProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['MANAGER']);
  // Keep an initial snapshot to detect unsaved changes
  const initialRolesRef = useRef<string[]>(selectedRoles);

  const isDirty = useMemo(() => {
    const a = initialRolesRef.current;
    const b = selectedRoles;
    if (a.length !== b.length) return true;
    const setA = new Set(a);
    return b.some((r) => !setA.has(r));
  }, [selectedRoles]);

  // Mock user data
  const userData = {
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSave = () => {
    onSave(userId, selectedRoles);
    // After successful save, update the snapshot so changes are considered saved
    initialRolesRef.current = selectedRoles;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="colspace-y-6">
      <PageHeader
        className="-mx-6 px-6 lg:-mx-8 lg:px-8"
        title="Assign Role to User"
        subtitle="Manage user role assignments and permissions"
        breadcrumbs={[{ label: 'Access Management', onClick: onBack }, { label: 'Assign Role to User', active: true }]}
        backIcon="arrow"
        onBack={onBack}
        actions={(
          <>
            {isDirty && (
              <>
                <Button variant="outline" onClick={() => setSelectedRoles(initialRolesRef.current)} className="rounded-xl h-[44px] px-6">
                  Cancel
                </Button>

                <Button onClick={handleSave} className="rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm">
                  <Save className="size-4 mr-2" />
                  Save Changes
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { /* placeholder delete */ }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="size-4 mr-2" />
                      Delete Role Assignment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-slate-200 sticky top-6">
            <CardHeader>
              <CardTitle className="text-slate-900">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200">
                <Avatar className="w-20 h-20 mb-3">
                  <AvatarFallback className="bg-slate-100 text-slate-900 text-xl">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-slate-900 font-semibold">{userData.name}</h3>
                <p className="text-slate-600 text-sm">{userData.email}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-slate-600 text-xs">Current Role(s)</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedRoles.length === 0 ? (
                      <Badge variant="secondary">No roles assigned</Badge>
                    ) : (
                      selectedRoles.map((role) => (
                        <Badge key={role} className="bg-slate-900 text-white">
                          {role}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-600 text-xs">Total Permissions</Label>
                  <div className="text-slate-900 text-2xl font-bold mt-1">{mockUserPermissions.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Select Roles</CardTitle>
              <p className="text-slate-600 text-sm">
                Choose one or more roles for this user
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.name);

                return (
                  <div
                    key={role.name}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleRole(role.name)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-900 font-medium">{role.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {role.name}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mt-1">
                              {role.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-500 text-xs">Permissions</div>
                            <div className="text-slate-900 font-semibold">{role.permissionsCount}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Permissions Preview */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Granted Permissions Preview</CardTitle>
              <p className="text-slate-600 text-sm">
                Permissions this user will have based on selected roles
              </p>
            </CardHeader>
            <CardContent>
              {selectedRoles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No roles selected. Select roles to preview permissions.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mockUserPermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between p-2 rounded bg-slate-50"
                    >
                      <code className="text-xs text-slate-900">{permission}</code>
                      <Badge variant="outline" className="text-xs capitalize">
                        {permission.split('.')[0]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
