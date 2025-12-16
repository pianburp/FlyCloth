-- =============================================
-- Fix Function Search Path Security Warnings
-- Supabase Database Linter: function_search_path_mutable
-- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- =============================================

-- Fix handle_new_user function (from 001_schema.sql)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix handle_updated_at function (from 001_schema.sql)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_updated_at_column function (if exists in database)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $body$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $body$ LANGUAGE plpgsql SET search_path = '';
    $func$;
  END IF;
END $$;

-- Fix generate_order_number function (if exists in database)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_order_number' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.generate_order_number()
      RETURNS TEXT AS $body$
      DECLARE
        new_number TEXT;
        current_date_str TEXT;
        seq_num INTEGER;
      BEGIN
        current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
        SELECT COALESCE(MAX(SUBSTRING(order_number FROM 9)::INTEGER), 0) + 1
        INTO seq_num
        FROM public.orders
        WHERE order_number LIKE current_date_str || '%';
        new_number := current_date_str || LPAD(seq_num::TEXT, 4, '0');
        RETURN new_number;
      END;
      $body$ LANGUAGE plpgsql SET search_path = '';
    $func$;
  END IF;
END $$;

-- Fix set_order_number function (if exists in database)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'set_order_number' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.set_order_number()
      RETURNS TRIGGER AS $body$
      BEGIN
        IF NEW.order_number IS NULL THEN
          NEW.order_number := public.generate_order_number();
        END IF;
        RETURN NEW;
      END;
      $body$ LANGUAGE plpgsql SET search_path = '';
    $func$;
  END IF;
END $$;

-- Fix update_inventory_on_order function (if exists in database)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_inventory_on_order' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION public.update_inventory_on_order()
      RETURNS TRIGGER AS $body$
      BEGIN
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.variant_id;
        RETURN NEW;
      END;
      $body$ LANGUAGE plpgsql SET search_path = '';
    $func$;
  END IF;
END $$;
