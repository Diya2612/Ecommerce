import React from 'react';
import {

  Save,
  Globe,
  Plus,
  DollarSign,
  Languages
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const MarketsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const markets = [
    { id: 1, name: 'India', code: 'IN', currency: 'INR', status: 'primary', countries: 1 },
    { id: 2, name: 'United States', code: 'US', currency: 'USD', status: 'active', countries: 1 },
    { id: 3, name: 'Europe', code: 'EU', currency: 'EUR', status: 'active', countries: 27 },
    { id: 4, name: 'United Kingdom', code: 'UK', currency: 'GBP', status: 'draft', countries: 1 },
  ];

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Markets"
        subtitle="Manage where you sell and what currencies you accept."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Markets', active: true }
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

          {/* SECTION 1 — Markets Overview */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="size-5 text-[#2e1065]" />
                  Active Markets
                </CardTitle>
                <CardDescription>Manage where you sell and what currencies you accept.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Market
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {markets.map((market) => (
                  <div key={market.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-purple-50 rounded-lg flex items-center justify-center text-[#2e1065] font-bold text-sm">
                          {market.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{market.name}</h3>
                            {market.status === 'primary' && (
                              <Badge className="bg-[#2e1065] text-white">Primary</Badge>
                            )}
                            {market.status === 'active' && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                            )}
                            {market.status === 'draft' && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{market.countries} {market.countries === 1 ? 'country' : 'countries'} • {market.currency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch defaultChecked={market.status !== 'draft'} />
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Currency Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="size-5 text-[#2e1065]" />
                Currency Settings
              </CardTitle>
              <CardDescription>Configure base currency and exchange rates.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Base Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="gbp">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exchange Rate Update</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="daily">Daily (Automatic)</SelectItem>
                      <SelectItem value="realtime">Real-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base">Currency Display</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                    <Label className="cursor-pointer">Show currency symbol</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                    <Label className="cursor-pointer">Round to whole numbers</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                    <Label className="cursor-pointer">Auto-convert prices</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                    <Label className="cursor-pointer">Show original price</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Language & Localization */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Languages className="size-5 text-[#2e1065]" />
                Regional Preferences
              </CardTitle>
              <CardDescription>Set default preferences for international customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Select defaultValue="ist">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="pst">America/Los_Angeles (PST)</SelectItem>
                      <SelectItem value="gmt">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select defaultValue="dmy">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight Unit</Label>
                  <Select defaultValue="kg">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dimension Unit</Label>
                  <Select defaultValue="cm">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="in">Inches (in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
