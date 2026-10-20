import React, { useState } from 'react';
import {
  Save,
  CreditCard,
  Landmark,
  Banknote,
  Smartphone,
  Wallet,
  Globe,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Receipt,
  RefreshCcw
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enableCredit, setEnableCredit] = useState(false);
  const [enableBankTransfer, setEnableBankTransfer] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage your store's payment methods and gateway settings."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Payments', active: true }
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

          {/* SECTION 1 — Supported Payment Methods */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="size-5 text-[#2e1065]" />
                Supported Payment Methods
              </CardTitle>
              <CardDescription>Enable or disable payment modes available to your customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* UPI */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Smartphone size={16} className="text-slate-500" /> UPI Payments
                  </Label>
                  <p className="text-sm text-slate-500">Accept payments via Google Pay, PhonePe, Paytm, etc.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              {/* Bank Transfer */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Landmark size={16} className="text-slate-500" /> Bank Transfer / NEFT / RTGS
                  </Label>
                  <p className="text-sm text-slate-500">Allow customers to pay directly to your bank account.</p>
                </div>
                <Switch checked={enableBankTransfer} onCheckedChange={setEnableBankTransfer} />
              </div>
              <Separator />

              {/* Credit/Debit Card */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <CreditCard size={16} className="text-slate-500" /> Credit / Debit Cards
                  </Label>
                  <p className="text-sm text-slate-500">Accept all major domestic and international cards.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              {/* COD */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Banknote size={16} className="text-slate-500" /> Cash on Delivery (COD)
                  </Label>
                  <p className="text-sm text-slate-500">Collect payment when the order is delivered.</p>
                </div>
                <Switch />
              </div>
              <Separator />

              {/* Wallets */}
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Wallet size={16} className="text-slate-500" /> Digital Wallets
                  </Label>
                  <p className="text-sm text-slate-500">Select which wallets to display at checkout.</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {['PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay'].map((wallet) => (
                    <div key={wallet} className="flex items-center space-x-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                      <Switch id={`wallet-${wallet}`} defaultChecked />
                      <Label htmlFor={`wallet-${wallet}`} className="cursor-pointer">{wallet}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Default Payment Rules */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="size-5 text-[#2e1065]" />
                Default Payment Rules
              </CardTitle>
              <CardDescription>Set global rules for how payments are handled.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Payment Method</Label>
                  <Select defaultValue="upi">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">This will be pre-selected during checkout.</p>
                </div>

                <div className="space-y-2">
                  <Label>Overdue Payment Grace Period</Label>
                  <Select defaultValue="7">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Time before an overdue invoice triggers penalties.</p>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Order Value for COD</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <Input type="number" defaultValue="500" className="pl-7 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                </div>

                <div className="hidden md:block"></div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start justify-between md:col-span-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Partial Payments</Label>
                    <p className="text-sm text-slate-500">Customers can pay a deposit upfront and the rest later.</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-start justify-between md:col-span-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow COD for B2B Orders</Label>
                    <p className="text-sm text-slate-500">Enable Cash on Delivery for wholesale/B2B accounts.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between md:col-span-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Credit Purchases</Label>
                    <p className="text-sm text-slate-500">Let verified customers buy now and pay later based on credit limits.</p>
                  </div>
                  <Switch checked={enableCredit} onCheckedChange={setEnableCredit} />
                </div>

                {enableCredit && (
                  <div className="md:col-span-2 pl-4 border-l-2 border-purple-100 space-y-6 animate-in slide-in-from-left-2 fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Maximum Credit Limit Allowed</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                          <Input type="number" defaultValue="50000" className="pl-7 bg-slate-50/50 focus:bg-white transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500">Global cap for credit per customer.</p>
                      </div>
                      <div className="flex items-center gap-4 pt-6">
                        <Label className="whitespace-nowrap">Auto-block customer when overdue</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Online Payment Gateway */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="size-5 text-[#2e1065]" />
                    Online Payment Gateway
                  </CardTitle>
                  <CardDescription>Configure your payment provider for online transactions.</CardDescription>
                </div>
                {gatewayStatus === 'connected' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent gap-1">
                    <CheckCircle2 size={12} /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent gap-1">
                    <AlertCircle size={12} /> Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">Payment gateway is required for accepting online payments from customers. Ensure your keys are kept secret.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Choose Gateway</Label>
                  <Select defaultValue="razorpay">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="cashfree">Cashfree</SelectItem>
                      <SelectItem value="payu">PayU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between md:justify-start md:gap-8 pt-8">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-xs text-slate-500">Use sandbox environment.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>API Key / Publishable Key</Label>
                  <Input type="password" value="rzp_test_1234567890" readOnly className="font-mono text-sm bg-slate-50/50" />
                </div>

                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input type="password" value="*****************" readOnly className="font-mono text-sm bg-slate-50/50" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" className="gap-2" onClick={() => setGatewayStatus('connected')}>
                  <RefreshCcw size={16} /> Verify Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — Bank Transfer & Manual Methods */}
          {enableBankTransfer && (
            <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="size-5 text-[#2e1065]" />
                  Bank Transfer Details
                </CardTitle>
                <CardDescription>These details will be shown to customers choosing Bank Transfer.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input placeholder="e.g. HDFC Bank" className="bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input placeholder="e.g. Anant Enterprises Pvt Ltd" className="bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input placeholder="XXXXXXXXXXXXXXXX" className="font-mono bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code / Swift Code</Label>
                    <Input placeholder="HDFC0001234" className="font-mono uppercase bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input placeholder="e.g. Mumbai Main Branch" className="bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Cancelled Cheque</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <UploadCloud size={24} className="text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-[#2e1065]">Click to upload</p>
                      <p className="text-xs text-slate-500">PDF, JPG or PNG</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Payment Instructions</Label>
                    <Textarea
                      placeholder="Add any specific instructions for the customer..."
                      className="resize-none h-24 bg-slate-50/50 focus:bg-white transition-colors"
                      defaultValue="Please include your Order ID in the transaction remarks for faster processing."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECTION 5 — Payment Receipt Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="size-5 text-[#2e1065]" />
                Payment Receipt Settings
              </CardTitle>
              <CardDescription>Customize the receipts sent to your customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start justify-between md:col-span-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-send Payment Receipt</Label>
                    <p className="text-sm text-slate-500">Automatically email receipt upon successful payment.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Footer Notes</Label>
                  <Textarea placeholder="Thank you for your business..." className="resize-none h-20 bg-slate-50/50 focus:bg-white transition-colors" />
                </div>

                <div className="space-y-2">
                  <Label>Signature / Business Seal</Label>
                  <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 bg-slate-50">
                    <div className="size-10 bg-white rounded border border-slate-200 flex items-center justify-center">
                      <FileText size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-slate-900 truncate">signature_seal.png</p>
                      <p className="text-xs text-slate-500">245 KB</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 h-full pt-6">
                  <Switch id="tax-breakdown" defaultChecked />
                  <Label htmlFor="tax-breakdown">Show Tax Breakdown on Receipt</Label>
                </div>
              </div>

              <div className="flex justify-start">
                <Button variant="outline">Preview Receipt Template</Button>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 6 — Refund Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RefreshCcw className="size-5 text-[#2e1065]" />
                Refund Policies
              </CardTitle>
              <CardDescription>Define how refunds are processed for your store.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start justify-between md:col-span-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Refunds</Label>
                    <p className="text-sm text-slate-500">If disabled, no refund options will be available in order management.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Refund Approval Required</Label>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Default Refund Method</Label>
                  <Select defaultValue="original">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Payment Method</SelectItem>
                      <SelectItem value="wallet">Wallet Credit</SelectItem>
                      <SelectItem value="manual">Manual Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Refundable Days</Label>
                  <div className="relative">
                    <Input type="number" defaultValue="30" className="pr-12 bg-slate-50/50 focus:bg-white transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">Days</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 italic">Refund policies will apply to all customers unless overridden by specific contract terms.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
