/**
 * Order and cart type definitions
 */

/** Cart item for display */
export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    fit: string;
    price: number;
    stock_quantity: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
    product_images?: {
      storage_path: string;
    }[];
  };
}

/** Order status enum */
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

/** Payment status enum */
export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

/** Order item in an order */
export interface OrderItem {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/** Order with basic info */
export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  shipping_address?: string;
  tracking_number?: string;
  created_at: string;
  updated_at?: string;
}

/** Product review */
export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user_id: string;
  order_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

/** User purchase info for review eligibility */
export interface UserPurchase {
  order_id: string;
  existing_review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
  } | null;
}
