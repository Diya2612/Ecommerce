import React, { useState } from 'react';
import { ArrowLeft, Save, Package, Target, Layers, Settings, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { notifySuccess, notifyInfo } from '@/utils';

interface AddCatalogPageProps {
  onBack: () => void;
}

// Tier Selection Component
const TierSelectionComponent: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('');
  
  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 mb-1">Single Tier Selection</p>
            <p className="text-sm text-blue-800">
              Select <strong>ONE</strong> tier level (1, 2, 3, or 4) and <strong>ONE</strong> tier value. All products under that tier (including child tiers) will be loaded.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Tier Level */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 mb-4 block">
          Step 1: Select Tier Level <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { level: '1', label: 'Tier 1', description: 'Main Category' },
            { level: '2', label: 'Tier 2', description: 'Sub Category' },
            { level: '3', label: 'Tier 3', description: 'Product Type' },
            { level: '4', label: 'Tier 4', description: 'Specific Item' },
          ].map((tier) => (
            <div key={tier.level}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="tierLevel"
                  value={tier.level}
                  checked={selectedTier === tier.level}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  border-2 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-md
                  ${selectedTier === tier.level 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}>
                  <div className={`size-5 rounded-full border-2 mx-auto mb-3 relative ${
                    selectedTier === tier.level ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {selectedTier === tier.level && (
                      <div className="absolute inset-1 rounded-full bg-white" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{tier.label}</h3>
                  <p className="text-xs text-slate-500 font-medium">{tier.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Select Tier Value - Only show if tier level is selected */}
      {selectedTier && (
        <div className="pt-4">
          <Label className="text-sm font-semibold text-slate-700 mb-4 block">
            Step 2: Select {`Tier ${selectedTier}`} Value <span className="text-red-500">*</span>
          </Label>
          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Choose a value from Tier {selectedTier}:
            </p>
            <Select>
              <SelectTrigger className="w-full bg-white border-slate-300 rounded-xl h-12 text-left">
                <SelectValue placeholder={`Select Tier ${selectedTier} value`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="example1">Example Category 1</SelectItem>
                <SelectItem value="example2">Example Category 2</SelectItem>
                <SelectItem value="example3">Example Category 3</SelectItem>
                <SelectItem value="example4">Example Category 4</SelectItem>
                <SelectItem value="example5">Example Category 5</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-3 font-medium">
              All products under this tier (including child tiers) will be included.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Exclude Products Component
const ExcludeProductsComponent: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('');
  
  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 mb-1">Single Tier Selection</p>
            <p className="text-sm text-blue-800">
              Select <strong>ONE</strong> tier level (1, 2, 3, or 4) and <strong>ONE</strong> tier value. All products under that tier (including child tiers) will be loaded.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Tier Level */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 mb-4 block">
          Step 1: Select Tier Level <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { level: '1', label: 'Tier 1', description: 'Main Category' },
            { level: '2', label: 'Tier 2', description: 'Sub Category' },
            { level: '3', label: 'Tier 3', description: 'Product Type' },
            { level: '4', label: 'Tier 4', description: 'Specific Item' },
          ].map((tier) => (
            <div key={tier.level}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="excludeTierLevel"
                  value={tier.level}
                  checked={selectedTier === tier.level}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  border-2 rounded-xl p-6 text-center transition-all duration-200 hover:shadow-md
                  ${selectedTier === tier.level 
                    ? 'border-amber-500 bg-amber-50 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}>
                  <div className={`size-5 rounded-full border-2 mx-auto mb-3 relative ${
                    selectedTier === tier.level ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                  }`}>
                    {selectedTier === tier.level && (
                      <div className="absolute inset-1 rounded-full bg-white" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{tier.label}</h3>
                  <p className="text-xs text-slate-500 font-medium">{tier.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Select Tier Value - Only show if tier level is selected */}
      {selectedTier && (
        <div className="pt-4">
          <Label className="text-sm font-semibold text-slate-700 mb-4 block">
            Step 2: Select {`Tier ${selectedTier}`} Value <span className="text-red-500">*</span>
          </Label>
          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Choose a value from Tier {selectedTier} to exclude:
            </p>
            <Select>
              <SelectTrigger className="w-full bg-white border-slate-300 rounded-xl h-12 text-left">
                <SelectValue placeholder={`Select Tier ${selectedTier} value to exclude`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="example1">Example Category 1</SelectItem>
                <SelectItem value="example2">Example Category 2</SelectItem>
                <SelectItem value="example3">Example Category 3</SelectItem>
                <SelectItem value="example4">Example Category 4</SelectItem>
                <SelectItem value="example5">Example Category 5</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-3 font-medium">
              All products under this tier (including child tiers) will be excluded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AddCatalogPage: React.FC<AddCatalogPageProps> = ({ onBack }) => {
  // Basic form data
  const [catalogueName, setCatalogueName] = useState('');
  const [catalogueStatus, setCatalogueStatus] = useState('draft');
  const [catalogueDescription, setCatalogueDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [catalogueActive, setCatalogueActive] = useState(false);

  const handleSave = () => {
    // Basic validation
    if (!catalogueName.trim()) {
      notifyInfo("Please enter a catalog name");
      return;
    }

    // Simulate saving
    console.log('Saving catalog:', {
      catalogueName,
      catalogueStatus,
      catalogueDescription,
      priority,
      validFrom,
      validTo,
      catalogueActive
    });
    notifySuccess("Catalog created successfully!");
    onBack();
  };

  const priorityOptions = [
    { value: '1', label: 'Priority 1 (Highest)' },
    { value: '2', label: 'Priority 2' },
    { value: '3', label: 'Priority 3' },
    { value: '4', label: 'Priority 4' },
    { value: '5', label: 'Priority 5 (Lowest)' },
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#F4F6F9]">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="inline-flex items-center justify-center size-10 hover:bg-white rounded-lg transition-colors shadow-sm border border-slate-200 bg-white"
              title="Go back"
            >
              <ArrowLeft className="size-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create Catalogue</h1>
              <p className="text-sm text-slate-600 mt-0.5">Build tier-based product catalogue with per-product pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={onBack}>
              Cancel
            </Button>
            <Button className="bg-[#0E042F] hover:bg-[#0E042F]/90 text-white" size="lg" onClick={handleSave}>
              <Save className="size-4 mr-2" />
              Save Catalogue
            </Button>
          </div>
        </div>

        {/* Main Layout: 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE - Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Catalogue Basic Details */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-indigo-600" />
                  <CardTitle className="text-slate-900">Catalogue Basic Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Catalogue Name *
                  </Label>
                  <Input
                    placeholder="e.g., Premium B2B Catalogue"
                    value={catalogueName}
                    onChange={(e) => setCatalogueName(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">A descriptive name for this product catalogue</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Status *</Label>
                    <Select value={catalogueStatus} onValueChange={setCatalogueStatus}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1.5">Used for conflict resolution</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Describe the purpose and scope of this catalogue"
                    value={catalogueDescription}
                    onChange={(e) => setCatalogueDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Internal description for team reference</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Valid From</Label>
                    <Input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Start date for catalogue</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Valid To</Label>
                    <Input
                      type="date"
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">End date (optional)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Catalogue Assignment */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-purple-600" />
                  <CardTitle className="text-slate-900">Catalogue Assignment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">Customer Segments</Label>
                  <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/50 min-h-[44px]">
                    <p className="text-sm text-slate-500">No segments assigned - available to all</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Assign to specific customer segments</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Roles</Label>
                    <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/50 min-h-[44px]">
                      <p className="text-sm text-slate-500">All roles</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Sales Channels</Label>
                    <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/50 min-h-[44px]">
                      <p className="text-sm text-slate-500">All channels</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Product Source Selection */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="size-5 text-blue-600" />
                  <CardTitle className="text-slate-900">Product Source Selection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <TierSelectionComponent />
              </CardContent>
            </Card>

            {/* 4. Exclude Products */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="size-5 text-amber-600" />
                  <CardTitle className="text-slate-900">Exclude Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ExcludeProductsComponent />
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDE - Status & System Info */}
          <div className="space-y-6">
            
            {/* Catalogue Status */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="size-5 text-slate-600" />
                  <CardTitle className="text-slate-900">Catalogue Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Active Status</p>
                    <p className="text-xs text-slate-500">Enable/disable this catalogue</p>
                  </div>
                  <Switch
                    checked={catalogueActive}
                    onCheckedChange={setCatalogueActive}
                  />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium">{catalogueStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Priority</span>
                      <span className="font-medium">{priority || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validity Period */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  <CardTitle className="text-slate-900">Validity Period</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {validFrom && (
                  <div className="text-xs">
                    <span className="text-slate-500">From:</span> <span className="font-medium">{validFrom}</span>
                  </div>
                )}
                {validTo && (
                  <div className="text-xs">
                    <span className="text-slate-500">To:</span> <span className="font-medium">{validTo}</span>
                  </div>
                )}
                {!validFrom && !validTo && (
                  <p className="text-xs text-slate-500">No validity period set</p>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="rounded-[20px] border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="size-5 text-slate-600" />
                  <CardTitle className="text-slate-900">System Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-slate-600">
                  <p><strong>Created:</strong> Not saved yet</p>
                  <p><strong>Last Modified:</strong> Not saved yet</p>
                  <p><strong>Modified By:</strong> Current User</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCatalogPage;
