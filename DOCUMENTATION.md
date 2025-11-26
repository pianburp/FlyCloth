# BajuNow - Complete Documentation

> Modern E-commerce Platform for Premium Shirts

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Database Setup](#database-setup)
4. [RBAC Implementation](#rbac-implementation)
5. [Storage Integration](#storage-integration)
6. [Implementation Status](#implementation-status)
7. [Troubleshooting](#troubleshooting)

---

## Overview

BajuNow is a shirt e-commerce application with Role-Based Access Control (RBAC) implementation built with Next.js 15 and Supabase.

### User Roles
- **User**: Can browse shirts, add to cart, and checkout
- **Admin**: Can manage products, orders, pricing, and store settings

---

## Database Schema

### Design Philosophy

#### ✅ Streamlined (Production-Ready)
- **8 core tables** instead of 14
- Fewer joins, better performance
- Native Supabase Storage integration
- Only essential features for MVP

#### ❌ Removed (Over-engineered for MVP)
- `brands` table
- `wishlist_items`
- `product_reviews`
- `order_status_history`
- `shipping_addresses` separate table (now JSONB in orders)
- `inventory_transactions`

### Core Tables

#### 1. **profiles**
```sql
- id (UUID) → references auth.users
- role (TEXT) DEFAULT 'user' -- 'user' or 'admin'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **categories**
```sql
- id (UUID)
- name (VARCHAR 100)
- description (TEXT)
- slug (VARCHAR 100)
- created_at (TIMESTAMP)
```

#### 3. **products**
```sql
- id (UUID)
- name (VARCHAR 200)
- description (TEXT)
- sku (VARCHAR 100) UNIQUE
- base_price (DECIMAL 10,2)
- category_id (UUID) → categories
- is_active (BOOLEAN)
- featured (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 4. **product_variants**
```sql
- id (UUID)
- product_id (UUID) → products
- sku (VARCHAR 100) UNIQUE
- size (VARCHAR 10) -- S, M, L, XL, XXL
- color (VARCHAR 50)
- color_hex (VARCHAR 7)
- price (DECIMAL 10,2)
- stock_quantity (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(product_id, size, color)
```

#### 5. **product_images**
```sql
- id (UUID)
- product_id (UUID) → products
- storage_path (TEXT) -- e.g., "product-images/abc-123/shirt-front.jpg"
- alt_text (VARCHAR 200)
- sort_order (INTEGER)
- is_primary (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 6. **coupons**
```sql
- id (UUID)
- code (VARCHAR 50) UNIQUE
- description (TEXT)
- discount_type (ENUM: percentage, fixed, shipping)
- discount_value (DECIMAL 10,2)
- minimum_order_amount (DECIMAL 10,2)
- is_active (BOOLEAN)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 7. **cart_items**
```sql
- id (UUID)
- user_id (UUID) → auth.users
- variant_id (UUID) → product_variants
- quantity (INTEGER)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(user_id, variant_id)
```

#### 8. **orders**
```sql
- id (UUID)
- user_id (UUID) → auth.users
- order_number (VARCHAR 50) UNIQUE -- Auto-generated: BN20241124XXXXX
- status (ENUM: pending, processing, shipped, delivered, cancelled)
- subtotal, tax_amount, shipping_amount, discount_amount, total_amount (DECIMAL 10,2)
- coupon_code (VARCHAR 50)
- payment_method (VARCHAR 50)
- payment_status (ENUM: pending, paid, failed)
- shipping_address (JSONB) -- { "name": "...", "address": "...", "city": "...", etc }
- created_at, updated_at (TIMESTAMP)
```

#### 9. **order_items**
```sql
- id (UUID)
- order_id (UUID) → orders
- product_name (VARCHAR 200) -- Snapshot
- product_sku (VARCHAR 100) -- Snapshot
- size (VARCHAR 10)
- color (VARCHAR 50)
- price (DECIMAL 10,2) -- Snapshot
- quantity (INTEGER)
- total (DECIMAL 10,2)
- created_at (TIMESTAMP)
```

### Automatic Features

#### Triggers
- **updated_at**: Auto-updates on products, variants, cart, orders
- **order_number**: Auto-generates format `BN{YYYYMMDD}{5-digit-random}`
- **inventory**: Auto-decrements stock when order is created
- **profile creation**: Auto-creates profile on user signup

#### Indexes
- Products: category, active status
- Variants: product_id
- Images: product_id
- Cart: user_id
- Orders: user_id, status

---

## Database Setup

### Step 1: Run Migrations

In your Supabase Dashboard → SQL Editor, run these files in order:

```sql
-- 1. User profiles and RBAC
001_schema.sql

-- 2. Row Level Security policies
002_rls_policies.sql

-- 3. Storage bucket configuration
003_storage.sql

-- 4. Sample product data
004_seed_data.sql
```

### Step 2: Verify Setup

Run this query to verify the `profiles` table:

```sql
SELECT * FROM profiles;
```

Check triggers are active:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Step 3: Create Admin User

#### Option A: Via SQL Editor

```sql
-- Replace 'your-email@example.com' with your email
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

#### Option B: Via Table Editor

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `profiles` table
3. Find your user row
4. Change `role` from `user` to `admin`
5. Press Enter to save

### Step 4: Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Confirm `product-images` bucket exists
3. Check it's marked as **Public**

---

## RBAC Implementation

### Architecture

#### Components

1. **Middleware** (`middleware.ts`)
   - Protects routes based on user roles
   - Redirects unauthenticated users to login
   - Redirects authenticated users to role-specific dashboards

2. **RBAC Utilities** (`lib/rbac.ts`)
   - `getUserRole()` - Get current user's role
   - `getUserProfile()` - Get complete profile
   - `hasRole()` - Check if user has specific role
   - `isAdmin()` - Check if user is admin
   - `isUser()` - Check if user is regular user
   - `requireRole()` - Require specific role (throws error if not met)
   - `requireAdmin()` - Require admin role

3. **Database** (Row Level Security)
   - Users can only see their own data
   - Admins can access all data
   - Roles cannot be self-modified

### Route Structure

#### User Routes (`/user`)
| Route | Description |
|-------|-------------|
| `/user` | Browse products |
| `/user/cart` | Shopping cart |
| `/user/cart/payment` | Checkout |
| `/user/orders` | Order history |

#### Admin Routes (`/admin`)
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with analytics |
| `/admin/products` | Product list |
| `/admin/products/add` | Add product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/orders` | Manage orders |
| `/admin/settings` | Store settings |

### Middleware Flow

```
User Request → Middleware → Check Authentication
                ↓
        Check User Role from DB
                ↓
    Route to /user or /admin based on role
```

### RLS Policies

#### Public Access
- ✅ Read active products & variants
- ✅ Read product images
- ✅ Read active coupons
- ✅ View storage bucket images

#### Authenticated Users
- ✅ Manage own cart
- ✅ View own orders
- ✅ Create orders

#### Admins Only
- ✅ Manage all products, variants, images
- ✅ Manage categories & coupons
- ✅ Upload/delete product images
- ✅ View all orders
- ✅ Update order status

---

## Storage Integration

### Configuration

- **Bucket Name**: `product-images`
- **Access**: Public read, Admin write
- **Max Size**: 5MB per file
- **Allowed Types**: JPEG, PNG, WebP
- **Path Pattern**: `{product-id}/{timestamp-random}.{ext}`

### Storage Client Setup

```typescript
// lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<{ path: string; url: string } | null> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${productId}/${fileName}`
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)
  
  return { path: filePath, url: publicUrl }
}

export async function deleteProductImage(path: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('product-images')
    .remove([path])
  
  return !error
}

export function getImageUrl(path: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path)
  
  return publicUrl
}
```

### Usage Examples

#### Upload Component

```typescript
"use client"
import { useState } from 'react'
import { uploadProductImage } from '@/lib/supabase/storage'

export function ProductImageUpload({ productId }: { productId: string }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    const result = await uploadProductImage(productId, file)
    
    if (result) {
      // Save to database
      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          storage_path: result.path,
          alt_text: 'Product image',
          is_primary: true
        })
    }
    setUploading(false)
  }

  return (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleUpload}
      disabled={uploading}
    />
  )
}
```

#### Fetch Products with Images

```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    id,
    name,
    description,
    base_price,
    images:product_images(
      id,
      storage_path,
      alt_text,
      is_primary,
      sort_order
    )
  `)
  .eq('is_active', true)
  .order('sort_order', { foreignTable: 'product_images' })
```

