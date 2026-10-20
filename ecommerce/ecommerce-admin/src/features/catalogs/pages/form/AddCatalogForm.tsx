import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Layers,
  Filter,
  Save,
  Package2,
  Plus,
  Trash2,
  Target,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { notifySuccess, notifyInfo } from '@/utils';

interface AddCatalogFormProps {
  onBack: () => void;
}

// Interfaces
interface ProductInCatalogue {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  adjustmentType: 'fixed_price' | 'percentage_discount' | 'percentage_markup' | 'fixed_discount' | '';
  adjustmentValue: string;
  minQty: string;
  maxQty: string;
  finalPrice: number;
  incrementStep?: string;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

// Mock data
const tierOptions = {
  tier1: [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Fitness' },
  ],
  tier2: [
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'accessories', label: 'Accessories' },
  ],
  tier3: [
    { value: 'android', label: 'Android Phones' },
    { value: 'ios', label: 'iOS Phones' },
    { value: 'gaming', label: 'Gaming Laptops' },
    { value: 'business', label: 'Business Laptops' },
  ],
  tier4: [
    { value: 'samsung', label: 'Samsung' },
    { value: 'apple', label: 'Apple' },
    { value: 'xiaomi', label: 'Xiaomi' },
    { value: 'oneplus', label: 'OnePlus' },
  ],
};

const mockProductsByTier: Record<string, ProductInCatalogue[]> = {
  'tier1-electronics': [
    { id: 'P001', name: 'Samsung Galaxy S24', sku: 'SGS24-001', basePrice: 79999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '10', finalPrice: 79999 },
    { id: 'P002', name: 'iPhone 15 Pro', sku: 'IP15P-001', basePrice: 134999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '5', finalPrice: 134999 },
    { id: 'P003', name: 'MacBook Pro M3', sku: 'MBP-M3-001', basePrice: 199999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '3', finalPrice: 199999 },
  ],
  'tier2-smartphones': [
    { id: 'P001', name: 'Samsung Galaxy S24', sku: 'SGS24-001', basePrice: 79999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '10', finalPrice: 79999 },
    { id: 'P002', name: 'iPhone 15 Pro', sku: 'IP15P-001', basePrice: 134999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '5', finalPrice: 134999 },
    { id: 'P004', name: 'OnePlus 12', sku: 'OP12-001', basePrice: 64999, adjustmentType: '', adjustmentValue: '', minQty: '1', maxQty: '15', finalPrice: 64999 },
  ]
};

