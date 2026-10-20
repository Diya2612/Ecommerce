import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/forms';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import type { CustomerAddress } from '../../types/customer.types';

interface AddressesSectionProps {
  addresses: CustomerAddress[];
  handleOpenAddressModal: () => void;
  handleEditAddress: (address: CustomerAddress) => void;
  handleDeleteAddress: (id: string) => void;
}

export function AddressesSection({
  addresses,
  handleOpenAddressModal,
  handleEditAddress,
  handleDeleteAddress
}: AddressesSectionProps) {
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const addAction = (
    <Button
      onClick={handleOpenAddressModal}
      className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90"
      size="sm"
    >
      <Plus className="size-4 mr-2" />
      Add New Address
    </Button>
  );

  return (
    <>
      <FormSection icon={MapPin} title="Customer Addresses" actions={addAction}>

        {addresses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <MapPin className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-1">No addresses added yet</p>
            <p className="text-xs text-slate-500 mb-4">Click "Add New Address" to add customer address</p>
            <Button onClick={handleOpenAddressModal} variant="outline" className="rounded-xl">
              <Plus className="size-4 mr-2" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg capitalize">
                        {address.addressType}
                      </span>
                      {address.isDefaultBilling && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                          Default Billing
                        </span>
                      )}
                      {address.isDefaultShipping && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                          Default Shipping
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-800 font-medium">
                      {address.streetAddress1}, {address.streetAddress2 && `${address.streetAddress2}, `}
                      {address.city} - {address.pincode}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {address.state}, {address.country}
                    </div>
                    {address.landmark && (
                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <MapPin className="size-3" />
                        Near {address.landmark}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-400"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      onClick={() => setAddressToDelete(address.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* Delete Address Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={() => {
          if (addressToDelete) {
            handleDeleteAddress(addressToDelete);
            setAddressToDelete(null);
          }
        }}
        title="Remove Address"
        description="Are you sure you want to remove this address? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
