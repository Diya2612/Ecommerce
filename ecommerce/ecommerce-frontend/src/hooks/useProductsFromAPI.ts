/**
 * useProductsFromAPI
 *
 * Fetches products from the backend API with a graceful fallback
 * to the static ECOMMERCE_PRODUCTS data when the backend is unreachable.
 *
 * Supports category filtering, sorting, and search query.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ECOMMERCE_PRODUCTS, ECOMMERCE_CATEGORIES, type Product } from '@/components/ecommerce/EcommerceData';

// Map backend ProductDetail fields → local Product shape
interface BackendProduct {
  id: string | number;
  slug?: string;
  name: string;
  description?: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  price: number;
  originalPrice?: number | null;
  compare_at_price?: string | number | null;
  selling_price?: string | number;
  discount?: number;
  rating?: number;
  reviews?: number;
  tags?: string[];
  category?: string;
  category_name?: string;
  inStock?: boolean;
  stock?: number;
  badge?: string;
  is_featured?: boolean;
}

function mapBackendToLocal(p: BackendProduct): Product {
  const price = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
  const originalPrice =
    (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : p.originalPrice) ??
    (p.compare_at_price ? parseFloat(String(p.compare_at_price)) : null) ??
    Math.round(price * 1.3);

  const images: string[] = p.images?.length
    ? p.images
    : p.image
    ? [p.image]
    : [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ];

  return {
    id: String(p.id),
    name: p.name,
    category: p.category ?? 'general',
    categoryName: p.category_name ?? p.category ?? 'General',
    tagline: p.subtitle ?? p.description?.slice(0, 90) ?? '',
    price,
    originalPrice: originalPrice ?? price,
    discount: p.discount ?? Math.round(((originalPrice! - price) / (originalPrice ?? price + 1)) * 100),
    rating: p.rating ?? 4.5,
    reviewsCount: p.reviews ?? 0,
    badge: p.badge ?? (p.is_featured ? 'Featured' : undefined),
    inStock: p.inStock ?? true,
    stockLeft: p.stock ?? 100,
    images,
    specs: p.tags ?? [],
  };
}

interface UseProductsOptions {
  category?: string;
  search?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  limit?: number;
}

interface UseProductsResult {
  products: Product[];
  categories: typeof ECOMMERCE_CATEGORIES;
  isLoading: boolean;
  isError: boolean;
  isFromAPI: boolean;
  refetch: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export function useProductsFromAPI(options: UseProductsOptions = {}): UseProductsResult {
  const { category, search, sort = 'featured', limit = 50 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFromAPI, setIsFromAPI] = useState(false);
  const fetchCount = useRef(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    const callId = ++fetchCount.current;

    try {
      let endpoint = `${API_BASE_URL}/products?limit=${limit}`;

      if (search && search.trim().length >= 2) {
        endpoint = `${API_BASE_URL}/products/search?q=${encodeURIComponent(search.trim())}&limit=${limit}`;
      } else if (category && category !== 'all') {
        endpoint = `${API_BASE_URL}/products?category=${encodeURIComponent(category)}&limit=${limit}`;
      }

      // Map sort options to backend sort params
      const sortMap: Record<string, string> = {
        'featured': 'popular',
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
        'rating': 'rating',
      };
      const backendSort = sortMap[sort] ?? 'popular';
      endpoint += `&sort=${backendSort}`;

      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      // Backend can return { data: { products: [...] } } or { products: [...] } or [...]
      let rawProducts: BackendProduct[] = [];
      if (Array.isArray(json)) {
        rawProducts = json;
      } else if (Array.isArray(json?.data)) {
        rawProducts = json.data;
      } else if (Array.isArray(json?.data?.products)) {
        rawProducts = json.data.products;
      } else if (Array.isArray(json?.products)) {
        rawProducts = json.products;
      }

      if (callId !== fetchCount.current) return; // Stale response

      if (rawProducts.length > 0) {
        setProducts(rawProducts.map(mapBackendToLocal));
        setIsFromAPI(true);
      } else {
        // Empty API response – use static fallback
        setProducts(getFilteredStatic(category, search, sort));
        setIsFromAPI(false);
      }
    } catch {
      if (callId !== fetchCount.current) return;
      // Network error – fall back to static data gracefully
      setProducts(getFilteredStatic(category, search, sort));
      setIsFromAPI(false);
      setIsError(true);
    } finally {
      if (callId === fetchCount.current) {
        setIsLoading(false);
      }
    }
  }, [category, search, sort, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    categories: ECOMMERCE_CATEGORIES,
    isLoading,
    isError,
    isFromAPI,
    refetch: fetchProducts,
  };
}

// ─── Static Data Filtering (Fallback) ────────────────────────────────────────

function getFilteredStatic(
  category?: string,
  search?: string,
  sort: UseProductsOptions['sort'] = 'featured',
): Product[] {
  let list = [...ECOMMERCE_PRODUCTS];

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }

  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q),
    );
  }

  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

  return list;
}
