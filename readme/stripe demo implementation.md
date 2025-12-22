# Stripe Test Implementation Guide

This document provides test card numbers and instructions for simulating payments in Stripe test mode.

## Test Card Numbers

### ✅ Successful Payments

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Standard successful payment |
| `4000 0025 0000 0003` | Requires 3D Secure (succeeds after authentication) |

**Use any:**
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP/Postal**: Any valid code (e.g., `12345`)

---

### ❌ Failed Payments (Declines)

These cards trigger the `payment_intent.payment_failed` webhook:

| Card Number | Failure Reason |
|-------------|----------------|
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |
| `4000 0000 0000 9979` | Stolen card |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |
| `4000 0000 0000 0119` | Processing error |

---

### 🔐 3D Secure / Authentication

| Card Number | Behavior |
|-------------|----------|
| `4000 0025 0000 3155` | Requires authentication → **Success** after |
| `4000 0027 6000 3184` | Requires authentication → **Declines** after |
| `4000 0082 6000 3178` | Requires authentication on all transactions |

---

## Webhook Events

Your implementation handles these Stripe webhook events:

| Event | Handler | Description |
|-------|---------|-------------|
| `checkout.session.completed` | `createOrderFromStripe()` | Creates order, decrements stock, clears cart |
| `payment_intent.payment_failed` | `handlePaymentFailed()` | Updates order payment status to 'failed' |

---

## Local Development

### Forward Webhooks with Stripe CLI

```bash
# Install Stripe CLI (if not installed)
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This outputs a webhook signing secret starting with `whsec_...`. Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Trigger Test Events Manually

```bash
# Trigger a successful checkout completion
stripe trigger checkout.session.completed

# Trigger a failed payment
stripe trigger payment_intent.payment_failed
```

---

## Testing Flow

1. Add items to cart → Navigate to `/user/cart/payment`
2. Click "Pay with Stripe" → Redirected to Stripe Checkout
3. Enter a test card number from above
4. Complete payment
5. **Success path**: Redirected to `/user/cart/payment/success`
6. **Failure path**: Stripe shows error, user can retry

---

## Production Checklist

- [ ] Switch Stripe keys from test (`pk_test_`, `sk_test_`) to live (`pk_live_`, `sk_live_`)
- [ ] Update `STRIPE_WEBHOOK_SECRET` to production webhook secret
- [ ] Enable webhook events in Stripe Dashboard for production endpoint
- [ ] Test with real cards (small amounts) before going live

---

## References

- [Stripe Test Cards Documentation](https://stripe.com/docs/testing#cards)
- [Stripe Webhook Events](https://stripe.com/docs/api/events/types)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
