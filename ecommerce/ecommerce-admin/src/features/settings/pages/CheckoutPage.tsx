import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Truck, 
  Ticket, 
  FileCheck, 
  Plus,
  Trash2,
  Edit2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: '1', label: 'Delivery Instructions', type: 'Text Area', required: false },
    { id: '2', label: 'How did you hear about us?', type: 'Dropdown', required: true },
  ]);

  const handleBack = () => {
    navigate('/settings');
  };

  const handleDeleteField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-500">
      {/* Fixed Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={handleBack} className="hover:text-slate-800 transition-colors hover:underline">Settings</button>
            <ChevronRight className="size-4" />
            <span className="font-medium text-slate-900">Checkout</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 lg:hidden">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
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
          
          {/* SECTION 1 — Checkout Preferences */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="size-5 text-[#2e1065]" />
                Checkout Preferences
              </CardTitle>
              <CardDescription>Configure global settings for order creation and customer flow.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Order Prefix</Label>
                  <div className="flex gap-3">
                    <Input defaultValue="ORD-" placeholder="e.g. #ORD-" className="font-mono bg-slate-50/50 focus:bg-white transition-colors" />
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Switch id="auto-id" defaultChecked />
                      <Label htmlFor="auto-id" className="text-sm text-slate-600">Auto-generate ID</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Default Order Source</Label>
                  <Select defaultValue="dashboard">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard (Manual)</SelectItem>
                      <SelectItem value="storefront">Storefront</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Delivery Days</Label>
                  <div className="relative">
                    <Input type="number" defaultValue="3" className="pr-16 bg-slate-50/50 focus:bg-white transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">Days</span>
                  </div>
                </div>
                
                <div className="hidden md:block"></div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Order Confirmation Email</Label>
                    <p className="text-sm text-slate-500">Send automated email upon order creation.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Login to Checkout</Label>
                    <p className="text-sm text-slate-500">Force customers to create an account.</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Guest Checkout</Label>
                    <p className="text-sm text-slate-500">Permit orders without registration.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Order Editing</Label>
                    <p className="text-sm text-slate-500">Customers can modify order before payment.</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-calculate Delivery Date</Label>
                    <p className="text-sm text-slate-500">Show estimated delivery based on rules.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Customer Information Requirements */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="size-5 text-[#2e1065]" />
                Customer Information
              </CardTitle>
              <CardDescription>Define which customer details are mandatory during checkout.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Required Information</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Full Name', 'Email Address', 'Phone Number', 'Shipping Address', 'Billing Address', 'Pincode', 'City', 'State'].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox id={`req-${field}`} defaultChecked={['Full Name', 'Email Address', 'Phone Number'].includes(field)} />
                      <Label htmlFor={`req-${field}`} className="font-normal">{field}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-base">Optional Fields</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="opt-landmark" defaultChecked />
                      <Label htmlFor="opt-landmark" className="font-normal">Landmark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="opt-altphone" />
                      <Label htmlFor="opt-altphone" className="font-normal">Alternate Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="opt-instructions" defaultChecked />
                      <Label htmlFor="opt-instructions" className="font-normal">Special Instructions / Notes</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">B2B Requirements</Label>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="req-company" defaultChecked />
                      <Label htmlFor="req-company" className="font-normal">Company Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="req-gst" defaultChecked />
                      <Label htmlFor="req-gst" className="font-normal">GST Number</Label>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="gst-mandatory" className="text-sm text-slate-600">Make GST Mandatory for B2B</Label>
                      <Switch id="gst-mandatory" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Payment Options at Checkout */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="size-5 text-[#2e1065]" />
                Payment Options
              </CardTitle>
              <CardDescription>Configure how payment methods appear and behave.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Available Methods at Checkout</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['UPI', 'Credit/Debit Cards', 'Net Banking', 'Cash on Delivery', 'Bank Transfer', 'Wallets'].map((method) => (
                    <div key={method} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <Checkbox id={`pay-${method}`} defaultChecked />
                      <Label htmlFor={`pay-${method}`} className="cursor-pointer font-medium">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label>Default Selection</Label>
                  <Select defaultValue="upi">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order Value for COD</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <Input type="number" defaultValue="500" className="pl-7 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                  <div className="space-y-0.5">
                    <Label>Allow Partial Payment</Label>
                    <p className="text-xs text-slate-500">Pay deposit now, rest later.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                  <div className="space-y-0.5">
                    <Label>Allow COD</Label>
                    <p className="text-xs text-slate-500">Enable Cash on Delivery.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                  <div className="space-y-0.5">
                    <Label>Credit Checkout</Label>
                    <p className="text-xs text-slate-500">For approved B2B accounts.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — Shipping & Delivery Rules */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="size-5 text-[#2e1065]" />
                Shipping & Delivery
              </CardTitle>
              <CardDescription>Manage shipping costs and pickup options.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Shipping Calculator</Label>
                    <p className="text-sm text-slate-500">Calculate shipping cost based on weight/location.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show Estimated Delivery Date</Label>
                    <p className="text-sm text-slate-500">Display arrival estimates at checkout.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Default Shipping Method</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Delivery</SelectItem>
                      <SelectItem value="express">Express Shipping</SelectItem>
                      <SelectItem value="local">Local Courier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Free Shipping Minimum Cart Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <Input type="number" defaultValue="2000" className="pl-7 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Warehouse Pickup</Label>
                    <p className="text-sm text-slate-500">Customers can collect orders from your location.</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2 pl-0 md:pl-4 border-l-2 border-slate-100">
                  <Label>Store Pickup Instructions</Label>
                  <Textarea placeholder="e.g. Pickup available Mon-Fri, 9am-6pm. Bring valid ID." className="resize-none h-20 bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5 — Discount & Coupon Behaviour */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="size-5 text-[#2e1065]" />
                Discounts & Coupons
              </CardTitle>
              <CardDescription>Control how discounts are applied to orders.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Discount Codes</Label>
                    <p className="text-sm text-slate-500">Show coupon input field at checkout.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Stackable Discounts</Label>
                    <p className="text-sm text-slate-500">Combine multiple coupons on a single order.</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-apply Best Discount</Label>
                    <p className="text-sm text-slate-500">System automatically applies the highest saving.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Order Value for Discounts</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <Input type="number" defaultValue="100" className="pl-7 bg-slate-50/50 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="disc-before-tax" defaultChecked />
                  <Label htmlFor="disc-before-tax">Apply discount before tax</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disc-after-tax" />
                  <Label htmlFor="disc-after-tax">Apply discount after tax</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 6 — Order Review & Confirmation */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="size-5 text-[#2e1065]" />
                Order Review
              </CardTitle>
              <CardDescription>Customize the final review step and success page.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border p-4 rounded-lg border-slate-100">
                  <Label className="cursor-pointer" htmlFor="show-summary">Show Order Summary</Label>
                  <Switch id="show-summary" defaultChecked />
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg border-slate-100">
                  <Label className="cursor-pointer" htmlFor="show-tax">Show Tax Breakdown</Label>
                  <Switch id="show-tax" defaultChecked />
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg border-slate-100">
                  <Label className="cursor-pointer" htmlFor="show-savings">Show Savings Banner</Label>
                  <Switch id="show-savings" defaultChecked />
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg border-slate-100">
                  <Label className="cursor-pointer" htmlFor="show-applied">Show Applied Discounts</Label>
                  <Switch id="show-applied" defaultChecked />
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Checkout Confirmation</Label>
                    <p className="text-sm text-slate-500">User must check a box to proceed.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Confirmation Checkbox Text</Label>
                  <Input defaultValue="I agree to the Terms of Service and Privacy Policy" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Success Page Message</Label>
                <Textarea placeholder="Thank you for your order! We will contact you shortly." className="resize-none h-24 bg-slate-50/50 focus:bg-white transition-colors" defaultValue="Thank you for your order! Your payment has been processed successfully." />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 7 — Custom Checkout Fields */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="size-5 text-[#2e1065]" />
                  Custom Fields
                </CardTitle>
                <CardDescription>Collect additional information from your customers.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus size={14} /> Add Field
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {customFields.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-8 rounded bg-purple-50 text-[#2e1065] flex items-center justify-center font-bold text-xs">
                          {field.type.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{field.label}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{field.type}</span>
                            <span>•</span>
                            <span className={field.required ? "text-amber-600 font-medium" : "text-slate-400"}>
                              {field.required ? "Mandatory" : "Optional"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDeleteField(field.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No custom fields added yet.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 sm:left-[280px] right-0 p-4 bg-white border-t border-slate-200 z-50 flex items-center justify-between md:justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="text-sm text-slate-500 hidden md:block mr-auto">
          Last saved: Just now
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

export default CheckoutPage;
