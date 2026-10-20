import { useState } from "react";
import { X, Truck, Package, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderItem, Address } from "@/features/orders/types";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address | null;
  onShipmentCreate?: (data: any) => void;
}

export function CreateShipmentModal({
  isOpen,
  onClose,
  orderNumber,
  items,
  shippingAddress,
  onShipmentCreate,
}: CreateShipmentModalProps) {
  // State for selected items to ship. Key is item ID, value is quantity to ship
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  
  // Package details state
  const [packageType, setPackageType] = useState<string>("");
  const [packageCount, setPackageCount] = useState<number>(1);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [shippingCost, setShippingCost] = useState<number>(0);

  // Shipment details state
  const [carrier, setCarrier] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [shipDate, setShipDate] = useState<string>("");
  const [estDelivery, setEstDelivery] = useState<string>("");

  const handleClose = () => {
    onClose();
  };

  const handleCreateShipment = () => {
    // Collect data and trigger callback
    const shipmentData = {
      items: selectedItems,
      carrier,
      trackingNumber,
      shipDate,
      estDelivery,
      package: {
        type: packageType,
        count: packageCount,
        weight: totalWeight,
        dimensions,
        cost: shippingCost,
      }
    };
    if (onShipmentCreate) {
      onShipmentCreate(shipmentData);
    }
    onClose();
  };

  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === items.length) {
      setSelectedItems({}); // Deselect all
    } else {
      const allSelected: Record<string, number> = {};
      items.forEach(item => {
        allSelected[item.id] = item.quantity; // Default to full quantity
      });
      setSelectedItems(allSelected);
    }
  };

  const isAllSelected = items.length > 0 && Object.keys(selectedItems).length === items.length;
  const selectedCount = Object.keys(selectedItems).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Truck className="h-6 w-6 text-indigo-600" />
            Create Shipment - #{orderNumber}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Create a new shipment for this order
          </p>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-8">
          {/* Section 1: Items */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Select Items to Ship</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{selectedCount} of {items.length} items selected</span>
                <Button variant="outline" size="sm" onClick={toggleSelectAll} className="h-8 text-xs rounded-lg">
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y">
              {items.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const qtyToShip = selectedItems[item.id] || 0;

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(prev => ({ ...prev, [item.id]: item.quantity }));
                          } else {
                            const newSelected = { ...selectedItems };
                            delete newSelected[item.id];
                            setSelectedItems(newSelected);
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">SKU: {item.productSku}</p>
                        {item.availableStock !== undefined && (
                          <p className="text-xs text-slate-500 mt-0.5">Available: {item.availableStock} units</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-md"
                        disabled={!isSelected || qtyToShip <= 1}
                        onClick={() => setSelectedItems(prev => ({...prev, [item.id]: qtyToShip - 1}))}
                      >
                        -
                      </Button>
                      <Input 
                        className="w-14 h-7 text-center text-sm p-0 rounded-md" 
                        value={isSelected ? qtyToShip : 0} 
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-md"
                        disabled={!isSelected || qtyToShip >= item.quantity}
                        onClick={() => setSelectedItems(prev => ({...prev, [item.id]: qtyToShip + 1}))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Carrier & Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Shipping Carrier *</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="custom">Custom Carrier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Tracking Number *</Label>
              <Input 
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number" 
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
              />
            </div>
          </div>

          {/* Section 3: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Ship Date *</Label>
              <Input 
                type="date" 
                value={shipDate}
                onChange={e => setShipDate(e.target.value)}
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10 text-slate-600 w-[180px]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Estimated Delivery</Label>
              <Input 
                type="date"
                value={estDelivery}
                onChange={e => setEstDelivery(e.target.value)}
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10 text-slate-600 w-[180px]" 
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Package Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Package Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Package Type</Label>
                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="envelope">Envelope</SelectItem>
                    <SelectItem value="tube">Tube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Package Count</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={packageCount}
                  onChange={e => setPackageCount(parseInt(e.target.value) || 1)}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Total Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={totalWeight}
                  onChange={e => setTotalWeight(parseFloat(e.target.value) || 0)}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Length (cm)</Label>
                <Input 
                  type="number" 
                  value={dimensions.length}
                  onChange={e => setDimensions(prev => ({...prev, length: parseFloat(e.target.value) || 0}))}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Width (cm)</Label>
                <Input 
                  type="number" 
                  value={dimensions.width}
                  onChange={e => setDimensions(prev => ({...prev, width: parseFloat(e.target.value) || 0}))}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Height (cm)</Label>
                <Input 
                  type="number" 
                  value={dimensions.height}
                  onChange={e => setDimensions(prev => ({...prev, height: parseFloat(e.target.value) || 0}))}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Shipping Cost ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={shippingCost}
                  onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
                />
              </div>
            </div>
          </section>

          {/* Section 5: Shipping Address */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                Shipping Address
              </h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                Edit Address
              </Button>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              {shippingAddress ? (
                <>
                  <p className="font-medium text-sm text-slate-900">{shippingAddress.label || "Shipping Address"}</p>
                  <p className="text-sm text-slate-500 mt-1">{shippingAddress.address}</p>
                  <p className="text-sm text-slate-500">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">No shipping address recorded for this order.</p>
              )}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t flex justify-end gap-3 shrink-0 bg-white">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl h-9 sm:h-[44px] px-4 sm:px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateShipment}
            disabled={selectedCount === 0 || !carrier || !trackingNumber || !shipDate}
            className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-xl h-10 px-6 font-medium"
          >
            Create Shipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
