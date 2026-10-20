import React from 'react';
import {

  Save,
  Puzzle,
  Plus,
  ExternalLink,
  Settings,
  Trash2
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const AppsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const installedApps = [
    { id: 1, name: 'Razorpay Payments', description: 'Accept payments via UPI, cards, and more', category: 'Payments', enabled: true, installed: '2024-10-15' },
    { id: 2, name: 'Shiprocket', description: 'Automated shipping and logistics', category: 'Shipping', enabled: true, installed: '2024-10-15' },
    { id: 3, name: 'Google Analytics', description: 'Track website traffic and conversions', category: 'Analytics', enabled: true, installed: '2024-10-20' },
    { id: 4, name: 'Mailchimp', description: 'Email marketing automation', category: 'Marketing', enabled: false, installed: '2024-11-05' },
    { id: 5, name: 'WhatsApp Business', description: 'Customer communication via WhatsApp', category: 'Communication', enabled: true, installed: '2024-11-10' },
  ];

  const availableApps = [
    { id: 6, name: 'Zoho CRM', description: 'Customer relationship management', category: 'CRM' },
    { id: 7, name: 'Tally Integration', description: 'Accounting sync with Tally', category: 'Accounting' },
    { id: 8, name: 'Facebook Pixel', description: 'Track ad conversions', category: 'Marketing' },
  ];

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Apps & Integrations"
        subtitle="Manage your connected apps and integrations."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Apps', active: true }
        ]}
        onBack={handleBack}
        actions={
          <>
            <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900">
              Cancel
            </Button>
            <Button className="bg-[#2e1065] hover:bg-[#2e1065]/90 text-white shadow-sm gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </>
        }
      />

      <div className="container max-w-7xl mx-auto px-6 pb-8">
        <div className="space-y-6">

          {/* SECTION 1 — Installed Apps */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Puzzle className="size-5 text-[#2e1065]" />
                Installed Apps
              </CardTitle>
              <CardDescription>Manage your connected apps and integrations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {installedApps.map((app) => (
                  <div key={app.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Puzzle className="text-[#2e1065]" size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{app.name}</h3>
                            <Badge variant="secondary" className="text-xs">{app.category}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{app.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked={app.enabled} />
                        <Button variant="ghost" size="icon">
                          <Settings size={16} />
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

          {/* SECTION 2 — Available Apps */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Available Apps</CardTitle>
                <CardDescription>Browse and install new integrations.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <ExternalLink size={14} /> App Store
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableApps.map((app) => (
                  <div key={app.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <Puzzle className="text-slate-500" size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{app.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{app.description}</p>
                        <Badge variant="secondary" className="text-xs mt-2">{app.category}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-4 gap-2">
                      <Plus size={14} /> Install
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — API Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">API Settings</CardTitle>
              <CardDescription>Manage API access for custom integrations.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable API Access</Label>
                  <p className="text-sm text-slate-500">Allow external applications to access your store data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Rate Limiting</Label>
                    <p className="text-xs text-slate-500">1000 requests/hour</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Webhook Events</Label>
                    <p className="text-xs text-slate-500">Send event notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button variant="outline" className="gap-2">
                <Plus size={16} /> Generate API Key
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AppsPage;
