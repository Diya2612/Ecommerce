import type { LucideIcon } from "lucide-react";

/**
 * Navigation Types
 * 
 * Type definitions for the navigation system.
 */

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  rolesAllowed?: string[];
  permissionsAllowed?: string[];
  submenu?: NavSubItem[];
}

export interface NavSubItem {
  id: string;
  label: string;
  path: string;
  rolesAllowed?: string[];
  permissionsAllowed?: string[];
}

export type NavItemList = NavItem[];