#### Display Image

```typescript
import { getImageUrl } from '@/lib/supabase/storage'
import Image from 'next/image'

export function ProductCard({ product }) {
  const imageUrl = product.images[0] 
    ? getImageUrl(product.images[0].storage_path)
    : '/placeholder.jpg'

  return (
    <Image src={imageUrl} alt={product.name} width={400} height={400} />
  )
}
```

---

## Implementation Status

### ✅ Completed

#### Core RBAC
- `middleware.ts` - Route protection and role-based redirects
- `lib/rbac.ts` - RBAC utility functions
- Database schema with RLS policies

#### User Routes (`/user`)
- `app/user/layout.tsx` - User dashboard layout
- `app/user/page.tsx` - Main dashboard (browse shirts)
- `app/user/cart/page.tsx` - Shopping cart
- `app/user/cart/payment/page.tsx` - Checkout
- `app/user/orders/page.tsx` - Order history

#### Admin Routes (`/admin`)
- `app/admin/layout.tsx` - Admin panel layout
- `app/admin/page.tsx` - Dashboard with analytics
- `app/admin/products/page.tsx` - Product management
- `app/admin/products/add/page.tsx` - Add product
- `app/admin/products/[id]/edit/page.tsx` - Edit product
- `app/admin/orders/page.tsx` - Order management
- `app/admin/settings/page.tsx` - Store settings

#### Authentication
- Role-based login redirect
- Auto profile creation on signup
- Role badge display
- Secure logout

### 🔜 Future Enhancements

- Product reviews & ratings
- Wishlist functionality
- Detailed inventory tracking
- Order status history with timeline
- Multiple shipping addresses
- Brand management
- Advanced analytics dashboard
- Email notifications
- Payment gateway integration (Stripe)

---

## Troubleshooting

### Common Issues

#### Profile not created automatically

Check if the trigger is active:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

If missing, re-run the migration script.

#### Manually create profile for existing user

```sql
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT id, 'user', NOW(), NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

#### Check existing profiles

```sql
SELECT p.id, u.email, p.role, p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id;
```

#### "Failed to fetch" when loading products

1. Verify Supabase environment variables in `.env.local`
2. Check migrations have been run in correct order

#### Cannot access admin routes

1. Ensure your user has `role = 'admin'` in profiles table
2. Run: `UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';`

#### Images not loading

1. Check storage bucket `product-images` exists and is public
2. Verify RLS policies allow public read access

#### Build errors about missing modules

```bash
# Delete cache and reinstall
Remove-Item -Recurse -Force node_modules, .next
npm install
```

### Reset Database

If you need to start fresh:

```sql
-- WARNING: Deletes all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run all migrations in order.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage |
| Authentication | Supabase Auth |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | Lucide React |
| Language | TypeScript |
| Fonts | Geist Sans |

---

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

---

**Last Updated**: November 26, 2025
