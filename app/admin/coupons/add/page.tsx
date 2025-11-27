import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import CouponForm from "../coupon-form";

export const dynamic = 'force-dynamic';

export default async function AddCouponPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return <CouponForm />;
}
