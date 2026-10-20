import React from "react";
import { SettingsCard } from "./SettingsCard";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  icon,
  badge,
}) => {
  return (
    <SettingsCard
      title={title}
      description={description}
      icon={icon}
      badge={badge}
    >
      {children}
    </SettingsCard>
  );
};