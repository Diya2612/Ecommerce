import React from 'react';
import {
  Save,
  MapPin,
  Plus,
  Package,
  Truck
} from 'lucide-react';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const locations = [
    { id: 1, name: 'Main Warehouse', address: 'Plot 45, Industrial Area, Mumbai - 400001', type: 'warehouse', isDefault: true, inventory: 1250, fulfillment: true },
    { id: 2, name: 'Delhi Distribution Center', address: '23, Logistics Park, Delhi - 110001', type: 'warehouse', isDefault: false, inventory: 890, fulfillment: true },
    { id: 3, name: 'Bangalore Hub', address: 'Tech Park, Whitefield, Bangalore - 560066', type: 'fulfillment', isDefault: false, inventory: 450, fulfillment: true },
    { id: 4, name: 'Chennai Store', address: 'Anna Nagar, Chennai - 600040', type: 'retail', isDefault: false, inventory: 120, fulfillment: false },
  ];

  return (
    <div className="flex-1 w-full space-y-6">
      <PageHeader
        title="Locations"
        subtitle="Manage your warehouses, stores, and fulfillment centers."
        breadcrumbs={[
          { label: 'Settings', onClick: handleBack },
          { label: 'Locations', active: true }
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

          {/* SECTION 1 — Locations List */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="size-5 text-[#2e1065]" />
                  Store Locations
                </CardTitle>
                <CardDescription>Manage your warehouses, stores, and fulfillment centers.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Location
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {locations.map((location) => (
                  <div key={location.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="size-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                          {location.type === 'warehouse' && <Package className="text-[#2e1065]" size={20} />}
                          {location.type === 'fulfillment' && <Truck className="text-[#2e1065]" size={20} />}
                          {location.type === 'retail' && <MapPin className="text-[#2e1065]" size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900">{location.name}</h3>
                            {location.isDefault && (
                              <Badge className="bg-[#2e1065] text-white">Default</Badge>
                            )}
                            <Badge variant="secondary" className="capitalize">{location.type}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{location.address}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>{location.inventory} items in stock</span>
                            {location.fulfillment && <span className="text-emerald-600">• Fulfillment enabled</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Switch defaultChecked />
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Inventory Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="size-5 text-[#2e1065]" />
                Inventory Settings
              </CardTitle>
              <CardDescription>Configure how inventory is managed across locations.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Fulfillment Location</Label>
                  <Select defaultValue="main">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Warehouse</SelectItem>
                      <SelectItem value="delhi">Delhi Distribution Center</SelectItem>
                      <SelectItem value="bangalore">Bangalore Hub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" defaultValue="10" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Split shipping</Label>
                    <p className="text-xs text-slate-500">Ship from multiple locations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Auto-assign location</Label>
                    <p className="text-xs text-slate-500">Based on proximity & stock</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Track inventory</Label>
                    <p className="text-xs text-slate-500">Enable stock management</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Allow backorders</Label>
                    <p className="text-xs text-slate-500">Sell when out of stock</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
