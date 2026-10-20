import { useState } from "react";
import {
  Truck,
  Warehouse,
  Info,
  Database,
  Package,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormSection } from "@/components/forms/FormSection";

export interface ShippingAndFulfillmentCardProps {
  isDraftMode: boolean;
  isCreatedMode: boolean;
  fulfillmentStatus: string; // e.g., 'unfulfilled', 'partial', 'fulfilled', 'returned', 'cancelled'
  onFulfillmentAction?: (action: string) => void;
}

export function ShippingAndFulfillmentCard({
  isDraftMode,
  isCreatedMode,
  fulfillmentStatus: initialFulfillmentStatus,
  onFulfillmentAction,
}: ShippingAndFulfillmentCardProps) {
  // Local state for UI simulation
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("WH-MUMBAI-01");
  const [shippingPartner, setShippingPartner] = useState("");
  const [serviceLevel, setServiceLevel] = useState("standard");
  const [dispatchDate, setDispatchDate] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  
  // To allow simulation without full backend connection map
  // we just simulate visually if the parent didn't strictly give us 'shipped' etc.
  // In the real app, these map to OrderStatus/FulfillmentStatus.
  const [internalStatus, setInternalStatus] = useState(initialFulfillmentStatus?.toLowerCase() || 'unfulfilled');

  const inventoryReservationStatus = "Reserved (100%)";
  const shipments = []; // Simulated

  const normalizedStatus = initialFulfillmentStatus?.toLowerCase() || internalStatus;

  const isPacked = normalizedStatus === 'packed' || normalizedStatus === 'shipped' || normalizedStatus === 'delivered' || normalizedStatus === 'fulfilled';
  const isDispatched = normalizedStatus === 'shipped' || normalizedStatus === 'delivered' || normalizedStatus === 'fulfilled';
  const isDelivered = normalizedStatus === 'delivered' || normalizedStatus === 'fulfilled';

  const handleCreateShipment = () => {
    setInternalStatus('packed');
    if (onFulfillmentAction) onFulfillmentAction('create_shipment');
  };

  const handleMarkAsPacked = () => {
    setInternalStatus('packed');
    if (onFulfillmentAction) onFulfillmentAction('mark_packed');
  };

  const handleMarkAsDispatched = () => {
    setInternalStatus('shipped');
    if (onFulfillmentAction) onFulfillmentAction('mark_dispatched');
  };

  const handleMarkAsDelivered = () => {
    setInternalStatus('delivered');
    if (onFulfillmentAction) onFulfillmentAction('mark_delivered');
  };

  return (
    <FormSection
      icon={Truck}
      title="Shipping & Fulfillment"
      className={cn(isDraftMode && "opacity-60")}
    >
      <div className="space-y-3">
        {/* DRAFT Mode - Locked State */}
        {isDraftMode && (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-600 font-medium mb-1">
              Create Order to Enable
            </p>
            <p className="text-xs text-slate-500">
              Fulfillment, shipping labels, and dispatch are available after
              order creation
            </p>
          </div>
        )}

        {/* CREATED Mode - Active State */}
        {isCreatedMode && (
          <>
            {/* Fulfillment Summary */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-slate-700">
                Fulfillment Status
              </span>
              <Badge
                className={cn(
                  "text-xs",
                  normalizedStatus === "unfulfilled" &&
                    "bg-slate-100 text-slate-800 border-slate-200",
                  normalizedStatus === "partial" &&
                    "bg-amber-100 text-amber-800 border-amber-200",
                  normalizedStatus === "packed" &&
                    "bg-purple-100 text-purple-800 border-purple-200",
                  normalizedStatus === "shipped" &&
                    "bg-blue-100 text-blue-800 border-blue-200",
                  (normalizedStatus === "delivered" || normalizedStatus === "fulfilled") &&
                    "bg-green-100 text-green-800 border-green-200",
                  normalizedStatus === "cancelled" &&
                    "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {normalizedStatus === "unfulfilled" && "Unfulfilled"}
                {normalizedStatus === "partial" && "Partially Fulfilled"}
                {normalizedStatus === "packed" && "Packed"}
                {normalizedStatus === "shipped" && "Dispatched"}
                {(normalizedStatus === "delivered" || normalizedStatus === "fulfilled") && "Delivered"}
                {normalizedStatus === "cancelled" && "Cancelled"}
                {!["unfulfilled", "partial", "packed", "shipped", "delivered", "fulfilled", "cancelled"].includes(
                  normalizedStatus
                ) && normalizedStatus.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            {/* Warehouse Selection */}
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">
                Warehouse / Location
              </Label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH-MUMBAI-01" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-3 h-3" />
                      Mumbai Central Warehouse
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        Suggested
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="WH-DELHI-01" className="text-xs">
                    Delhi Main Warehouse
                  </SelectItem>
                  <SelectItem value="WH-BANGALORE-01" className="text-xs">
                    Bangalore South Warehouse
                  </SelectItem>
                  <SelectItem value="WH-CHENNAI-01" className="text-xs">
                    Chennai Hub
                  </SelectItem>
                  <SelectItem value="WH-KOLKATA-01" className="text-xs">
                    Kolkata Distribution Center
                  </SelectItem>
                </SelectContent>
              </Select>
              {selectedWarehouse && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Auto-selected based on shipping location
                </p>
              )}
            </div>

            {/* Inventory Reservation */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">
                  Inventory
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-blue-100 text-blue-800 border-blue-300"
              >
                {inventoryReservationStatus}
              </Badge>
            </div>

            <Separator className="my-2" />

            {/* Shipment Setup */}
            {normalizedStatus === "unfulfilled" && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">
                  Shipment Setup
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">
                    Shipping Partner
                  </Label>
                  <Select
                    value={shippingPartner}
                    onValueChange={setShippingPartner}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhivery" className="text-xs">
                        Delhivery
                      </SelectItem>
                      <SelectItem value="bluedart" className="text-xs">
                        Blue Dart
                      </SelectItem>
                      <SelectItem value="dtdc" className="text-xs">
                        DTDC
                      </SelectItem>
                      <SelectItem value="fedex" className="text-xs">
                        FedEx
                      </SelectItem>
                      <SelectItem value="shiprocket" className="text-xs">
                        Shiprocket
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!shippingPartner && (
                    <p className="text-xs text-slate-500 mt-1">
                      <a href="#" className="text-indigo-600 hover:underline">
                        Connect shipping partner
                      </a>{" "}
                      in Settings
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">
                      Service Level
                    </Label>
                    <Select
                      value={serviceLevel}
                      onValueChange={setServiceLevel}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard" className="text-xs">
                          Standard
                        </SelectItem>
                        <SelectItem value="express" className="text-xs">
                          Express
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">
                      Dispatch Date
                    </Label>
                    <Input
                      type="date"
                      value={dispatchDate}
                      onChange={(e) => setDispatchDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">
                    Tracking Number (Optional)
                  </Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">
                    Shipping Cost (₹)
                  </Label>
                  <Input
                    type="number"
                    value={shippingCost || ""}
                    onChange={(e) =>
                      setShippingCost(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {normalizedStatus === "unfulfilled" && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <Button
                  onClick={handleCreateShipment}
                  disabled={!shippingPartner || !selectedWarehouse}
                  className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                  type="button"
                >
                  <Package className="w-3 h-3 mr-2" />
                  Create Shipment
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {}}
                    disabled={!shippingPartner || shipments.length === 0}
                    variant="outline"
                    className="h-7 text-xs"
                    type="button"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Generate Label
                  </Button>
                  <Button
                    onClick={() => {}}
                    variant="outline"
                    className="h-7 text-xs"
                    type="button"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Packing Slip
                  </Button>
                </div>
              </div>
            )}

            {/* Pack & Dispatch Actions */}
            {normalizedStatus !== "unfulfilled" &&
              !isDelivered && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Fulfillment Actions
                  </div>

                  {!isPacked && (
                    <Button
                      onClick={handleMarkAsPacked}
                      className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                      type="button"
                    >
                      <Package className="w-3 h-3 mr-2 text-white" />
                      Mark as Packed
                    </Button>
                  )}

                  {isPacked && !isDispatched && (
                    <Button
                      onClick={handleMarkAsDispatched}
                      disabled={!shippingPartner}
                      className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      type="button"
                    >
                      <Truck className="w-3 h-3 mr-2" />
                      Mark as Dispatched
                    </Button>
                  )}

                  {isDispatched && !isDelivered && (
                    <Button
                      onClick={handleMarkAsDelivered}
                      className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                      type="button"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              )}

            {/* Delivery Confirmation */}
            {isDelivered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-green-900">
                  Order Delivered
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Successfully delivered to customer
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </FormSection>
  );
}
