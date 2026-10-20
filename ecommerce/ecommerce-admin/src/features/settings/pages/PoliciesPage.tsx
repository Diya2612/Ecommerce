import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { notifySuccess } from '@/utils';
import { cn } from '@/lib/utils';

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null); // All collapsed by default

  // Form State
  const [formData, setFormData] = useState({
    policies: [
      { id: 1, name: 'Privacy Policy', status: 'completed', lastUpdated: 'Oct 24, 2023', content: '<p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from {{store_name}}.</p>' },
      { id: 2, name: 'Terms & Conditions', status: 'completed', lastUpdated: 'Sep 15, 2023', content: '<p>These Terms & Conditions describe the rules and regulations for the use of {{store_name}}\'s Website.</p>' },
      { id: 3, name: 'Refund Policy', status: 'incomplete', lastUpdated: '-', content: '' },
      { id: 4, name: 'Shipping Policy', status: 'incomplete', lastUpdated: '-', content: '' },
      { id: 5, name: 'Cancellation Policy', status: 'incomplete', lastUpdated: '-', content: '' },
      { id: 6, name: 'Return & Exchange Policy', status: 'incomplete', lastUpdated: '-', content: '' },
      { id: 7, name: 'Cookie Policy', status: 'completed', lastUpdated: 'Nov 01, 2023', content: '' },
      { id: 8, name: 'GDPR Compliance Notice', status: 'completed', lastUpdated: 'Nov 01, 2023', content: '' },
    ],
    customPolicies: [
      { id: 9, name: 'Digital Product Policy', status: 'active', lastUpdated: 'Oct 10, 2023' }
    ],
    compliance: {
      requireGdpr: false,
      requireTerms: false,
      requirePrivacy: false,
      showCookieBanner: false,
      cookieBannerStyle: 'bottom',
      legalName: 'Anant Enterprises Private Limited',
      registeredAddress: '123 Business St, Mumbai, India',
      taxId: '22AAAAA0000A1Z5'
    },
    publishing: {
      publishToFooter: true,
      autoUpdateUris: false,
      urlMappings: {
        privacy: 'privacy',
        terms: 'terms',
        refund: 'refund-policy',
        shipping: 'shipping-policy'
      }
    }
  });

  // Track Initial State for Change Detection
  const [initialData] = useState({ ...formData });
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleBack = () => {
    navigate('/settings');
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    notifySuccess('Policies updated successfully');
    window.location.reload();
  };

  const updateCompliance = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      compliance: { ...prev.compliance, [field]: value }
    }));
  };

  const updatePublishing = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      publishing: { ...prev.publishing, [field]: value }
    }));
  };



  return (
    <UnsavedChangesGuard hasChanges={hasChanges && !isSaving}>
      <div className="flex-1 w-full bg-slate-50/50 min-h-screen">

        <PageHeader
          title="Policies"
          subtitle="Manage your store's legal documents and compliance settings."
          breadcrumbs={[
            { label: 'Settings', onClick: handleBack },
            { label: 'Policies', active: true }
          ]}
          backIcon="arrow"
          onBack={handleBack}
          actions={
            hasChanges && (
              <div className="flex items-center gap-3">
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
                  className="rounded-xl bg-[#0E042F] hover:bg-[#1A0D3D] text-white h-[44px] px-6 gap-2 shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )
          }
        />

        <div className="w-full px-6 lg:px-8 pb-12 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* SECTION 1 — Required Store Policies */}
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-6 flex flex-row gap-4 items-start">
                  <div className="text-slate-400 mt-1">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-lg font-semibold text-slate-900 leading-none">Required Store Policies</CardTitle>
                    <CardDescription className="text-xs leading-tight">Manage the legal documents and policies displayed to your customers.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {formData.policies.map((policy, index) => (
                      <div key={policy.id} className="flex flex-col">
                        <div
                          className={cn(
                            "flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group",
                            expandedPolicy === policy.id && "bg-slate-50/50"
                          )}
                          onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="size-11 flex items-center justify-center text-slate-400 transition-colors">
                              <FileText size={22} className="opacity-80" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{policy.name}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Last updated: {policy.lastUpdated}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <Badge
                              className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none",
                                policy.status === 'completed'
                                  ? "bg-emerald-100/50 text-emerald-700"
                                  : "bg-amber-100/50 text-amber-700"
                              )}>
                              {policy.status}
                            </Badge>
                            <ChevronDown size={18} className={cn("text-slate-400 transition-transform", expandedPolicy === policy.id && "rotate-180")} />
                          </div>
                        </div>

                        {expandedPolicy === policy.id && (
                          <div className="px-6 pb-6 pt-0 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 gap-6">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs font-medium text-slate-700 uppercase tracking-wider mb-1 block">Policy Title</Label>
                                <Input
                                  defaultValue={policy.name}
                                  onChange={(e) => {
                                    const newPolicies = [...formData.policies];
                                    newPolicies[index].name = e.target.value;
                                    setFormData({ ...formData, policies: newPolicies });
                                  }}
                                  className="h-10 rounded-xl bg-[#F3F4F6] border-slate-200"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                                <div className="text-left sm:text-right">
                                  <Label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mb-1">Version</Label>
                                  <span className="text-sm font-semibold text-slate-700">1.2</span>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
                                  <div className="space-y-0.5">
                                    <Label className="text-xs font-semibold text-slate-900 leading-none">Status</Label>
                                    <p className="text-[10px] text-slate-500">{policy.status === 'completed' ? 'Published' : 'Hidden'}</p>
                                  </div>
                                  <Switch
                                    checked={policy.status === 'completed'}
                                    onCheckedChange={(checked) => {
                                      const newPolicies = [...formData.policies];
                                      newPolicies[index].status = checked ? 'completed' : 'incomplete';
                                      setFormData({ ...formData, policies: newPolicies });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <RichTextEditor
                              value={policy.content || `<p>This ${policy.name} describes how your personal information is collected, used, and shared...</p>`}
                              onChange={(value) => {
                                const newPolicies = [...formData.policies];
                                newPolicies[index].content = value;
                                setFormData({ ...formData, policies: newPolicies });
                              }}
                              minHeight={250}
                            />

                            <div className="flex items-center justify-between pt-6">
                              <Button variant="ghost" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-2 h-9">
                                <Clock size={14} className="text-slate-400" /> Restore Default Template
                              </Button>
                              <div className="flex items-center gap-3">
                                <Button variant="outline" className="h-[40px] px-6 rounded-xl flex items-center gap-2 text-slate-600 font-semibold border-slate-200">
                                  <Eye size={16} className="text-slate-400" /> Preview
                                </Button>
                                <Button className="h-[40px] px-8 rounded-xl flex items-center gap-2 bg-[#0E042F] hover:bg-[#1A0D3D] text-white shadow-sm font-semibold">
                                  {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 2 — Custom Policies */}
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-6 flex flex-row gap-4 items-start justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="text-slate-400 mt-1">
                      <FileText size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <CardTitle className="text-lg font-semibold text-slate-900 leading-none">Custom Policies</CardTitle>
                      <CardDescription className="text-xs leading-tight">Add your own pages for specific business needs.</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/settings/policies/custom/new')}
                    variant="outline"
                    size="sm"
                    className="rounded-xl flex items-center gap-2 border-slate-200 text-slate-600 font-semibold h-[40px] px-4 shadow-sm"
                  >
                    <Plus size={16} className="text-slate-400" /> Add Custom Policy
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {formData.customPolicies.map((policy, index) => (
                      <div key={policy.id} className="flex flex-col">
                        <div
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                          onClick={() => navigate(`/settings/policies/custom/${policy.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "size-11 flex items-center justify-center transition-colors text-slate-400"
                            )}>
                              <FileText size={22} className="opacity-80" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">{policy.name}</h3>
                                <Badge className="text-[10px] px-2 py-0 h-4 bg-slate-100 text-slate-500 uppercase font-bold tracking-widest rounded-sm border-0">Custom</Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">Last updated: {policy.lastUpdated}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                              <div className="space-y-0.5">
                                <Label className="text-xs font-semibold text-slate-900 leading-none">Status</Label>
                                <p className="text-[10px] text-slate-500 font-medium">{policy.status === 'active' ? 'Published' : 'Hidden'}</p>
                              </div>
                              <Switch
                                checked={policy.status === 'active'}
                                onCheckedChange={(checked) => {
                                  const newCustomPolicies = [...formData.customPolicies];
                                  newCustomPolicies[index].status = checked ? 'active' : 'inactive';
                                  setFormData({ ...formData, customPolicies: newCustomPolicies });
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/settings/policies/custom/${policy.id}`);
                                }}
                                variant="ghost"
                                className="text-[#0E042F] hover:text-[#0E042F] hover:bg-slate-100 font-semibold text-sm h-8 px-4 rounded-lg"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg size-8 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Delete logic
                                }}
                              >
                                <Trash2 size={16} className="text-slate-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-4">

              {/* SECTION 3 — Compliance & Legal Settings */}
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-3 items-start">
                  <div className="text-slate-400 mt-1">
                    <Globe size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold text-slate-900">Compliance & Legal</CardTitle>
                    <CardDescription className="text-sm text-slate-600 mt-1">Global compliance and legal business details</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="space-y-4 focus-within:ring-0">
                    {/* Consent & Banners */}
                    <div className="space-y-6 pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4 text-slate-400" />
                          <h4 className="text-sm font-semibold text-slate-900">Consent & Banners</h4>
                        </div>
                        {[
                          { field: 'requireGdpr', label: 'Require GDPR consent' },
                          { field: 'requireTerms', label: 'Require Terms checkbox' },
                          { field: 'requirePrivacy', label: 'Require Privacy checkbox' },
                          // { field: 'showCookieBanner', label: 'Show Cookie Banner' }
                        ].map((item) => (
                          <div key={item.field} className="flex items-center justify-between p-3 px-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all group">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-semibold text-slate-900 cursor-pointer" htmlFor={item.field}>{item.label}</Label>
                              <p className="text-[10px] text-slate-500 leading-tight">Requirement for checkout</p>
                            </div>
                            <Switch
                              id={item.field}
                              checked={(formData.compliance as any)[item.field]}
                              onCheckedChange={(val) => updateCompliance(item.field, val)}
                              className="shrink-0"
                            />
                          </div>
                        ))}
                      </div>

                      {/* <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-900 mb-1 block">Cookie Banner Style</Label>
                      <Select
                        value={formData.compliance.cookieBannerStyle}
                        onValueChange={(val) => updateCompliance('cookieBannerStyle', val)}
                      >
                        <SelectTrigger className="h-9 bg-[#F3F4F6] border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          <SelectItem value="bottom">Bottom Bar</SelectItem>
                          <SelectItem value="top">Top Bar</SelectItem>
                          <SelectItem value="modal">Center Modal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                    </div>

                    {/* Legal Entity info */}
                    <div className="space-y-6 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-slate-400" />
                        <h4 className="text-sm font-semibold text-slate-900">Legal Entity Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700 block">Legal Business Name</Label>
                          <Input
                            value={formData.compliance.legalName}
                            onChange={(e) => updateCompliance('legalName', e.target.value)}
                            placeholder="e.g. Acme Corp Ltd."
                            className="h-9 rounded-xl bg-[#F3F4F6] border-slate-200 px-3 text-xs focus:ring-[#0E042F]/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700 block">Registered Address</Label>
                          <Textarea
                            value={formData.compliance.registeredAddress}
                            onChange={(e) => updateCompliance('registeredAddress', e.target.value)}
                            placeholder="123 Business St, City, Country"
                            className="min-h-[80px] rounded-xl bg-[#F3F4F6] border-slate-200 p-3 text-xs resize-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700 block">Tax ID / GST</Label>
                          <Input
                            value={formData.compliance.taxId}
                            onChange={(e) => updateCompliance('taxId', e.target.value)}
                            placeholder="VAT / GST Number"
                            className="h-9 rounded-xl bg-[#F3F4F6] border-slate-200 px-3 text-xs focus:ring-[#0E042F]/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SECTION 4 — Publishing Settings */}
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-3 items-start">
                  <div className="text-slate-400 mt-1">
                    <SettingsIcon size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold text-slate-900">Publishing</CardTitle>
                    <CardDescription className="text-sm text-slate-600 mt-1">Visibility and storefront integration settings</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
                    <div className="space-y-1 pr-4">
                      <Label className="text-sm font-semibold text-slate-900" htmlFor="publish-footer">Publish to footer</Label>
                      <p className="text-xs text-slate-500 leading-tight">Add links to your storefront footer.</p>
                    </div>
                    <Switch
                      id="publish-footer"
                      checked={formData.publishing.publishToFooter}
                      onCheckedChange={(val) => updatePublishing('publishToFooter', val)}
                      className="shrink-0"
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="size-4 text-icon-muted" />
                        <h4 className="text-sm font-semibold text-slate-900">URL Mapping</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-semibold text-slate-900 leading-none">Auto-update</Label>
                          <p className="text-[10px] text-slate-500">Sync URL changes</p>
                        </div>
                        <Switch
                          checked={formData.publishing.autoUpdateUris}
                          onCheckedChange={(val) => updatePublishing('autoUpdateUris', val)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { label: 'Privacy', field: 'privacy' },
                        { label: 'Terms', field: 'terms' },
                        { label: 'Refund', field: 'refund' },
                        { label: 'Shipping', field: 'shipping' }
                      ].map((item) => (
                        <div key={item.field} className="flex flex-col gap-1">
                          <Label className="text-[11px] font-semibold text-slate-500">{item.label}</Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none opacity-50">
                              <span className="text-sm text-slate-400">/pages/</span>
                            </div>
                            <Input
                              value={(formData.publishing.urlMappings as any)[item.field]}
                              onChange={(e) => {
                                const newMappings = { ...formData.publishing.urlMappings, [item.field]: e.target.value };
                                updatePublishing('urlMappings', newMappings);
                              }}
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 pl-16 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div >
    </ UnsavedChangesGuard>
  );
};

export default PoliciesPage;
