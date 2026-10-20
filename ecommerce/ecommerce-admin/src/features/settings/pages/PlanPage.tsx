import React, { useState } from 'react';
import {

  CreditCard,
  Check,
  Zap,
  Database,
  BarChart,
  Users,
  AlertCircle,
  Save
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const PlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Plan & Billing"
        subtitle="Manage your subscription plan and billing details."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Plan', active: true }
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

          {/* Section 1: Current Plan Overview */}
          <Card className="border-purple-100 shadow-sm rounded-[16px] overflow-hidden bg-gradient-to-br from-white to-purple-50/40">
            <CardHeader className="border-b border-slate-100/80 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">Professional Plan</h2>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-0.5 text-sm font-medium rounded-full">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold text-slate-900 text-lg">₹2,499</span>
                    <span>/ month</span>
                    <span className="text-slate-300">•</span>
                    <span>Renews on <span className="font-medium text-slate-700">Dec 24, 2025</span></span>
                  </div>
                </div>
                <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                  Manage Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" /> Orders
                    </span>
                    <span className="text-slate-500">850 / 1,000</span>
                  </div>
                  <Progress value={85} className="h-2 bg-slate-100" />
                  <p className="text-xs text-slate-400">85% used</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <Users size={14} className="text-slate-400" /> Users
                    </span>
                    <span className="text-slate-500">4 / 5</span>
                  </div>
                  <Progress value={80} className="h-2 bg-slate-100" />
                  <p className="text-xs text-slate-400">80% used</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <Database size={14} className="text-slate-400" /> Storage
                    </span>
                    <span className="text-slate-500">2.1 GB / 5 GB</span>
                  </div>
                  <Progress value={42} className="h-2 bg-slate-100" />
                  <p className="text-xs text-slate-400">42% used</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <Zap size={14} className="text-slate-400" /> API Calls
                    </span>
                    <span className="text-slate-500">12k / 50k</span>
                  </div>
                  <Progress value={24} className="h-2 bg-slate-100" />
                  <p className="text-xs text-slate-400">24% used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Available Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Starter Plan */}
            <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden h-full flex flex-col bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Starter</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-slate-900">₹0</span>
                  <span className="text-slate-500 ml-1">/ mo</span>
                </div>
                <CardDescription className="mt-2">Perfect for small businesses just getting started.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {['Up to 100 orders/mo', '1 Team Member', 'Basic Analytics', 'Email Support'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Downgrade</Button>
              </CardFooter>
            </Card>

            {/* Professional Plan */}
            <Card className="border-[#2e1065] shadow-md rounded-[16px] overflow-hidden h-full flex flex-col ring-1 ring-[#2e1065] relative bg-white">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#2e1065] text-white text-[10px] font-bold px-3 py-1 rounded-b-lg uppercase tracking-widest z-10">
                Most Popular
              </div>
              <CardHeader className="bg-purple-50/30">
                <CardTitle className="text-xl font-bold text-[#2e1065] mt-2">Professional</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-slate-900">₹2,499</span>
                  <span className="text-slate-500 ml-1">/ mo</span>
                </div>
                <p className="text-xs text-[#2e1065] font-medium mt-1 bg-purple-100 inline-block px-2 py-0.5 rounded">
                  Save ₹5,000 billed yearly
                </p>
                <CardDescription className="mt-2">For growing businesses needing more power.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 mt-6">
                <ul className="space-y-3">
                  {['Up to 1,000 orders/mo', '5 Team Members', 'Advanced Analytics', 'Priority Support', 'Custom Domains'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <Check className="size-4 text-[#2e1065] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#2e1065] hover:bg-[#2e1065]/90 text-white cursor-default" disabled>Current Plan</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden h-full flex flex-col bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Enterprise</CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-slate-900">₹9,999</span>
                  <span className="text-slate-500 ml-1">/ mo</span>
                </div>
                <CardDescription className="mt-2">Advanced features for large scale operations.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-3">
                  {['Unlimited orders', 'Unlimited Team Members', 'Dedicated Account Manager', 'SSO & Advanced Security', 'Custom API Integration'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#2e1065] hover:bg-[#2e1065]/90 text-white">Upgrade</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Section 3 & 4: Add-ons and Billing Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Add-ons */}
            <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-[16px] bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Add-ons & Extras</CardTitle>
                <CardDescription>Enhance your plan with additional capabilities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors -mx-3 px-3">
                  <div className="flex gap-4 items-center">
                    <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Additional Team Seats</p>
                      <p className="text-sm text-slate-500">Add 5 more users to your team</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-700">+₹500/mo</span>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors -mx-3 px-3">
                  <div className="flex gap-4 items-center">
                    <div className="size-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Database size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Extra Storage (50GB)</p>
                      <p className="text-sm text-slate-500">Store more assets and files</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-700">+₹1,000/mo</span>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors -mx-3 px-3">
                  <div className="flex gap-4 items-center">
                    <div className="size-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <BarChart size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Advanced Reporting</p>
                      <p className="text-sm text-slate-500">Get detailed insights and exports</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-700">+₹1,500/mo</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <AlertCircle size={16} />
                  <span>Additional costs will appear on your next invoice.</span>
                </div>
              </CardFooter>
            </Card>

            {/* Billing Summary */}
            <Card className="border-slate-200 shadow-sm rounded-[16px] h-fit bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Billing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Billing Frequency</Label>
                  <Select value={billingCycle} onValueChange={setBillingCycle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Plan Subtotal</span>
                    <span className="font-medium">₹2,499.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Add-ons</span>
                    <span className="font-medium">₹1,500.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm text-slate-500 block">Next Charge</span>
                      <span className="text-xs text-slate-400">Dec 24, 2025</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">₹3,999.00</span>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-3">
                  <div className="h-8 w-12 bg-white border border-slate-200 rounded flex items-center justify-center">
                    <CreditCard size={16} className="text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Visa •••• 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/28</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Change Payment Method</Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlanPage;
