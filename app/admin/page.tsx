import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readCatalog, storageMode } from "@/lib/storage";
import { AdminHeader } from "./AdminHeader";
import { ConfirmButton } from "./ConfirmButton";
import { deleteProduct, moveProduct, togglePublished } from "./actions";

export const metadata = { title: "Products" };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { saved } = await searchParams;
  const mode = storageMode();
  const products = (await readCatalog()).products.sort((a, b) => a.order - b.order);

  return (
    <>
      <AdminHeader mode={mode} />
      <main className="admin-main">
        {typeof saved === "string" && (
          <div className="admin-notice" role="status">
            <strong>{saved}.</strong>{" "}
            {mode === "github" ? "The site is rebuilding — changes go live in about 3–5 minutes." : "Reload the site to see the change."}
          </div>
        )}
        <div className="admin-toolbar">
          <h1>Products <span>{products.length}</span></h1>
          <Link href="/admin/products/new" className="abtn abtn--primary">+ Add product</Link>
        </div>

        {products.length === 0 ? (
          <p className="admin-empty">No products yet. Add your first one.</p>
        ) : (
          <ul className="admin-list">
            {products.map((p, i) => (
              <li key={p.id} className={p.published ? undefined : "is-draft"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/admin/media${p.images[0]}`} alt="" width={64} height={64} loading="lazy" />
                <div className="admin-list__info">
                  <Link href={`/admin/products/${p.id}/edit`} className="admin-list__name">{p.name}</Link>
                  <p>
                    {p.category} · /products/{p.slug}
                    {p.featured && <span className="admin-pill">Spotlight</span>}
                    {!p.published && <span className="admin-pill admin-pill--muted">Hidden</span>}
                  </p>
                </div>
                <div className="admin-list__actions">
                  <form action={moveProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="abtn abtn--icon" name="dir" value="up" disabled={i === 0} aria-label={`Move ${p.name} up`}>↑</button>
                    <button className="abtn abtn--icon" name="dir" value="down" disabled={i === products.length - 1} aria-label={`Move ${p.name} down`}>↓</button>
                  </form>
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="abtn abtn--ghost">{p.published ? "Hide" : "Publish"}</button>
                  </form>
                  <Link href={`/admin/products/${p.id}/edit`} className="abtn abtn--ghost">Edit</Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`Delete "${p.name}"? Its images will be removed too.`} className="abtn abtn--danger">Delete</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
