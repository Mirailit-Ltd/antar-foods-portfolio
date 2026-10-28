import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { readCatalog, storageMode } from "@/lib/storage";
import { AdminHeader } from "../../../AdminHeader";
import { ProductForm } from "../../ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <AdminHeader mode={storageMode()} />
      <main className="admin-main">
        <p className="admin-back"><Link href="/admin">← All products</Link></p>
        <h1>
          Edit {product.name}{" "}
          {product.published && <Link href={`/products/${product.slug}`} target="_blank" className="admin-viewlink">View live ↗</Link>}
        </h1>
        <ProductForm key={product.id} product={product} categories={[...new Set(catalog.products.map((p) => p.category))]} />
      </main>
    </>
  );
}
