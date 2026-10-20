import React from 'react';
import {

  CreditCard,
  Download,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  Clock,
  Smartphone,
  Mail
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const BillingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Manage payment methods and billing information."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Billing', active: true }
        ]}
        onBack={handleBack}
        actions={
          <>
            <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900">
              Cancel
            </Button>
            <Button className="bg-[#2e1065] hover:bg-[#2e1065]/90 text-white shadow-sm gap-2">
              <Plus size={16} /> Save Changes
            </Button>
          </>
        }
      />

      <div className="container max-w-7xl mx-auto px-6 pb-8">
        <div className="space-y-6">

          {/* Section 1: Billing Overview */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row justify-between items-start">
              <div className="flex gap-4">
                <div className="p-2 bg-purple-50 rounded-lg text-[#2e1065] mt-1">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-900">Billing Overview</CardTitle>
                  <CardDescription>Your current subscription status and upcoming charges.</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">Manage Plan</Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Current Plan</p>
                  <p className="text-lg font-bold text-slate-900">Professional</p>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Billing Cycle</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-slate-900">Monthly</p>
                  </div>
                  <p className="text-xs text-slate-400">Next invoice in 12 days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Next Payment</p>
                  <p className="text-lg font-bold text-slate-900">₹3,999.00</p>
                  <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal">Auto-renew</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Next Billing Date</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <p className="text-lg font-bold text-slate-900">Dec 24, 2025</p>
                  </div>
                  <p className="text-xs text-amber-600 font-medium">12 days left</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Payment Methods */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900">Payment Methods</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Visa Card (Default) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-purple-200 transition-colors bg-white group">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="h-10 w-14 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                    <CreditCard size={20} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">Visa ending in 4242</p>
                      <Badge className="bg-purple-100 text-[#2e1065] hover:bg-purple-100 border-purple-200 h-5 px-2 text-[10px]">Default</Badge>
                    </div>
                    <p className="text-sm text-slate-500">Expires 12/2028</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">Edit</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 size-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* UPI */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-purple-200 transition-colors bg-white">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="h-10 w-14 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                    <Smartphone size={20} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">business@oksbi</p>
                    <p className="text-sm text-slate-500">UPI ID</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">Set Default</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="mr-2 size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 size-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600">
                <Plus size={16} className="mr-2" /> Add New Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Section 3: Billing Address */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Billing Address</CardTitle>
              <CardDescription>The address used for your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="Anant Enterprises" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Billing Contact Name</Label>
                  <Input id="contact" defaultValue="Admin User" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Billing Email</Label>
                  <Input id="email" type="email" defaultValue="finance@anantenterprises.com" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Billing Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+91 98765 43210" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" defaultValue="123 Business Park" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" defaultValue="Mumbai" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select defaultValue="mh">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mh">Maharashtra</SelectItem>
                      <SelectItem value="dl">Delhi</SelectItem>
                      <SelectItem value="ka">Karnataka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="in">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Pincode</Label>
                  <Input id="zip" defaultValue="400001" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="same-address" />
                <Label htmlFor="same-address" className="font-normal text-slate-700">Same as Store Address</Label>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Invoice Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Invoice Settings</CardTitle>
              <CardDescription>Customize how you receive your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Invoice Delivery Method</Label>
                <Select defaultValue="both">
                  <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="download">Download Only</SelectItem>
                    <SelectItem value="both">Email & Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Invoice Email Address</Label>
                <div className="flex items-center relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input defaultValue="billing@anantenterprises.com" className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Recipients</Label>
                <Input placeholder="Enter emails separated by commas" className="bg-slate-50/50 focus:bg-white transition-colors" />
                <p className="text-xs text-slate-500">e.g. accountant@example.com, admin@example.com</p>
              </div>

              <div className="space-y-2">
                <Label>Invoice Notes</Label>
                <Textarea placeholder="Add custom notes to appear on your invoice footer..." className="resize-none h-20 bg-slate-50/50 focus:bg-white transition-colors" />
              </div>

              <div className="space-y-2">
                <Label>GST / Tax ID</Label>
                <Input placeholder="Enter your GST number" className="bg-slate-50/50 focus:bg-white transition-colors" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Tax Breakdown</Label>
                  <p className="text-sm text-slate-500">Display detailed tax lines on invoice PDF.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable PDF Invoices</Label>
                  <p className="text-sm text-slate-500">Attach PDF copy to billing emails.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Billing History */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Billing History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6">Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'INV-2024-012', date: 'Dec 01, 2024', amount: '₹3,999.00', status: 'Paid' },
                    { id: 'INV-2024-011', date: 'Nov 01, 2024', amount: '₹3,999.00', status: 'Paid' },
                    { id: 'INV-2024-010', date: 'Oct 01, 2024', amount: '₹3,999.00', status: 'Paid' },
                    { id: 'INV-2024-009', date: 'Sep 01, 2024', amount: '₹3,999.00', status: 'Paid' },
                    { id: 'INV-2024-008', date: 'Aug 01, 2024', amount: '₹3,999.00', status: 'Paid' },
                  ].map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium pl-6">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-transparent hover:bg-emerald-100">
                          <CheckCircle2 size={12} className="mr-1" /> {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8">
                            <Download size={14} className="mr-1" /> PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default BillingPage;
