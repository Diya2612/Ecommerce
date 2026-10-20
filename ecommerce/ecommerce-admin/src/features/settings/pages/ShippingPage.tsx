import React, { useState } from 'react';
import {
  Save,
  Truck,
  Map,
  Scale,
  Package,
  Store,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

import { PageHeader } from '@/components/layouts/headers';

interface ShippingPartner {
  id: string;
  name: string;
  enabled: boolean;
  transitDays: number;
  services: string[];
  trackingUrl: string;
}

const ShippingPage: React.FC = () => {
  const navigate = useNavigate();
  const [rateMethod, setRateMethod] = useState('weight');

  const [partners] = useState<ShippingPartner[]>([
    {
      id: '1',
      name: 'Delhivery',
      enabled: true,
      transitDays: 3,
      services: ['Standard', 'COD'],
      trackingUrl: 'https://www.delhivery.com/track/package/{id}'
    },
    {
      id: '2',
      name: 'BlueDart',
      enabled: true,
      transitDays: 2,
      services: ['Express', 'Standard'],
      trackingUrl: 'https://bluedart.com/track?ref={id}'
    },
  ]);

  const handleBack = () => {
    navigate('/settings');
  };



  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Shipping & Delivery"
        subtitle="Manage your integrated carrier partners and delivery zones."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Shipping & Delivery', active: true }
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

          {/* SECTION 1 — Shipping Partners */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="size-5 text-[#2e1065]" />
                  Shipping Partners
                </CardTitle>
                <CardDescription>Manage your integrated carrier partners.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add New Partner
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {partners.map((partner) => (
                  <div key={partner.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="size-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 border border-purple-100">
                          <Truck className="text-[#2e1065]" size={20} />
                        </div>
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between md:justify-start md:gap-4">
                            <h3 className="font-semibold text-slate-900 text-base">{partner.name}</h3>
                            <Badge variant={partner.enabled ? "default" : "secondary"} className={partner.enabled ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                              {partner.enabled ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-500">Default Transit Days</Label>
                              <Input type="number" defaultValue={partner.transitDays} className="h-9 w-24 bg-slate-50/50 focus:bg-white transition-colors" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-500">Tracking URL Template</Label>
                              <div className="flex items-center gap-2">
                                <Input defaultValue={partner.trackingUrl} className="h-9 flex-1 text-xs font-mono bg-slate-50/50 focus:bg-white transition-colors" />
                                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-slate-400">
                                  <ExternalLink size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 pt-3">
                            {['Standard', 'Express', 'Same-Day', 'COD'].map(service => (
                              <div key={service} className="flex items-center space-x-2">
                                <Checkbox id={`svc-${partner.id}-${service}`} defaultChecked={partner.services.includes(service)} />
                                <Label htmlFor={`svc-${partner.id}-${service}`} className="text-sm font-normal">{service}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enable-${partner.id}`} className="text-sm font-medium cursor-pointer">Enable</Label>
                          <Switch id={`enable-${partner.id}`} checked={partner.enabled} />
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2">
                          Remove Partner
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Delivery Zones */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Map className="size-5 text-[#2e1065]" />
                  Delivery Zones
                </CardTitle>
                <CardDescription>Define regions, pincodes, or states where you ship.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Zone
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-purple-50 text-[#2e1065] flex items-center justify-center font-bold text-xs">
                    Z1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">Metro Cities</h4>
                    <p className="text-xs text-slate-500">Delhi, Mumbai, Bangalore, Chennai • 2-3 Days</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    Z2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">Rest of India</h4>
                    <p className="text-xs text-slate-500">All other serviceable pincodes • 5-7 Days</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Shipping Rates & Rules */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="size-5 text-[#2e1065]" />
                Shipping Rates & Rules
              </CardTitle>
              <CardDescription>Define how shipping costs are calculated for the customer.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label>Rate Calculation Method</Label>
                <div className="flex flex-wrap gap-4">
                  {['Weight-based', 'Value-based', 'Flat Rate'].map(method => (
                    <div
                      key={method}
                      onClick={() => setRateMethod(method.toLowerCase().split('-')[0])}
                      className={`cursor-pointer px-4 py-3 rounded-lg border flex items-center gap-2 transition-all ${rateMethod === method.toLowerCase().split('-')[0] ? 'border-[#2e1065] bg-purple-50 text-[#2e1065] ring-1 ring-[#2e1065]' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`size-4 rounded-full border flex items-center justify-center ${rateMethod === method.toLowerCase().split('-')[0] ? 'border-[#2e1065]' : 'border-slate-400'}`}>
                        {rateMethod === method.toLowerCase().split('-')[0] && <div className="size-2 rounded-full bg-[#2e1065]" />}
                      </div>
                      <span className="text-sm font-medium">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label>Free Shipping Threshold</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <Input type="number" defaultValue="2000" className="pl-8 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500">Cart value above which shipping is free.</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Rate Setup</Label>
                  <Button size="sm" variant="outline" className="gap-2 h-8">
                    <Plus size={14} /> Add Rule
                  </Button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <tr>
                        <th className="px-4 py-3">Min (kg)</th>
                        <th className="px-4 py-3">Max (kg)</th>
                        <th className="px-4 py-3">Charge (₹)</th>
                        <th className="px-4 py-3">Zone</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="group hover:bg-slate-50/50">
                        <td className="p-2"><Input className="h-8 w-20 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="0" /></td>
                        <td className="p-2"><Input className="h-8 w-20 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="1" /></td>
                        <td className="p-2"><Input className="h-8 w-24 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="50" /></td>
                        <td className="p-2">
                          <Select defaultValue="metro">
                            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="metro">Metro Cities</SelectItem>
                              <SelectItem value="rest">Rest of India</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                      <tr className="group hover:bg-slate-50/50">
                        <td className="p-2"><Input className="h-8 w-20 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="1" /></td>
                        <td className="p-2"><Input className="h-8 w-20 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="5" /></td>
                        <td className="p-2"><Input className="h-8 w-24 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="100" /></td>
                        <td className="p-2">
                          <Select defaultValue="metro">
                            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="metro">Metro Cities</SelectItem>
                              <SelectItem value="rest">Rest of India</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — Handling & Packaging */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="size-5 text-[#2e1065]" />
                Handling & Packaging
              </CardTitle>
              <CardDescription>Manage warehouse processing fees and packaging options.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Handling Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <Input type="number" defaultValue="0" className="pl-8 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500">Added to every order automatically.</p>
                </div>

                <div className="flex items-start justify-between pt-1">
                  <div className="space-y-0.5">
                    <Label className="text-base">Packaging Charge</Label>
                    <p className="text-sm text-slate-500">Charge customers for premium packaging.</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Available Packaging Types</Label>
                  <div className="flex flex-wrap gap-3">
                    {['Standard Box', 'Corrugated Box', 'Plastic Wrap', 'Custom Branding', 'Gift Wrap'].map(pkg => (
                      <div key={pkg} className="flex items-center space-x-2 border border-slate-200 rounded-md px-3 py-2 bg-slate-50">
                        <Checkbox id={`pkg-${pkg}`} defaultChecked={['Standard Box'].includes(pkg)} />
                        <Label htmlFor={`pkg-${pkg}`} className="text-sm cursor-pointer">{pkg}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5 — Pickup & Local Delivery */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store className="size-5 text-[#2e1065]" />
                Pickup & Local Delivery
              </CardTitle>
              <CardDescription>Configure options for local customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Store Pickup</h3>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-purple-100">
                  <div className="space-y-2">
                    <Label>Pickup Locations</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        <SelectItem value="main">Main Warehouse Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Pickup Instructions</Label>
                    <Textarea placeholder="Bring valid ID proof..." className="h-20 resize-none bg-slate-50/50 focus:bg-white transition-colors" defaultValue="Please bring a valid government ID and the order confirmation email." />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Local Delivery</h3>
                  <Switch />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4 border-l-2 border-slate-100 opacity-50 pointer-events-none">
                  <div className="space-y-2">
                    <Label>Allowed Radius (KM)</Label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Charge</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Estimate</Label>
                    <Input defaultValue="2-4 Hours" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 6 — Dispatch Rules */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="size-5 text-[#2e1065]" />
                Dispatch Rules
              </CardTitle>
              <CardDescription>Set expectations for order processing times.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Dispatch Time</Label>
                  <Select defaultValue="24">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same">Same Day</SelectItem>
                      <SelectItem value="24">Next Day (24h)</SelectItem>
                      <SelectItem value="48">48 Hours</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dispatch Cut-off Time</Label>
                  <Input type="time" defaultValue="16:00" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="partial">Allow Partial Dispatch</Label>
                  <Switch id="partial" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="challan">Auto-generate Dispatch Challan</Label>
                  <Switch id="challan" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="track-link">Show Tracking Link to Customer</Label>
                  <Switch id="track-link" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="auto-partner">Auto-assign delivery partner</Label>
                  <Switch id="auto-partner" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 7 — Return & Reverse Shipping */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="size-5 text-[#2e1065]" />
                Return & Reverse Shipping
              </CardTitle>
              <CardDescription>Configure how returns are handled.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between md:col-span-2">
                  <Label className="text-base font-semibold">Allow Returns</Label>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Return Window</Label>
                  <Select defaultValue="7">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reverse Pickup Partner</Label>
                  <Select defaultValue="delhivery">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhivery">Delhivery Reverse</SelectItem>
                      <SelectItem value="ecom">Ecom Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Customer Return Instructions</Label>
                  <Textarea defaultValue="Please keep the product in original packaging with tags intact." className="h-20 resize-none bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
};


export default ShippingPage;
