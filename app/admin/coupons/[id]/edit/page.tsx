import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CouponForm from "../../coupon-form";

export const dynamic = 'force-dynamic';

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const supabase = await createClient();
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !coupon) {
    console.error("Error fetching coupon:", error);
    return <div>Coupon not found</div>;
  }

  return <CouponForm initialData={coupon} isEditing={true} />;
}
