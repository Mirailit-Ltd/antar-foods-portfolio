import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readCatalog, storageMode } from "@/lib/storage";
import { AdminHeader } from "../../AdminHeader";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const catalog = await readCatalog();
  return (
    <>
      <AdminHeader mode={storageMode()} />
      <main className="admin-main">
        <p className="admin-back"><Link href="/admin">← All products</Link></p>
        <h1>New product</h1>
        <ProductForm categories={[...new Set(catalog.products.map((p) => p.category))]} />
      </main>
    </>
  );
}
