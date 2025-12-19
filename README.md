<h1 align="center">FlyCloth</h1>

<p align="center">
  Premium E-commerce Platform for Luxury Apparel
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

### 💎 Luxury Customer Experience
- **Immersive UI** - Glassmorphism design, smooth animations (Framer Motion), and premium aesthetics.
- **Bespoke Services** - Custom printing service request integration.
- **Visual Product Discovery** - Rich media support (Video/Image) for product showcases.
- **Smart Cart** - Real-time stock checking and seamless checkout flow.
- **Responsive Design** - Optimized for mobile and desktop with a focus on visual hierarchy.

### �️ Core E-commerce
- **Product Catalog** - Filtering by Price, Fit (Slim, Regular, Oversize), and Sorting.
- **Variant Management** - Complex SKU management for Sizes and Fits.
- **Secure Checkout** - Integrated Stripe payment flow with invoice generation.
- **Order Tracking** - Real-time status updates for customers.

### 🛠️ Admin Dashboard
- **Analytics Hub** - Visual charts (Recharts) for sales performance and trends.
- **Inventory Control** - Stock management with low-stock alerts.
- **Order Processing** - Workflow for managing order status (Pending -> Shipped).
- **Customer Insights** - View customer profiles and purchase history.

### 🔐 Technical Foundation
- **Role-Based Access** - Strictly separated User/Admin contexts via Supabase Auth.
- **Performance** - Server-side rendering (Next.js 15) with intelligent caching.
- **Security** - Comprehensive Row Level Security (RLS) policies.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: Supabase Auth (SSR w/ Cookies)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Payments**: [Stripe](https://stripe.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git installed

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pianburp/FlyCloth.git
   cd FlyCloth
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Setup

FlyCloth uses a robust PostgreSQL schema. Run migrations in the Supabase SQL Editor:

```sql
-- Run these in order from supabase/migrations/
001_create_profiles_rbac.sql
002_create_ecommerce_schema_v2.sql
...
```

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for full schema details.

## Project Structure

```
FlyCloth/
├── app/
│   ├── (auth)/                 # Authentication routes (Login/Register)
│   ├── admin/                  # Admin Dashboard (Protected)
│   │   ├── analytics/         # Sales charts
│   │   ├── inventory/         # Stock management
│   │   ├── orders/            # Order processing
│   │   └── products/          # Catalog management
│   ├── user/                   # Customer Dashboard (Protected)
│   │   ├── cart/              # Shopping cart & Checkout
│   │   ├── settings/          # Profile management
│   │   └── page.tsx           # User Dashboard Client
│   ├── layout.tsx             # Root layout with Auth context
│   └── page.tsx               # Public Landing Page
├── components/
│   ├── auth/                  # Auth forms & buttons
│   ├── cart/                  # Cart logic & UI
│   ├── layout/                # Sidebar, headers, wrappers
│   ├── product/               # Product cards & details
│   ├── ui/                    # shadcn/ui primitives
│   └── shared/                # Reusable components
├── lib/
│   ├── supabase/              # Supabase Client/Server utilities
│   ├── auth-context.tsx       # Global Auth State
│   └── utils.ts               # Helpers
├── supabase/
│   └── migrations/            # SQL Migrations
└── public/
    └── video/                 # Hero assets
```

## Deployment

Deploy easily to Vercel:

1. Import your repo to Vercel.
2. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, etc).
3. Deploy!

## License

This project is licensed under the MIT License.

---

Built with ❤️ by FlyCloth Team
