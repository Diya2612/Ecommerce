import React, { useState } from 'react';
import { Building2, MapPin, Globe, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { notifySuccess } from '@/utils';

import { PageHeader } from '@/components/layouts/headers';

const StoreDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    storeName: 'Anant Enterprises',
    legalName: 'Anant Enterprises Private Limited',
    storeEmail: 'contact@anant.com',
    storePhone: '+91 98765 43210',
    description: 'Premier supplier of industrial spare parts and machinery.',
    businessType: 'pvt_ltd',
    industry: 'manufacturing',
    gst: '22AAAAA0000A1Z5',
    pan: 'ABCDE1234F',
    address: '123 Industrial Area, Phase II',
    city: 'Mumbai',
    state: 'mh',
    country: 'in',
    zip: '400001',
    billingSame: true,
    timezone: 'ist',
    currency: 'inr',
    language: 'en',
    dateFormat: 'dmy',
    fiscalYear: 'apr',
    displayStorefront: true
  });

  // Track Initial State for Change Detection
  const [initialData] = useState({ ...formData });

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);


  const handleBack = () => {
    navigate('/settings');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    notifySuccess('Settings updated successfully');
    // In a real app, we would update initialData here or re-fetch
    window.location.reload();
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <UnsavedChangesGuard hasChanges={hasChanges && !isSaving}>
      <div className="flex-1 w-full bg-slate-50/50 min-h-screen">

        <PageHeader
          title="Store / Company Details"
          subtitle="Manage your public profile and company details."
          breadcrumbs={[
            { label: 'Settings', onClick: handleBack },
            { label: 'Store Details', active: true }
          ]}
          onBack={handleBack}
          backIcon="arrow"
          actions={
            hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-xl h-[44px] px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl bg-[#0E042F] hover:bg-[#1A0D3D] text-[var(--text-white)]/90 h-[44px] px-6 gap-2 shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )
          }
        />

        <div className="w-full px-6 lg:px-8 pb-12 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">

              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-4 items-start">
                  <div className="text-slate-400 mt-1">
                    <Building2 size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-semibold text-slate-900 leading-none">Store Information</CardTitle>
                    <CardDescription className="text-xs leading-tight">Manage your public profile and company details.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-4">

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="storeName">Store Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => updateField('storeName', e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="legalName">Legal Business Name</Label>
                      <Input
                        id="legalName"
                        value={formData.legalName}
                        onChange={(e) => updateField('legalName', e.target.value)}
                        placeholder="As registered"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="storeEmail">Store Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={formData.storeEmail}
                        onChange={(e) => updateField('storeEmail', e.target.value)}
                        placeholder="contact@company.com"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="storePhone">Store Phone Number</Label>
                      <Input
                        id="storePhone"
                        type="tel"
                        value={formData.storePhone}
                        onChange={(e) => updateField('storePhone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="description">Store Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Tell us about your business..."
                        className="min-h-[100px] resize-none bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                      <p className="text-[13px] text-slate-500">This will be displayed on your profile page.</p>
                    </div>
                  </div>



                  {/* Business Type & Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block">Business Type</Label>
                      <Select value={formData.businessType} onValueChange={(val) => updateField('businessType', val)}>
                        <SelectTrigger className="bg-[#F3F4F6] border-slate-200 rounded-xl h-9">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                          <SelectItem value="pvt_ltd">Private Limited Company</SelectItem>
                          <SelectItem value="public_ltd">Public Limited Company</SelectItem>
                          <SelectItem value="franchise">Franchise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block">Store Industry</Label>
                      <Select value={formData.industry} onValueChange={(val) => updateField('industry', val)}>
                        <SelectTrigger className="bg-[#F3F4F6] border-slate-200 rounded-xl h-9">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail & Fashion</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  {/* Logos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-slate-700 block">Company Logo</Label>
                      <div className="flex items-start gap-4">
                        <div className="size-24 rounded-lg border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="text-gray-400 size-8" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-9">Upload New</Button>
                            <Button variant="ghost" size="sm" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Recommended dimensions: 512x512px.<br />Supported formats: PNG, JPG.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-slate-700 block">Favicon</Label>
                      <div className="flex items-start gap-4">
                        <div className="size-16 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-8 bg-slate-300/30 rounded-sm" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Button variant="outline" size="sm" className="h-9">Upload Favicon</Button>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Recommended dimensions: 32x32px.<br />Supported formats: ICO, PNG.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Registration Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="gst">Registration / GST Number</Label>
                      <Input
                        id="gst"
                        value={formData.gst}
                        onChange={(e) => updateField('gst', e.target.value)}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        className="uppercase font-mono bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                      <p className="text-[13px] text-slate-500">Required for tax invoices.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="pan">PAN Number</Label>
                      <Input
                        id="pan"
                        value={formData.pan}
                        onChange={(e) => updateField('pan', e.target.value)}
                        placeholder="e.g. ABCDE1234F"
                        className="uppercase font-mono bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-4 items-start">
                  <div className="text-slate-400 mt-1">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-semibold text-slate-900 leading-none">Business Address</CardTitle>
                    <CardDescription className="text-xs leading-tight">The primary location of your business operations.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700 block" htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="123 Main St, Suite 400"
                      className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="New York"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block">State / Province</Label>
                      <Select value={formData.state} onValueChange={(val) => updateField('state', val)}>
                        <SelectTrigger className="bg-[#F3F4F6] border-slate-200 rounded-xl h-9">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="mh">Maharashtra</SelectItem>
                          <SelectItem value="dl">Delhi</SelectItem>
                          <SelectItem value="ka">Karnataka</SelectItem>
                          <SelectItem value="gj">Gujarat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block">Country</Label>
                      <Select value={formData.country} onValueChange={(val) => updateField('country', val)}>
                        <SelectTrigger className="bg-[#F3F4F6] border-slate-200 rounded-xl h-9">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="in">India</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700 block" htmlFor="zip">Pincode / ZIP Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => updateField('zip', e.target.value)}
                        placeholder="10001"
                        className="bg-[#F3F4F6] border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2 hover:bg-slate-100 transition-all">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-slate-900 cursor-pointer" htmlFor="billing-toggle">Use same address for billing & operations</Label>
                      <p className="text-xs text-slate-500">Billing address will match the operations address.</p>
                    </div>
                    <Switch id="billing-toggle" checked={formData.billingSame} onCheckedChange={(val) => updateField('billingSame', val)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">

              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-4 items-start">
                  <div className="text-slate-400 mt-1">
                    <Globe size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-semibold text-slate-900 leading-none">Store Profile & Preferences</CardTitle>
                    <CardDescription className="text-xs leading-tight">Configure regional settings and store visibility.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-4">


                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Default Time Zone</Label>
                      <Select value={formData.timezone} onValueChange={(val) => updateField('timezone', val)}>
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (US & Canada)</SelectItem>
                          <SelectItem value="pst">Pacific Time (US & Canada)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Default Currency</Label>
                      <Select value={formData.currency} onValueChange={(val) => updateField('currency', val)}>
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Default Language</Label>
                      <Select value={formData.language} onValueChange={(val) => updateField('language', val)}>
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Date Format</Label>
                      <Select value={formData.dateFormat} onValueChange={(val) => updateField('dateFormat', val)}>
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">Fiscal Year Start</Label>
                      <Select value={formData.fiscalYear} onValueChange={(val) => updateField('fiscalYear', val)}>
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jan">January</SelectItem>
                          <SelectItem value="apr">April</SelectItem>
                          <SelectItem value="jul">July</SelectItem>
                          <SelectItem value="oct">October</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold text-slate-900 cursor-pointer" htmlFor="display-storefront">Display Storefront?</Label>
                        <p className="text-xs text-slate-500">Make your store visible to public visitors.</p>
                      </div>
                      <Switch id="display-storefront" checked={formData.displayStorefront} onCheckedChange={(val) => updateField('displayStorefront', val)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UnsavedChangesGuard>
  );
};

export default StoreDetailsPage;
