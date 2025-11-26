<h1 align="center">BajuNow</h1>

<p align="center">
  Modern E-commerce Platform for Premium Shirts
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#database-setup"><strong>Database Setup</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a>
</p>
<br/>

## Features

### Customer Features
- 🛍️ **Product Catalog** - Browse premium shirts by categories (Casual, Formal, Polo, Graphic Tee, Tank Top)
- 🎨 **Product Variants** - Multiple sizes (XS-XXL) and colors with live stock tracking
- 🛒 **Shopping Cart** - Interactive cart with quantity controls and real-time totals
- 💳 **Checkout System** - Complete payment flow with coupon support and invoice preview
- 📦 **Order Management** - Track order history and status
- 🎫 **Coupon System** - Percentage, fixed amount, and free shipping discounts

### Admin Features
- 📊 **Admin Dashboard** - Centralized management interface
- ➕ **Product Management** - Add, edit, and manage product catalog
- 🖼️ **Image Upload** - Supabase Storage integration for product photos
- 📋 **Order Management** - View and process customer orders
- ⚙️ **Settings Panel** - Configure store settings and preferences

### Technical Features
- 🔐 **Authentication** - Email/password with role-based access control (Admin/User)
- 🛡️ **Row Level Security** - Supabase RLS policies for data protection
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and shadcn/ui
- 🌓 **Dark Mode** - System-aware theme switching
- 📱 **Mobile Responsive** - Optimized for all device sizes
- ⚡ **Server Components** - Next.js 15 App Router with React Server Components

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Storage**: Supabase Storage for product images
- **Authentication**: Supabase Auth with cookie-based sessions
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Language**: TypeScript
- **Fonts**: Geist Sans

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project ([create one here](https://database.new))
- Git installed

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pianburp/BajuNow.git
   cd BajuNow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from your [Supabase project's API settings](https://supabase.com/dashboard/project/_/settings/api)

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

BajuNow uses a streamlined PostgreSQL schema via Supabase. Follow these steps:

### 1. Run Migrations

Go to your Supabase Dashboard → SQL Editor and run these migrations in order:

```sql
-- 1. User profiles and RBAC (if not already exists)
001_create_profiles_rbac.sql

-- 2. Core e-commerce schema
002_create_ecommerce_schema_v2.sql

-- 3. Row Level Security policies
003_create_rls_policies_v2.sql

-- 4. Sample product data
004_insert_sample_data_v2.sql

-- 5. Storage bucket for images
005_create_storage_bucket.sql
```

### 2. Create Storage Bucket

Navigate to Supabase Dashboard → Storage and verify the `product-images` bucket exists with:
- **Public access**: Enabled
- **File size limit**: 5MB
- **Allowed types**: JPEG, PNG, WebP

### 3. Create Admin User

Run this SQL to create an admin account:

```sql
-- First, sign up a user via the UI or Auth, then run:
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

### Database Schema Overview

- **8 core tables**: categories, products, product_variants, product_images, coupons, cart_items, orders, order_items
- **Storage bucket**: product-images (5MB limit, public read)
- **Auto-generated**: Order numbers (BN{YYYYMMDD}{5-digit})
- **Inventory tracking**: Auto-decrement on orders

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for complete schema and setup documentation.

## Project Structure

```
BajuNow/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── forgot-password/
│   ├── admin/                  # Admin dashboard
│   │   ├── products/          # Product management
│   │   │   ├── add/           # Add new product
│   │   │   └── [id]/edit/     # Edit product
│   │   ├── orders/            # Order management
│   │   └── settings/          # Store settings
│   ├── user/                   # Customer area
│   │   ├── cart/              # Shopping cart
│   │   │   └── payment/       # Checkout page
│   │   └── orders/            # Order history
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── auth-button.tsx        # Auth dropdown menu
│   ├── cart-management.tsx    # Cart state management
│   ├── hero.tsx               # Hero section
│   └── features.tsx           # Features section
├── lib/
│   ├── supabase/              # Supabase client configs
│   │   ├── client.ts          # Client-side
│   │   ├── server.ts          # Server-side
│   │   └── proxy.ts           # Middleware
│   ├── rbac.ts                # Role-based access control
│   └── utils.ts               # Utility functions
├── supabase/
│   └── migrations/            # Database migrations
│       ├── 001_create_profiles_rbac.sql
│       ├── 002_create_ecommerce_schema_v2.sql
│       ├── 003_create_rls_policies_v2.sql
│       ├── 004_insert_sample_data_v2.sql
│       └── 005_create_storage_bucket.sql
└── public/
    ├── favicon.svg
    ├── site.webmanifest
    └── images/

```

## Key Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - User login
- `/auth/sign-up` - User registration

### User Routes (Authentication Required)
- `/user` - Browse products
- `/user/cart` - Shopping cart
- `/user/cart/payment` - Checkout
- `/user/orders` - Order history

### Admin Routes (Admin Role Required)
- `/admin` - Admin dashboard
- `/admin/products` - Product list
- `/admin/products/add` - Add product
- `/admin/products/[id]/edit` - Edit product
- `/admin/orders` - Manage orders
- `/admin/settings` - Store settings

## Deployment

### Deploy to Vercel

1. **Connect your repository**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

   Click the button above and import your GitHub repository

2. **Configure environment variables**

   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**

   Vercel will automatically build and deploy your application

### Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Project Settings → API](https://supabase.com/dashboard/project/_/settings/api) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | [Project Settings → API](https://supabase.com/dashboard/project/_/settings/api) |

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Accessing Admin Panel

1. Sign up for an account at `/auth/sign-up`
2. Get your user ID from Supabase Dashboard → Authentication → Users
3. Run this SQL in SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
   ```
4. Refresh the page and access `/admin`

### Adding Products

1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill in product details (name, SKU, price, description)
4. Add variants (sizes, colors, stock levels)
5. Upload product images to Supabase Storage
6. Submit to create

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch" when loading products
- **Solution**: Verify Supabase environment variables are correct in `.env.local`
- Check that migrations have been run in correct order

**Issue**: Cannot access admin routes
- **Solution**: Ensure your user has `role = 'admin'` in profiles table
- Run: `UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';`

**Issue**: Images not loading
- **Solution**: Check that storage bucket `product-images` exists and is public
- Verify RLS policies allow public read access

**Issue**: Build errors about missing modules
- **Solution**: Delete `node_modules` and `.next`, then run `npm install` again

### Database Issues

**Reset migrations**: If you need to start fresh with the database:
```sql
-- Drop all tables (WARNING: deletes all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run all migrations in order.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for complete technical documentation
- **Issues**: Open an issue on GitHub
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

Built with ❤️ using Next.js 15 and Supabase
