import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import AddProductClient from "./add-product-client";

export const dynamic = 'force-dynamic';

export default async function AddProductPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return <AddProductClient />;
}
