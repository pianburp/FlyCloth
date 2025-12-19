/**
 * Product-related type definitions
 * Consolidated from multiple files for consistent usage across the app
 */

/** Media attached to a product (images or videos) */
export interface ProductMedia {
  id?: string;
  storage_path: string;
  media_type: 'image' | 'video';
  is_primary?: boolean;
  sort_order?: number;
}

/** Product variant with size, fit, and inventory info */
export interface ProductVariant {
  id: string;
  sku?: string;
  size: string;
  fit: string;
  gsm?: number;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
}

/** Base product information */
export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  base_price: number;
  featured?: boolean;
  is_active?: boolean;
  sold_count?: number;
  created_at?: string;
  updated_at?: string;
}

/** Product with related media and variants */
export interface ProductWithRelations extends Product {
  product_images?: ProductMedia[];
  product_variants?: ProductVariant[];
}

/** Product with pre-computed media URLs for client-side rendering */
export interface ProductWithMediaUrls extends ProductWithRelations {
  imageUrl: string | null;
  videoUrl: string | null;
}

/** Product filter state for user dashboard */
export interface ProductFilters {
  searchQuery: string;
  priceRange: [number, number];
  selectedFits: string[];
  selectedGsm: string[];
}

/** Fit option with display label */
export interface FitOption {
  value: string;
  label: string;
}

/** Standard fit labels mapping */
export const FIT_LABELS: Record<string, string> = {
  'slim': 'Slim Fit',
  'regular': 'Regular Fit',
  'oversize': 'Oversize Fit',
};
