import { useState } from "react";
import { MapPin, X, Loader2, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address } from "../../types";
import type { AddressSelectorProps } from "../../types";
import { useCustomer, useAddAddress } from "@/features/customers/hooks/useCustomers";

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;

export function AddressSelector({
  customer,
  selectedAddress,
  onSelect,
  addressType,
}: AddressSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch full customer details to get addresses
  const { data: customerDetails, isLoading } = useCustomer(customer?.id || "");
  const addAddressMutation = useAddAddress();

  // Map API addresses to Order Address type
  // API AddressType: { id, addressLine1, addressLine2, city, state, pincode, addressType ... }
  // Order AddressType: { id, label, address, city, state, pincode }
  const addresses: Address[] = (customerDetails?.addresses || []).map((addr: any) => ({
    id: addr.id,
    label: addr.addressType || addr.name || "Address", // Use addressType as label
    address: [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", "),
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
  }));

  const filteredAddresses = addresses.filter((addr) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      addr.label.toLowerCase().includes(q) ||
      addr.address.toLowerCase().includes(q) ||
      addr.city.toLowerCase().includes(q) ||
      addr.state.toLowerCase().includes(q) ||
      addr.pincode.includes(q)
    );
  });

  const handleSelectAddress = (address: Address) => {
    onSelect(address);
    setShowModal(false);
    setSearchQuery("");
  };

  const handleCreateAddress = async () => {
    if (!customer?.id) return;

    try {
      const result = await addAddressMutation.mutateAsync({
        userId: customer.id,
        addressData: {
          type: 'Other', // Default or could specific based on input if we added a select
          name: newAddress.label, // Using label as name for now
          addressLine1: newAddress.address,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          phone: customer.phone, // Inheriting customer phone as required by API usually
          country: 'India',
        }
      });

      const createdAddress: Address = {
        id: result?.id || `TEMP-${Date.now()}`,
        label: newAddress.label,
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
      };

      onSelect(createdAddress);
      setShowNewAddressForm(false);
      setShowModal(false);
      setNewAddress({ label: "", address: "", city: "", state: "", pincode: "" });

    } catch {
      // Error handled in hook
    }
  };

  const label =
    addressType === "shipping" ? "Shipping Address" : "Billing Address";

  return (
    <>
      {/* Selected Address Display — styled like CustomerForm AddressesSection card */}
      {selectedAddress ? (
        <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Type + default badges */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg capitalize">
                  {selectedAddress.label || (addressType === "shipping" ? "Shipping" : "Billing")}
                </span>
                {addressType === "shipping" && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                    Default Shipping
                  </span>
                )}
                {addressType === "billing" && (
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                    Default Billing
                  </span>
                )}
              </div>
              {/* Address lines */}
              <div className="text-sm text-slate-800 font-medium">
                {selectedAddress.address}
                {selectedAddress.city && `, ${selectedAddress.city}`}
                {selectedAddress.pincode && ` - ${selectedAddress.pincode}`}
              </div>
              {selectedAddress.state && (
                <div className="text-sm text-slate-500 mt-0.5">
                  {selectedAddress.state}, India
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 shrink-0"
              onClick={() => setShowModal(true)}
              disabled={!customer}
              title="Change address"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start rounded-xl border-dashed border-slate-200 h-10 text-slate-500 hover:bg-slate-50"
          onClick={() => setShowModal(true)}
          disabled={!customer}
        >
          <MapPin className="mr-2 size-4 text-slate-400" />
          Select {label}
        </Button>
      )}


      {/* Address Selection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border-0">
          <DialogHeader>
            <DialogTitle>Select {label}</DialogTitle>
            <DialogDescription>
              Choose from existing addresses or add a new one
            </DialogDescription>
          </DialogHeader>

          {!showNewAddressForm ? (
            <div className="space-y-4">
              {/* Search & Add Action */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    placeholder="Search address, city, or pincode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              {/* Address List */}
              <div className="space-y-2 max-h-96 overflow-y-auto min-h-[100px] relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}

                {!isLoading && filteredAddresses.length > 0 ? (
                  filteredAddresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      className="w-full text-left"
                      onClick={() => handleSelectAddress(address)}
                    >
                      <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl border border-slate-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-(--sidebar-bg)/10 flex items-center justify-center shrink-0">
                            <MapPin className="size-5 text-(--sidebar-bg)" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 mb-1">
                              {address.label}
                            </h4>
                            <div className="text-sm text-slate-600 space-y-0.5">
                              <div>{address.address}</div>
                              <div>
                                {address.city}, {address.state}{" "}
                                {address.pincode}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : !isLoading ? (
                  <div className="text-center py-12 text-slate-500">
                    <MapPin className="size-12 mx-auto mb-3 opacity-30" />
                    <p>No addresses found</p>
                    <p className="text-sm mt-1">
                      {searchQuery ? "Try a different search" : "Add a new address to continue"}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            /* New Address Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Add New Address
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address-label">Address Label *</Label>
                  <Input
                    id="address-label"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    placeholder="e.g., Home, Office, Warehouse"
                  />
                </div>

                <div>
                  <Label htmlFor="address-line">Address *</Label>
                  <Input
                    id="address-line"
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    placeholder="Street address, building name, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address-city">City *</Label>
                    <Input
                      id="address-city"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address-pincode">Pincode *</Label>
                    <Input
                      id="address-pincode"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          pincode: e.target.value,
                        })
                      }
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address-state">State *</Label>
                  <select
                    id="address-state"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={handleCreateAddress}
                    disabled={
                      !newAddress.label ||
                      !newAddress.address ||
                      !newAddress.city ||
                      !newAddress.state ||
                      !newAddress.pincode ||
                      addAddressMutation.isPending
                    }
                  >
                    {addAddressMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Address
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAddressForm(false)}
                    disabled={addAddressMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
