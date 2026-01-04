/**
 * Application Configuration
 * 
 * Centralized configuration for the FlyCloth e-commerce platform.
 * Update values here to change behavior across the entire application.
 */

// =============================================================================
// CURRENCY
// =============================================================================

export const CURRENCY = {
  /** ISO 4217 currency code */
  code: 'MYR',
  /** Currency symbol for display */
  symbol: 'RM',
  /** Locale for number formatting */
  locale: 'en-MY',
  /** Decimal places for display */
  decimals: 2,
} as const;

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: CURRENCY.decimals,
    maximumFractionDigits: CURRENCY.decimals,
  })}`;
}

/**
 * Format a number as currency for Stripe (convert to cents)
 */
export function toCurrencyCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents back to currency amount
 */
export function fromCurrencyCents(cents: number): number {
  return cents / 100;
}

// =============================================================================
// INVENTORY LIMITS
// =============================================================================

export const INVENTORY = {
  /** Maximum stock quantity per variant */
  maxStock: 100000,
  /** Maximum price per item */
  maxPrice: 50000,
  /** Minimum price per item */
  minPrice: 1,
  /** Low stock warning threshold */
  lowStockThreshold: 25,
} as const;

// =============================================================================
// CART LIMITS
// =============================================================================

export const CART = {
  /** Maximum quantity per cart item */
  maxQuantityPerItem: 10,
  /** Maximum different items in cart */
  maxCartItems: 50,
} as const;

// =============================================================================
// FILE UPLOAD LIMITS
// =============================================================================

export const UPLOAD = {
  /** Maximum file size in bytes (50MB) */
  maxFileSize: 50 * 1024 * 1024,
  /** Maximum number of files per product */
  maxFilesPerProduct: 10,
  /** Allowed image types */
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  /** Allowed video types */
  allowedVideoTypes: ['video/mp4', 'video/webm'],
} as const;

// =============================================================================
// SHIPPING
// =============================================================================

export const SHIPPING = {
  /** Allowed countries for shipping */
  allowedCountries: ['MY', 'SG', 'BN'] as const,
  /** Default country */
  defaultCountry: 'MY',
} as const;
