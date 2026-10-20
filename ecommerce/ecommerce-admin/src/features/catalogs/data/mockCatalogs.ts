import type { Catalog } from '../types/catalog.types';

// ============================================
// CATALOG CONSTANTS
// ============================================

export const DISCOUNT_TYPES = [
  'Percentage',
  'Fixed Amount',
  'Buy X Get Y'
] as const;

export const CATALOG_STATUSES = [
  'Active',
  'Inactive', 
  'Draft'
] as const;

// ============================================
// MOCK CATALOG DATA
// ============================================

export const MOCK_CATALOG_LIST: Catalog[] = [
  {
    id: '1',
    catalog_id: 'CAT-AE-001',
    catalogName: 'Summer Sports Collection 2024',
    description: 'Comprehensive catalog featuring cricket, badminton, and tennis equipment for summer season with attractive discounts.',
    discountType: 'Percentage',
    discountValue: '15%',
    products: 45,
    status: 'Active',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 'Admin User'
  },
  {
    id: '2',
    catalog_id: 'CAT-AE-002',
    catalogName: 'Bulk Purchase Cricket Equipment',
    description: 'Special catalog for bulk orders of cricket equipment including bats, balls, pads, and protective gear.',
    discountType: 'Fixed Amount',
    discountValue: '₹5,000',
    products: 28,
    status: 'Active',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z',
    created_by: 'Admin User'
  },
  {
    id: '3',
    catalog_id: 'CAT-AE-003',
    catalogName: 'Badminton Pro Series Catalog',
    description: 'Premium badminton equipment catalog featuring professional rackets, strings, and shuttlecocks.',
    discountType: 'Percentage',
    discountValue: '20%',
    products: 32,
    status: 'Active',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
    created_by: 'Admin User'
  },
  {
    id: '4',
    catalog_id: 'CAT-AE-004',
    catalogName: 'Football Academy Bundle',
    description: 'Complete football equipment package for academies and training centers.',
    discountType: 'Buy X Get Y',
    discountValue: 'Buy 10 Get 2',
    products: 18,
    status: 'Draft',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    created_by: 'Admin User'
  },
  {
    id: '5',
    catalog_id: 'CAT-AE-005',
    catalogName: 'Gym Equipment Wholesale',
    description: 'Industrial-grade gym equipment for fitness centers and commercial establishments.',
    discountType: 'Fixed Amount',
    discountValue: '₹8,500',
    products: 52,
    status: 'Active',
    created_at: '2024-01-11T11:30:00Z',
    updated_at: '2024-01-11T11:30:00Z',
    created_by: 'Admin User'
  },
  {
    id: '6',
    catalog_id: 'CAT-AE-006',
    catalogName: 'Swimming Pool Essentials',
    description: 'Complete swimming pool equipment and accessories catalog for pools and aquatic centers.',
    discountType: 'Percentage',
    discountValue: '12%',
    products: 24,
    status: 'Active',
    created_at: '2024-01-10T16:45:00Z',
    updated_at: '2024-01-10T16:45:00Z',
    created_by: 'Admin User'
  },
  {
    id: '7',
    catalog_id: 'CAT-AE-007',
    catalogName: 'Tennis Tournament Package',
    description: 'Professional tennis equipment for tournaments and competitive events.',
    discountType: 'Fixed Amount',
    discountValue: '₹3,200',
    products: 16,
    status: 'Inactive',
    created_at: '2024-01-09T13:15:00Z',
    updated_at: '2024-01-09T13:15:00Z',
    created_by: 'Admin User'
  },
  {
    id: '8',
    catalog_id: 'CAT-AE-008',
    catalogName: 'Basketball Team Catalog',
    description: 'Complete basketball equipment for teams and training programs.',
    discountType: 'Buy X Get Y',
    discountValue: 'Buy 5 Get 1',
    products: 22,
    status: 'Active',
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-08T10:00:00Z',
    created_by: 'Admin User'
  },
  {
    id: '9',
    catalog_id: 'CAT-AE-009',
    catalogName: 'Running & Athletics Range',
    description: 'Comprehensive athletics equipment for runners and track field events.',
    discountType: 'Percentage',
    discountValue: '18%',
    products: 38,
    status: 'Active',
    created_at: '2024-01-07T12:30:00Z',
    updated_at: '2024-01-07T12:30:00Z',
    created_by: 'Admin User'
  },
  {
    id: '10',
    catalog_id: 'CAT-AE-010',
    catalogName: 'Yoga Studio Bundle',
    description: 'Yoga and meditation equipment for studios and wellness centers.',
    discountType: 'Fixed Amount',
    discountValue: '₹2,800',
    products: 14,
    status: 'Draft',
    created_at: '2024-01-06T09:45:00Z',
    updated_at: '2024-01-06T09:45:00Z',
    created_by: 'Admin User'
  },
  {
    id: '11',
    catalog_id: 'CAT-AE-011',
    catalogName: 'Cycling Gear Premium Catalog',
    description: 'High-end cycling equipment including bikes, helmets, and accessories.',
    discountType: 'Percentage',
    discountValue: '25%',
    products: 30,
    status: 'Active',
    created_at: '2024-01-05T14:15:00Z',
    updated_at: '2024-01-05T14:15:00Z',
    created_by: 'Admin User'
  },
  {
    id: '12',
    catalog_id: 'CAT-AE-012',
    catalogName: 'Table Tennis Pro Package',
    description: 'Professional table tennis equipment for clubs and competitive players.',
    discountType: 'Buy X Get Y',
    discountValue: 'Buy 3 Get 1',
    products: 12,
    status: 'Inactive',
    created_at: '2024-01-04T11:20:00Z',
    updated_at: '2024-01-04T11:20:00Z',
    created_by: 'Admin User'
  }
];
