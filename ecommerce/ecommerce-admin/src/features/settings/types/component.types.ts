import type { FieldValues } from 'react-hook-form';

// ==================== Component Props Interfaces ====================

export interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export interface SettingsFormProps<T extends FieldValues> {
  defaultValues: T;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
}

export interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}
