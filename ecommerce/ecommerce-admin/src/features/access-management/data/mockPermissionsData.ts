/**
 * Mock Permissions Data
 * Extracted to separate file for better code splitting
 */

export interface Permission {
  id: string;
  key: string;
  module: string;
  label: string;
  description: string;
  isCritical: boolean;
  createdDate: string;
}

export const mockPermissions: Permission[] = [
  {
    id: '1',
    key: 'orders.view',
    module: 'orders',
    label: 'View Orders',
    description: 'Can view order list and details',
    isCritical: false,
    createdDate: '2024-01-10',
  },
  {
    id: '2',
    key: 'orders.create',
    module: 'orders',
    label: 'Create Orders',
    description: 'Can create new orders',
    isCritical: false,
    createdDate: '2024-01-10',
  },
  {
    id: '3',
    key: 'orders.refund',
    module: 'orders',
    label: 'Refund Orders',
    description: 'Can process refunds',
    isCritical: true,
    createdDate: '2024-01-10',
  },
  {
    id: '4',
    key: 'products.view',
    module: 'products',
    label: 'View Products',
    description: 'Can view product catalog',
    isCritical: false,
    createdDate: '2024-01-10',
  },
  {
    id: '5',
    key: 'products.edit_prices',
    module: 'products',
    label: 'Edit Prices',
    description: 'Can modify product prices',
    isCritical: true,
    createdDate: '2024-01-10',
  },
  {
    id: '6',
    key: 'products.archive',
    module: 'products',
    label: 'Archive Products',
    description: 'Can archive/delete products',
    isCritical: true,
    createdDate: '2024-01-10',
  },
  {
    id: '7',
    key: 'customers.view',
    module: 'customers',
    label: 'View Customers',
    description: 'Can view customer list',
    isCritical: false,
    createdDate: '2024-01-10',
  },
  {
    id: '8',
    key: 'customers.export',
    module: 'customers',
    label: 'Export Customer Data',
    description: 'Can export customer information',
    isCritical: true,
    createdDate: '2024-01-10',
  },
  {
    id: '9',
    key: 'reports.financial',
    module: 'reports',
    label: 'View Financial Reports',
    description: 'Can view sensitive financial data',
    isCritical: true,
    createdDate: '2024-01-10',
  },
];
