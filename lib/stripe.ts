import Stripe from 'stripe';

// Initialize Stripe with the secret key
// This should only be used in server-side code
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features will not work');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2025-11-17' as Stripe.LatestApiVersion,
  typescript: true,
});

// Get the publishable key for client-side usage
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return key;
}

/**
 * Create a Stripe Product and Price for a local product
 */
export async function createStripeProduct(product: {
  name: string;
  description?: string;
  price: number; // in MYR (will be converted to cents)
  sku: string;
}) {
  // Create the product in Stripe
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: product.description || undefined,
    metadata: {
      sku: product.sku,
    },
  });

  // Create a price for the product (Stripe uses cents)
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(product.price * 100), // Convert to cents
    currency: 'myr',
  });

  return {
    productId: stripeProduct.id,
    priceId: stripePrice.id,
  };
}

/**
 * Update a Stripe Product
 */
export async function updateStripeProduct(
  stripeProductId: string,
  updates: {
    name?: string;
    description?: string;
    active?: boolean;
  }
) {
  return await stripe.products.update(stripeProductId, updates);
}

/**
 * Create a new price for an existing product (prices are immutable in Stripe)
 */
export async function createStripePrice(
  stripeProductId: string,
  price: number // in MYR
) {
  return await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(price * 100),
    currency: 'myr',
  });
}

/**
 * Validate a promotion code and return its details
 */
export async function validatePromoCode(code: string) {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      code: code,
      active: true,
      limit: 1,
      expand: ['data.coupon'],
    });

    if (promotionCodes.data.length === 0) {
      return { valid: false, error: 'Invalid or expired promotion code' };
    }

    const promoCode = promotionCodes.data[0] as any;
    const coupon = promoCode.coupon;

    return {
      valid: true,
      promoCodeId: promoCode.id,
      coupon: {
        id: coupon?.id,
        percentOff: coupon?.percent_off ?? null,
        amountOff: coupon?.amount_off ? coupon.amount_off / 100 : null, // Convert from cents
        currency: coupon?.currency,
        name: coupon?.name,
      },
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Failed to validate promotion code' };
  }
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}

/**
 * List all active promotion codes (for admin view if needed)
 */
export async function listActivePromoCodes(limit = 10) {
  const promotionCodes = await stripe.promotionCodes.list({
    active: true,
    limit,
    expand: ['data.coupon'],
  });

  return promotionCodes.data.map((promo: any) => {
    const coupon = promo.coupon;
    return {
      id: promo.id,
      code: promo.code,
      couponId: coupon?.id ?? null,
      percentOff: coupon?.percent_off ?? null,
      amountOff: coupon?.amount_off ? coupon.amount_off / 100 : null,
      active: promo.active,
    };
  });
}

