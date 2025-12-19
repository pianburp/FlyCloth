# FlyCloth Database Migrations

## Migration Files

| File | Purpose |
|------|---------|
| `001_schema.sql` | Tables, indexes, triggers, and helper functions |
| `002_rls_policies.sql` | Row Level Security policies |
| `003_functions.sql` | RPC functions (stock management) |
| `004_storage.sql` | Storage bucket and policies |
| `999_cleanup_fresh_start.sql` | Utility: Clear all data for fresh start |
| `migrate_existing_db.sql` | Utility: Migrate from older schema versions |

## Fresh Installation

Run in order:
```sql
-- 1. Create schema
\i 001_schema.sql

-- 2. Add RLS policies
\i 002_rls_policies.sql

-- 3. Add RPC functions
\i 003_functions.sql

-- 4. Configure storage
\i 004_storage.sql
```

## Existing Database

If migrating from an older version:
```sql
\i migrate_existing_db.sql
```

## Architecture Notes

- **Profiles table** is the central user table (FKs reference `profiles`, not `auth.users`)
- **Helper functions** (`is_admin()`, `get_user_role()`) use `SET search_path` for security
- **Stock functions** use `FOR UPDATE` row locking to prevent race conditions
- **RLS policies** use subquery pattern `(SELECT auth.uid())` for performance
