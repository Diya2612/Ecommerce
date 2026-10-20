import React, { useState } from 'react';
import {

  Save,
  Calculator,
  Globe,
  FileText,
  Percent,
  ShieldCheck,
  Briefcase,
  Plus
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const TaxesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showGstSplit, setShowGstSplit] = useState(false);
  const [enableTaxExempt, setEnableTaxExempt] = useState(false);

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Taxes & Duties"
        subtitle="Manage your regional tax rates, exemptions, and calculation rules."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Taxes & Duties', active: true }
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

          {/* SECTION 1 — Tax Configuration */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="size-5 text-[#2e1065]" />
                Tax Configuration
              </CardTitle>
              <CardDescription>Set up your primary tax settings and business identification.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable Taxes</Label>
                  <p className="text-sm text-slate-500">Tax configurations affect all orders and invoices.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Tax Region</Label>
                  <Select defaultValue="india">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tax Identification Number (GSTIN/VAT)</Label>
                  <Input placeholder="e.g. 22AAAAA0000A1Z5" className="font-mono uppercase bg-slate-50/50 focus:bg-white transition-colors" />
                </div>

                <div className="space-y-2">
                  <Label>Default HSN / SAC Code</Label>
                  <Input placeholder="e.g. 8517" className="font-mono bg-slate-50/50 focus:bg-white transition-colors" />
                  <p className="text-xs text-slate-500">Fallback code if product has none.</p>
                </div>

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select defaultValue="regular">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="composition">Composition Scheme</SelectItem>
                      <SelectItem value="international">International / Export</SelectItem>
                      <SelectItem value="exempt">Tax Exempt Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between md:col-span-2 border border-slate-100 p-4 rounded-lg bg-slate-50">
                  <div className="space-y-0.5">
                    <Label>Use Store Address for Tax Calculation</Label>
                    <p className="text-xs text-slate-500">Calculate origin-based taxes using business address.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Tax Rounding Method</Label>
                  <Select defaultValue="round">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Round off (Standard)</SelectItem>
                      <SelectItem value="up">Round up</SelectItem>
                      <SelectItem value="down">Round down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Tax Calculation Rules */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="size-5 text-[#2e1065]" />
                Tax Calculation Rules
              </CardTitle>
              <CardDescription>Define how taxes are applied to your prices.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Tax Calculation Method</Label>
                <RadioGroup defaultValue="exclusive" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 space-y-0 border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value="inclusive" id="inclusive" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="inclusive" className="font-medium cursor-pointer">Tax Inclusive Pricing</Label>
                      <p className="text-xs text-slate-500">Prices displayed to customers already include tax.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer bg-purple-50/50 border-purple-200">
                    <RadioGroupItem value="exclusive" id="exclusive" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="exclusive" className="font-medium cursor-pointer text-[#2e1065]">Tax Exclusive Pricing</Label>
                      <p className="text-xs text-slate-500">Tax is added to the product price at checkout.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <Label htmlFor="tax-discount">Calculate tax on discounted price</Label>
                  <Switch id="tax-discount" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <Label htmlFor="tax-shipping">Apply tax after shipping fee</Label>
                  <Switch id="tax-shipping" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <Label htmlFor="tax-before-shipping">Apply tax before shipping fee</Label>
                  <Switch id="tax-before-shipping" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <Label htmlFor="gst-split">Enable GST Split (CGST/SGST)</Label>
                  <Switch id="gst-split" checked={showGstSplit} onCheckedChange={setShowGstSplit} />
                </div>

                {showGstSplit && (
                  <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>CGST %</Label>
                      <Input type="number" defaultValue="9" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>SGST %</Label>
                      <Input type="number" defaultValue="9" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>IGST %</Label>
                      <Input type="number" defaultValue="18" className="bg-white" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Tax Rates by Region */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="size-5 text-[#2e1065]" />
                  Tax Rates by Region
                </CardTitle>
                <CardDescription>Manage regional tax variances and overrides.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Region
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-purple-50 text-[#2e1065] flex items-center justify-center font-bold text-xs">
                    MH
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900 text-sm">Maharashtra</h4>
                      <Badge variant="secondary" className="text-xs font-normal">GST</Badge>
                    </div>
                    <p className="text-xs text-slate-500">18% Standard Rate</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                    DL
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900 text-sm">New Delhi</h4>
                      <Badge variant="secondary" className="text-xs font-normal">IGST</Badge>
                    </div>
                    <p className="text-xs text-slate-500">18% Standard Rate</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    KA
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900 text-sm">Karnataka</h4>
                      <Badge variant="secondary" className="text-xs font-normal">GST</Badge>
                    </div>
                    <p className="text-xs text-slate-500">18% Standard Rate</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — Product-Level Tax Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Percent className="size-5 text-[#2e1065]" />
                Product-Level Tax Settings
              </CardTitle>
              <CardDescription>Override global tax settings for specific products.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Tax Class</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Rate</SelectItem>
                      <SelectItem value="reduced">Reduced Rate</SelectItem>
                      <SelectItem value="zero">Zero Rated</SelectItem>
                      <SelectItem value="exempt">Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-6">
                  <div className="space-y-0.5">
                    <Label>Allow per-product tax override</Label>
                    <p className="text-xs text-slate-500">Enable custom tax rates on product page.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5 — Tax Exemptions */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="size-5 text-[#2e1065]" />
                Tax Exemptions
              </CardTitle>
              <CardDescription>Configure rules for tax-exempt customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Allow Tax Exempt Customers</Label>
                  <p className="text-sm text-slate-500">Enable tax exemption flow at checkout.</p>
                </div>
                <Switch checked={enableTaxExempt} onCheckedChange={setEnableTaxExempt} />
              </div>

              {enableTaxExempt && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <Label>Customer Groups Eligible</Label>
                    <div className="flex flex-wrap gap-3">
                      {['Non-Profit', 'Government', 'Wholesale', 'Educational'].map(group => (
                        <div key={group} className="flex items-center space-x-2 border border-slate-200 rounded-md px-3 py-2 bg-slate-50">
                          <Checkbox id={`group-${group}`} />
                          <Label htmlFor={`group-${group}`} className="text-sm cursor-pointer">{group}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Exemption Notes</Label>
                    <Textarea placeholder="Notes displayed to exempt customers..." className="h-20 resize-none bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 6 — Invoice & Reporting Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="size-5 text-[#2e1065]" />
                Invoice & Reporting Settings
              </CardTitle>
              <CardDescription>Control how tax info appears on invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="inv-breakdown">Show Tax Breakdown on Invoice</Label>
                  <Switch id="inv-breakdown" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="inv-hsn">Show HSN/SAC Code on Invoice</Label>
                  <Switch id="inv-hsn" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="inv-cust-tax">Show Customer Tax Number</Label>
                  <Switch id="inv-cust-tax" defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label className="cursor-pointer" htmlFor="inv-credit">Auto-include tax in credit notes</Label>
                  <Switch id="inv-credit" defaultChecked />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Consolidated Tax Reporting Method</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Summary</SelectItem>
                      <SelectItem value="quarterly">Quarterly Summary</SelectItem>
                      <SelectItem value="annual">Annual Report</SelectItem>
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

export default TaxesPage;
