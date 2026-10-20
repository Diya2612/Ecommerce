import React from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Database,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
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

const MetafieldsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const metafields = [
    { id: 1, name: 'Material', namespace: 'product', type: 'single_line_text', owner: 'Product', required: false },
    { id: 2, name: 'Care Instructions', namespace: 'product', type: 'multi_line_text', owner: 'Product', required: false },
    { id: 3, name: 'GST Number', namespace: 'customer', type: 'single_line_text', owner: 'Customer', required: true },
    { id: 4, name: 'Company Name', namespace: 'customer', type: 'single_line_text', owner: 'Customer', required: false },
    { id: 5, name: 'Warranty Period', namespace: 'product', type: 'number', owner: 'Product', required: false },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-500">
      {/* Fixed Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={handleBack} className="hover:text-slate-800 transition-colors hover:underline">Settings</button>
            <ChevronRight className="size-4" />
            <span className="font-medium text-slate-900">Metafields</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 lg:hidden">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Metafields</h1>
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
          
          {/* SECTION 1 — Custom Metafields */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="size-5 text-[#2e1065]" />
                  Custom Metafields
                </CardTitle>
                <CardDescription>Add custom data fields to products, customers, and orders.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Metafield
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {metafields.map((field) => (
                  <div key={field.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Database className="text-[#2e1065]" size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{field.name}</h3>
                            {field.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="capitalize">{field.owner}</span>
                            <span>•</span>
                            <span className="font-mono">{field.namespace}.{field.name.toLowerCase().replace(/\s+/g, '_')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">{field.type.replace(/_/g, ' ')}</Badge>
                        <Button variant="ghost" size="icon">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Quick Add Metafield */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Quick Add Metafield</CardTitle>
              <CardDescription>Create a new custom metafield.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input placeholder="e.g. Brand Name" className="bg-slate-50/50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label>Namespace</Label>
                  <Input placeholder="e.g. product" className="bg-slate-50/50 focus:bg-white transition-colors font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Type</Label>
                  <Select defaultValue="product">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="variant">Variant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select defaultValue="single_line_text">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_line_text">Single Line Text</SelectItem>
                      <SelectItem value="multi_line_text">Multi Line Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Required Field</Label>
                  <p className="text-xs text-slate-500">Make this field mandatory</p>
                </div>
                <Switch />
              </div>

              <Button className="bg-[#2e1065] hover:bg-[#2e1065]/90 text-white">
                <Plus size={16} className="mr-2" /> Create Metafield
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 sm:left-[280px] right-0 p-4 bg-white border-t border-slate-200 z-50 flex items-center justify-between md:justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="text-sm text-slate-500 hidden md:block mr-auto">
          Metafield changes require data re-indexing.
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

export default MetafieldsPage;
