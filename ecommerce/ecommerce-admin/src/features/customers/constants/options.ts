import type { SelectOption } from '../types/customer.types';

// Country options
export const countryOptions: SelectOption[] = [
  { value: 'india', label: 'India' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
];



// Language options (using standard language codes)
export const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'mr', label: 'Marathi' },
];

// Gender options (matching backend enum values)
export const genderOptions: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// Customer type options
export const customerTypeOptions: SelectOption[] = [
  { value: 'Retail', label: 'Retail' },
  { value: 'Distributor', label: 'Distributor' },
  { value: 'Wholesale', label: 'Wholesale' },
];

// Address type options
export const addressTypeOptions: SelectOption[] = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other/Custom' },
];

export const customerSegmentOptions: SelectOption[] = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Premium', label: 'Premium' },
  { value: 'VIP', label: 'VIP' },
  { value: 'Wholesale', label: 'Wholesale' },
];

// Email type options
export const emailTypeOptions: SelectOption[] = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
];

// Phone type options
export const phoneTypeOptions: SelectOption[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'work', label: 'Work' },
];
