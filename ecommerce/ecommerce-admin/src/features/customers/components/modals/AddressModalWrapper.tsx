import { useState } from 'react';
import { notifySuccess } from '@/utils';
import { AddressModal } from '../../modals/AddressModal';

interface AddressModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddressModalWrapper({ isOpen, onClose }: AddressModalWrapperProps) {
  const [addressName, setAddressName] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPincode, setAddressPincode] = useState('');
  const [addressStreet1, setAddressStreet1] = useState('');
  const [addressStreet2, setAddressStreet2] = useState('');
  const [addressLandmark, setAddressLandmark] = useState('');
  const [addressType, setAddressType] = useState('');
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);

  const handleSave = () => {
    // Here you would normally save to backend
    notifySuccess('Address added successfully');
    onClose();

    // Reset form
    setAddressName('');
    setAddressCountry('');
    setAddressState('');
    setAddressCity('');
    setAddressPincode('');
    setAddressStreet1('');
    setAddressStreet2('');
    setAddressLandmark('');
    setAddressType('');
    setIsDefaultBilling(false);
    setIsDefaultShipping(false);
  };

  return (
    <AddressModal
      isOpen={isOpen}
      onClose={onClose}
      editingAddressId={null}
      addressName={addressName}
      setAddressName={setAddressName}
      addressCountry={addressCountry}
      setAddressCountry={setAddressCountry}
      addressState={addressState}
      setAddressState={setAddressState}
      addressCity={addressCity}
      setAddressCity={setAddressCity}
      addressPincode={addressPincode}
      setAddressPincode={setAddressPincode}
      addressStreet1={addressStreet1}
      setAddressStreet1={setAddressStreet1}
      addressStreet2={addressStreet2}
      setAddressStreet2={setAddressStreet2}
      addressLandmark={addressLandmark}
      setAddressLandmark={setAddressLandmark}
      addressType={addressType}
      setAddressType={setAddressType}
      isDefaultBilling={isDefaultBilling}
      setIsDefaultBilling={setIsDefaultBilling}
      isDefaultShipping={isDefaultShipping}
      setIsDefaultShipping={setIsDefaultShipping}
      onSave={handleSave}
    />
  );
}
