import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export interface StoreSettings {
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
  // EasyParcel pickup address
  pickup_name?: string | null;
  pickup_company?: string | null;
  pickup_contact?: string | null;
  pickup_addr1?: string | null;
  pickup_addr2?: string | null;
  pickup_city?: string | null;
  pickup_state?: string | null;
  pickup_postcode?: string | null;
}

// Default settings (used as fallback)
const DEFAULT_SETTINGS: StoreSettings = {
  shipping_fee: 9.99,
  free_shipping_threshold: 50.0,
  tax_rate: 0.08,
};

/**
 * Create a simple Supabase client for cached queries.
 * Does NOT use cookies, so it can be used inside unstable_cache().
 */
function createCacheClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

/**
 * Fetch store settings from database (cached for 60 seconds)
 */
export const getStoreSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const supabase = createCacheClient();

    const { data, error } = await supabase
      .from("store_settings")
      .select("shipping_fee, free_shipping_threshold, tax_rate")
      .eq("id", "default")
      .single();

    if (error || !data) {
      console.error("Error fetching store settings:", error);
      return DEFAULT_SETTINGS;
    }

    return {
      shipping_fee: Number(data.shipping_fee),
      free_shipping_threshold: Number(data.free_shipping_threshold),
      tax_rate: Number(data.tax_rate),
    };
  },
  ["store-settings"],
  { revalidate: 60, tags: ["store-settings"] }
);

/**
 * Fetch store settings without caching (for admin forms)
 */
export async function getStoreSettingsUncached(): Promise<StoreSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error || !data) {
    console.error("Error fetching store settings:", error);
    return DEFAULT_SETTINGS;
  }

  return {
    shipping_fee: Number(data.shipping_fee),
    free_shipping_threshold: Number(data.free_shipping_threshold),
    tax_rate: Number(data.tax_rate),
    pickup_name: data.pickup_name,
    pickup_company: data.pickup_company,
    pickup_contact: data.pickup_contact,
    pickup_addr1: data.pickup_addr1,
    pickup_addr2: data.pickup_addr2,
    pickup_city: data.pickup_city,
    pickup_state: data.pickup_state,
    pickup_postcode: data.pickup_postcode,
  };
}
