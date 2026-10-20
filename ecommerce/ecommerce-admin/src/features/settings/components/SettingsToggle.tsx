import type { FC } from "react";
import { useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsToggleProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const SettingsToggle: FC<SettingsToggleProps> = ({
  name,
  label,
  description,
  disabled = false,
}) => {
  const { watch, setValue } = useFormContext();
  const value = watch(name);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-1">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={name}
        checked={value || false}
        onCheckedChange={(checked) => setValue(name, checked)}
        disabled={disabled}
      />
    </div>
  );
};