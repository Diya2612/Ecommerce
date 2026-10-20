import React from 'react';
import {

  Save,
  Mail,
  MessageSquare,
  Smartphone,
  Users
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Manage email, SMS, and admin notification preferences."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Notifications', active: true }
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

          {/* SECTION 1 — Email Notifications */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="size-5 text-[#2e1065]" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure automated email notifications to customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Order Confirmation</Label>
                    <p className="text-xs text-slate-500">New order placed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Order Shipped</Label>
                    <p className="text-xs text-slate-500">Shipment dispatched</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Order Delivered</Label>
                    <p className="text-xs text-slate-500">Delivery confirmed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Payment Received</Label>
                    <p className="text-xs text-slate-500">Payment confirmation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Refund Processed</Label>
                    <p className="text-xs text-slate-500">Refund confirmation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Abandoned Cart</Label>
                    <p className="text-xs text-slate-500">Cart recovery email</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Sender Email</Label>
                <Input type="email" defaultValue="orders@anantenterprises.com" className="bg-slate-50/50 focus:bg-white transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — SMS Notifications */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="size-5 text-[#2e1065]" />
                SMS Notifications
              </CardTitle>
              <CardDescription>Send SMS updates to customers.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable SMS</Label>
                  <p className="text-sm text-slate-500">Send order updates via SMS</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>Order Confirmed</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>Out for Delivery</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>Order Delivered</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>OTP Verification</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — Push Notifications */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="size-5 text-[#2e1065]" />
                Push Notifications
              </CardTitle>
              <CardDescription>Browser and mobile push notifications.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable Push</Label>
                  <p className="text-sm text-slate-500">Send push notifications to opted-in users</p>
                </div>
                <Switch />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>New Offers</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <Label>Order Updates</Label>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — Admin Notifications */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="size-5 text-[#2e1065]" />
                Admin Notifications
              </CardTitle>
              <CardDescription>Notifications for store administrators.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>New Order Alert</Label>
                    <p className="text-xs text-slate-500">Real-time order notification</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alert</Label>
                    <p className="text-xs text-slate-500">Inventory running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Failed Payment</Label>
                    <p className="text-xs text-slate-500">Payment failures</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Customer Inquiry</Label>
                    <p className="text-xs text-slate-500">New support requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input type="email" defaultValue="admin@anantenterprises.com" className="bg-slate-50/50 focus:bg-white transition-colors" />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>

  );
};

export default NotificationsPage;
