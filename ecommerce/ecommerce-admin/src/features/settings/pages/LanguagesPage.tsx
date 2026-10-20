import React from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Globe,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const LanguagesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  const languages = [
    { id: 1, name: 'English', code: 'en', native: 'English', isDefault: true, published: true },
    { id: 2, name: 'Hindi', code: 'hi', native: 'हिन्दी', isDefault: false, published: true },
    { id: 3, name: 'Marathi', code: 'mr', native: 'मराठी', isDefault: false, published: true },
    { id: 4, name: 'Tamil', code: 'ta', native: 'தமிழ்', isDefault: false, published: false },
    { id: 5, name: 'Telugu', code: 'te', native: 'తెలుగు', isDefault: false, published: false },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in fade-in duration-500">
      {/* Fixed Top Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-200 z-10 sticky top-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={handleBack} className="hover:text-slate-800 transition-colors hover:underline">Settings</button>
            <ChevronRight className="size-4" />
            <span className="font-medium text-slate-900">Languages</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 lg:hidden">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Languages</h1>
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
          
          {/* SECTION 1 — Supported Languages */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="size-5 text-[#2e1065]" />
                  Supported Languages
                </CardTitle>
                <CardDescription>Manage languages available to your customers.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus size={14} /> Add Language
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {languages.map((lang) => (
                  <div key={lang.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-purple-50 rounded-lg flex items-center justify-center text-[#2e1065] font-bold text-xs uppercase">
                          {lang.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{lang.name}</h3>
                            <span className="text-slate-500 text-sm">({lang.native})</span>
                            {lang.isDefault && (
                              <Badge className="bg-[#2e1065] text-white ml-2">Default</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {lang.published && (
                          <span className="flex items-center gap-1 text-emerald-600 text-sm">
                            <Check size={14} /> Published
                          </span>
                        )}
                        <Switch defaultChecked={lang.published} />
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — Language Settings */}
          <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Language Settings</CardTitle>
              <CardDescription>Configure how languages work across your store.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fallback Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Auto-detect language</Label>
                    <p className="text-xs text-slate-500">Use browser language preference</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Show language selector</Label>
                    <p className="text-xs text-slate-500">Display on storefront</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">Translate URLs</Label>
                    <p className="text-xs text-slate-500">Localized URL slugs</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between border border-slate-100 p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="cursor-pointer">RTL Support</Label>
                    <p className="text-xs text-slate-500">Right-to-left languages</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 sm:left-[280px] right-0 p-4 bg-white border-t border-slate-200 z-50 flex items-center justify-between md:justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="text-sm text-slate-500 hidden md:block mr-auto">
          Language changes affect all store content.
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

export default LanguagesPage;
