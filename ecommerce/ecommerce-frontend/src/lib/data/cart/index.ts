/**
 * Cart Data Layer - Barrel Exports
 * 
 * Central export point for all cart-related data fetching utilities
 */

// Types
export * from './types';

// Data Fetchers
export { getRecommendedProducts } from './getRecommendedProducts';
export { getUpsellProducts } from './getUpsellProducts';
export { getCrossSellProducts } from './getCrossSellProducts';
