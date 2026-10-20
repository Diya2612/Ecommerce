import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { countryOptions, addressTypeOptions } from '../constants/options';
import { useEffect, useState } from 'react';
import { getStates, getCities, type State } from '../services/locationService';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddressId: string | null;
  addressName: string;
  setAddressName: (value: string) => void;
  addressCountry: string;
  setAddressCountry: (value: string) => void;
  addressState: string;
  setAddressState: (value: string) => void;
  addressCity: string;
  setAddressCity: (value: string) => void;
  addressPincode: string;
  setAddressPincode: (value: string) => void;
  addressStreet1: string;
  setAddressStreet1: (value: string) => void;
  addressStreet2: string;
  setAddressStreet2: (value: string) => void;
  addressLandmark: string;
  setAddressLandmark: (value: string) => void;
  addressType: string;
  setAddressType: (value: string) => void;
  isDefaultBilling: boolean;
  setIsDefaultBilling: (value: boolean) => void;
  isDefaultShipping: boolean;
  setIsDefaultShipping: (value: boolean) => void;
  onSave: () => void;
}

export function AddressModal({
  isOpen,
  onClose,
  editingAddressId,
  addressName,
  setAddressName,
  addressCountry,
  setAddressCountry,
  addressState,
  setAddressState,
  addressCity,
  setAddressCity,
  addressPincode,
  setAddressPincode,
  addressStreet1,
  setAddressStreet1,
  addressStreet2,
  setAddressStreet2,
  addressLandmark,
  setAddressLandmark,
  addressType,
  setAddressType,
  isDefaultBilling,
  setIsDefaultBilling,
  isDefaultShipping,
  setIsDefaultShipping,
  onSave
}: AddressModalProps) {
  // State for dynamic locations
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!addressCountry) {
        setStates([]);
        return;
      }

      setLoadingStates(true);
      try {
        const data = await getStates(addressCountry);
        setStates(data);

        // Clear dependent fields ONLY if the user is actively changing the country
        // (This effect also runs on mount, so we need to be careful not to clear if editing)
        // However, standard pattern is to clear if the new list doesn't contain current value.
        // For simplicity and correctness in new selection:
        // We will rely on the fact that if a user changes country, the existing state likely isn't valid.
        // But when opening "Edit", we want to preserve values.
        // We'll handle "Edit" preservation by only clearing if the user interacts, or we can check validity.
        // Simplest: The parent component controls the state. 
        // We should clear dependents here if it's a *change*.
        // But how do we distinguish initial load vs change?
        // We can just fetch. The cleanup is handled in the onChange handler of the Select component below.
      } catch (error) {
        console.error("Failed to load states", error);
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, [addressCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!addressCountry || !addressState) {
        setCities([]);
        return;
      }

      setLoadingCities(true);
      try {
        const data = await getCities(addressCountry, addressState);
        setCities(data);
      } catch (error) {
        console.error("Failed to load cities", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [addressCountry, addressState]);


  const handleCountryChange = (value: string) => {
    setAddressCountry(value);
    setAddressState(''); // Clear state when country changes
    setAddressCity('');  // Clear city when country changes
  };

  const handleStateChange = (value: string) => {
    setAddressState(value);
    setAddressCity(''); // Clear city when state changes
  };

  const handleTypeChange = (value: string) => {
    if (value === 'other') {
      setAddressType(''); // Clear it to show Input
    } else {
      setAddressType(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[20px] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription>
            {editingAddressId ? 'Update the details of the address below.' : 'Enter the details for the new address.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Address Name */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Address Name</Label>
            <Input
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              placeholder="e.g. My Home, Dad's Office"
              className="rounded-xl"
            />
          </div>

          {/* Country & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Country</Label>
              <Select value={addressCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {countryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">State</Label>
              <Select
                value={addressState}
                onValueChange={handleStateChange}
                disabled={!addressCountry || loadingStates}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={
                    !addressCountry
                      ? "Select Country First"
                      : loadingStates
                        ? "Loading..."
                        : "Select state"
                  } />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[200px]">
                  {states.map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">City *</Label>
              {cities.length > 0 ? (
                <Select
                  value={addressCity}
                  onValueChange={setAddressCity}
                  disabled={!addressState || loadingCities}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={
                      !addressState
                        ? "Select State First"
                        : loadingCities
                          ? "Loading..."
                          : "Select City"
                    } />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[200px]">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Fallback to Input if no cities loaded (e.g., failed to fetch or custom state)
                <Input
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="Enter city"
                  className="rounded-xl"
                  disabled={loadingCities}
                />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Zip / Pincode *</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={addressPincode}
                onChange={(e) => setAddressPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter pincode"
                className="rounded-xl"
                maxLength={6}
              />
            </div>
          </div>

          {/* Street Address 1 */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Street Address 1 *</Label>
            <Input
              value={addressStreet1}
              onChange={(e) => setAddressStreet1(e.target.value)}
              placeholder="House/Flat number, Building name"
              className="rounded-xl"
            />
          </div>

          {/* Street Address 2 */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Street Address 2</Label>
            <Input
              value={addressStreet2}
              onChange={(e) => setAddressStreet2(e.target.value)}
              placeholder="Street name, Area"
              className="rounded-xl"
            />
          </div>

          {/* Landmark */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Landmark</Label>
            <Input
              value={addressLandmark}
              onChange={(e) => setAddressLandmark(e.target.value)}
              placeholder="Nearby landmark"
              className="rounded-xl"
            />
          </div>

          {/* Address Type */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Address Type</Label>
            <div className="space-y-3">
              <Select
                value={['home', 'office'].includes(addressType.toLowerCase()) ? addressType.toLowerCase() : 'other'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {addressTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!['home', 'office'].includes(addressType.toLowerCase())) && (
                <Input
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  placeholder="Enter custom address type"
                  className="rounded-xl"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Default Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <Label className="text-sm font-medium text-slate-700">Set as Default Billing</Label>
              <Switch checked={isDefaultBilling} onCheckedChange={setIsDefaultBilling} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <Label className="text-sm font-medium text-slate-700">Set as Default Shipping</Label>
              <Switch checked={isDefaultShipping} onCheckedChange={setIsDefaultShipping} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={onSave} className="rounded-xl bg-[#0e042f] hover:bg-[#0e042f]/90 text-white">
            <Save className="size-4 mr-2" />
            {editingAddressId ? 'Update Address' : 'Save Address'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