const AddCatalogForm: React.FC<AddCatalogFormProps> = ({ onBack }) => {
  // Basic Details
  const [catalogueName, setCatalogueName] = useState('');
  const [catalogueStatus, setCatalogueStatus] = useState('draft');
  const [catalogueDescription, setCatalogueDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  // Source Selection
  const [selectedTierLevel, setSelectedTierLevel] = useState<'tier1' | 'tier2' | 'tier3' | 'tier4' | ''>('');
  const [selectedTierValue, setSelectedTierValue] = useState('');

  // Exclusion
  const [excludeTierLevel, setExcludeTierLevel] = useState<'tier1' | 'tier2' | 'tier3' | 'tier4' | ''>('');
  const [excludeTierValue, setExcludeTierValue] = useState('');
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);

  // Products and State
  const [productsInCatalogue, setProductsInCatalogue] = useState<ProductInCatalogue[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Filtering
  const [useAdvancedRules, setUseAdvancedRules] = useState(false);
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [conditions, setConditions] = useState<Condition[]>([{ id: '1', field: '', operator: '', value: '' }]);

  // Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedCount, setSimulatedCount] = useState<number | null>(null);



  // Derived State
  const currentTierOptions = selectedTierLevel ? tierOptions[selectedTierLevel] : [];
  const currentExcludeTierOptions = excludeTierLevel ? tierOptions[excludeTierLevel] : [];

  const priorityOptions = [
    { value: '1', label: 'Priority 1 (Highest)' },
    { value: '2', label: 'Priority 2' },
    { value: '3', label: 'Priority 3' },
    { value: '4', label: 'Priority 4' },
    { value: '5', label: 'Priority 5 (Lowest)' },
  ];

  const adjustmentTypeOptions = [
    { value: 'fixed_price', label: 'Fixed Price' },
    { value: 'percentage_discount', label: '% Discount' },
    { value: 'percentage_markup', label: '% Markup' },
    { value: 'fixed_discount', label: 'Fixed Discount' },
  ];



  // Handlers
  const handleTierLevelChange = (level: 'tier1' | 'tier2' | 'tier3' | 'tier4') => {
    setSelectedTierLevel(level);
    setSelectedTierValue('');
    setProductsInCatalogue([]);
  };

  const handleExcludeTierLevelChange = (level: 'tier1' | 'tier2' | 'tier3' | 'tier4') => {
    setExcludeTierLevel(level);
    setExcludeTierValue('');
  };

  const calculateFinalPrice = (basePrice: number, adjustmentType: string, adjustmentValue: string): number => {
    const adjValue = parseFloat(adjustmentValue) || 0;
    switch (adjustmentType) {
      case 'fixed_price': return adjValue;
      case 'percentage_discount': return basePrice - (basePrice * adjValue / 100);
      case 'percentage_markup': return basePrice + (basePrice * adjValue / 100);
      case 'fixed_discount': return basePrice - adjValue;
      default: return basePrice;
    }
  };

  const loadProductsFromTiers = () => {
    if (!selectedTierLevel || !selectedTierValue) {
      notifyInfo('Please select both tier level and tier value');
      return;
    }

    let products: ProductInCatalogue[] = [];
    Object.keys(mockProductsByTier).forEach(key => {
      if (key.includes(selectedTierLevel) && key.includes(selectedTierValue)) {
        products = mockProductsByTier[key];
      }
    });

    if (products.length === 0) {
      // Fallback or empty
    }

    setProductsInCatalogue(products);

    if (products.length > 0) {
      notifySuccess(`${products.length} products loaded`);
    } else {
      notifyInfo('No products found for this selection');
    }
  };

  const handleProductUpdate = (productId: string, field: keyof ProductInCatalogue, value: any) => {
    setProductsInCatalogue(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId) {
          const updated = { ...product, [field]: value };
          if (field === 'adjustmentType' || field === 'adjustmentValue') {
            updated.finalPrice = calculateFinalPrice(
              product.basePrice,
              field === 'adjustmentType' ? value : product.adjustmentType,
              field === 'adjustmentValue' ? value : product.adjustmentValue
            );
          }
          return updated;
        }
        return product;
      })
    );
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { id: Date.now().toString(), field: '', operator: '', value: '' }]);
  };



  const handleConditionChange = (id: string, field: keyof Condition, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    if (!catalogueName.trim()) {
      notifyInfo('Catalogue name is required');
      return;
    }
    console.log('Saving catalogue:', {
      catalogueName,
      catalogueStatus,
      productsInCatalogue,
    });
    notifySuccess('Catalogue saved successfully!');
    onBack();
  };

  const getFilteredProducts = () => {
    // Simple filter implementation
    if (excludedProductIds.length > 0) {
      return productsInCatalogue.filter(p => !excludedProductIds.includes(p.id));
    }
    return productsInCatalogue;
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleExcludeProduct = (id: string) => {
    setExcludedProductIds(prev => [...prev, id]);
  };

  const handleSimulateCatalogue = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulatedCount(getFilteredProducts().length);
      setIsSimulating(false);
    }, 1000);
  };

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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="lg" onClick={handleSave}>
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

            {/* 3. Product Source Selection */}
            <Card className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="size-5 text-[#0e042f]" />
                <h2 className="text-lg font-semibold text-gray-900">Product Source Selection</h2>
              </div>
              <div className="space-y-5">
                {/* Step 1: Select Tier Level */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Step 1: Select Tier Level *
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['tier1', 'tier2', 'tier3', 'tier4'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleTierLevelChange(level)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${selectedTierLevel === level
                          ? 'border-[#0e042f] bg-[#f4f3fb]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className="font-medium">Tier {level.slice(-1)}</div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {level === 'tier1' && 'Main Category'}
                          {level === 'tier2' && 'Sub Category'}
                          {level === 'tier3' && 'Product Type'}
                          {level === 'tier4' && 'Specific Item'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Tier Value */}
                {selectedTierLevel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Step 2: Select Tier Value *
                    </Label>
                    <Select
                      value={selectedTierValue}
                      onValueChange={setSelectedTierValue}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={`Select ${selectedTierLevel} value`} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {currentTierOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Load Products Button */}
                {selectedTierLevel && selectedTierValue && (
                  <div>
                    <Button
                      onClick={loadProductsFromTiers}
                      className="w-full rounded-lg bg-[#0e042f] hover:opacity-90 text-white"
                      size="lg"
                    >
                      <Package className="size-4 mr-2" />
                      Load Products
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* 3b. Exclude Products */}
            <Card className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="size-5 text-[#0e042f]" />
                <h2 className="text-lg font-semibold text-gray-900">Exclude Products</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Step 1: Select Tier Level (Optional)
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['tier1', 'tier2', 'tier3', 'tier4'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleExcludeTierLevelChange(level)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${excludeTierLevel === level
                          ? 'border-[#0e042f] bg-[#f4f3fb]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className="font-medium">Tier {level.slice(-1)}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {excludeTierLevel && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Step 2: Select Value to Exclude
                    </Label>
                    <Select
                      value={excludeTierValue}
                      onValueChange={setExcludeTierValue}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {currentExcludeTierOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>

            {/* 4. Product Filtering Rules */}
            {productsInCatalogue.length > 0 && (
              <Card className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Filter className="size-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Product Filtering Rules</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="advanced-rules" className="text-sm font-medium text-gray-700">
                      Advanced Rules
                    </Label>
                    <Switch
                      id="advanced-rules"
                      checked={useAdvancedRules}
                      onCheckedChange={setUseAdvancedRules}
                    />
                  </div>
                </div>
                {!useAdvancedRules && (
                  <>
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Match Type</Label>
                      <Select value={matchType} onValueChange={(value: 'all' | 'any') => setMatchType(value)}>
                        <SelectTrigger className="rounded-lg w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Match ALL</SelectItem>
                          <SelectItem value="any">Match ANY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      {conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center gap-3">
                          <Input
                            placeholder="Value"
                            value={condition.value}
                            onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                          />
                          <Button size="sm" variant="outline" onClick={handleAddCondition}><Plus className="size-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* 5. Products in Catalogue */}
            {productsInCatalogue.length > 0 && (
              <Card className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Package2 className="size-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Products in Catalogue</h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4">Select</th>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Base Price</th>
                        <th className="py-3 px-4">Adj. Type</th>
                        <th className="py-3 px-4">Adj. Value</th>
                        <th className="py-3 px-4">Final Price</th>
                        <th className="py-3 px-4">Min Qty</th>
                        <th className="py-3 px-4">Max Qty</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFilteredProducts().map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 group">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedProductIds.includes(product.id)}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{product.sku}</td>
                          <td className="py-3 px-4 text-gray-900">₹{product.basePrice.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Select
                              value={product.adjustmentType}
                              onValueChange={(value) => handleProductUpdate(product.id, 'adjustmentType', value)}
                            >
                              <SelectTrigger className="w-32 rounded-lg">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                <SelectItem value="">None</SelectItem>
                                {adjustmentTypeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={product.adjustmentValue}
                              onChange={(e) => handleProductUpdate(product.id, 'adjustmentValue', e.target.value)}
                              placeholder="Value"
                              className="w-20 rounded-lg"
                              disabled={!product.adjustmentType}
                            />
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">₹{product.finalPrice.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={product.minQty}
                              onChange={(e) => handleProductUpdate(product.id, 'minQty', e.target.value)}
                              className="w-16 rounded-lg"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={product.maxQty}
                              onChange={(e) => handleProductUpdate(product.id, 'maxQty', e.target.value)}
                              className="w-16 rounded-lg"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExcludeProduct(product.id)}
                                className="p-2 rounded-lg text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* 6. Simulation */}
            {productsInCatalogue.length > 0 && (
              <Card className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="size-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Catalogue Simulation</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Test this catalogue</p>
                    <p className="text-sm text-gray-600">Simulate how this catalogue will appear to users</p>
                  </div>
                  <Button
                    onClick={handleSimulateCatalogue}
                    disabled={isSimulating}
                    className="bg-[#0e042f] hover:opacity-90 rounded-lg text-white"
                  >
                    {isSimulating ? 'Simulating...' : 'Run Simulation'}
                  </Button>
                </div>
                {simulatedCount !== null && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Simulation Result:</strong> {simulatedCount} products will be available in this catalogue
                    </p>
                  </div>
                )}
              </Card>
            )}

          </div>

          {/* RIGHT SIDE - Status & System Info */}
          <div className="space-y-6">

            {/* Catalogue Status */}
            <Card className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="size-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Catalogue Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={catalogueStatus === 'active' ? 'default' : catalogueStatus === 'inactive' ? 'destructive' : 'secondary'}>
                    {catalogueStatus.charAt(0).toUpperCase() + catalogueStatus.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="text-sm font-medium text-gray-900">{productsInCatalogue.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <span className="text-sm font-medium text-gray-900">
                    {priority || 'Not set'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Assignment Summary (Mock) */}
            <Card className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="size-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Assignment Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Segments:</span>
                  <span className="ml-2 font-medium text-gray-900">All</span>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50 border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="size-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Quick Help</h3>
              </div>
              <div className="space-y-2 text-xs text-blue-800">
                <p>• Select a tier to load products automatically</p>
                <p>• Use exclusion rules to remove specific product categories</p>
                <p>• Add filters to refine product selection</p>
                <p>• Set custom pricing for individual products</p>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCatalogForm;