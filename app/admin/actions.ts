"use server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { productSchema, type Catalog, type Product } from "@/lib/product-schema";
import { SESSION_COOKIE, SESSION_TTL_MS, createSessionToken, passwordMatches } from "@/lib/session";
import { storageMode, updateCatalog, type Upload } from "@/lib/storage";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

/* ---------- Session ---------- */

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD is not configured on the server." };
  if (!(await passwordMatches(String(formData.get("password") ?? "")))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "Wrong password." };
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Products ---------- */

const MAX_UPLOAD = 3 * 1024 * 1024;
const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif" };

/** Every image path a product points at (gallery, pack sizes, recipes, hacks). */
function imagesOf(p: Product) {
  return [...p.images, ...p.variants.map((v) => v.image), ...p.recipes.map((r) => r.image), ...p.hacks.map((h) => h.image)].filter(
    (x): x is string => !!x
  );
}

/** Uploaded files that no product references any more — only ever under /products/, never the design images. */
function orphanedImages(before: Catalog, after: Catalog) {
  const used = new Set(after.products.flatMap(imagesOf));
  return [...new Set(before.products.flatMap(imagesOf))].filter((src) => src.startsWith("/products/") && !used.has(src)).map((src) => `public${src}`);
}

const savedRedirect = (msg: string) => redirect(`/admin?saved=${encodeURIComponent(msg)}`);

export async function saveProduct(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(String(formData.get("product")));
  } catch {
    return { error: "Could not read the form." };
  }
  const isNew = !input.id;
  const id = isNew ? randomUUID() : String(input.id);
  const slug = String(input.slug ?? "");

  // New images arrive as files named "upload:<ref>"; the product JSON points at them as "new:<ref>"
  const uploads: Upload[] = [];
  const paths = new Map<string, string>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("upload:") || !(value instanceof File)) continue;
    const ext = EXT[value.type];
    if (!ext) return { error: `${value.name}: only WebP, JPEG, PNG or AVIF images are allowed.` };
    if (value.size > MAX_UPLOAD) return { error: `${value.name} is larger than 3MB.` };
    const name = `${slug || "product"}-${randomUUID().slice(0, 8)}.${ext}`;
    uploads.push({ path: `public/products/${name}`, data: Buffer.from(await value.arrayBuffer()) });
    paths.set(`new:${key.slice("upload:".length)}`, `/products/${name}`);
  }
  const resolved = JSON.parse(JSON.stringify(input), (_k, v) => (typeof v === "string" && paths.has(v) ? paths.get(v) : v));

  const parsed = productSchema.safeParse({ ...resolved, id });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const product = parsed.data;

  try {
    await updateCatalog(`${isNew ? "Add" : "Update"} product: ${product.name}`, (catalog) => {
      if (catalog.products.some((p) => p.slug === product.slug && p.id !== product.id)) throw new UserError(`Another product already uses the URL "${product.slug}".`);
      const exists = catalog.products.some((p) => p.id === product.id);
      if (!isNew && !exists) throw new UserError("This product no longer exists.");
      if (isNew) product.order = Math.max(0, ...catalog.products.map((p) => p.order)) + 1;
      // Only one spotlight product at a time
      const others = catalog.products.filter((p) => p.id !== product.id).map((p) => (product.featured ? { ...p, featured: false } : p));
      const next = { products: exists ? catalog.products.map((p) => (p.id === product.id ? product : others.find((o) => o.id === p.id)!)) : [...others, product] };
      return { catalog: next, uploads, deletes: orphanedImages(catalog, next) };
    });
  } catch (e) {
    return { error: e instanceof UserError ? e.message : `Save failed: ${(e as Error).message}` };
  }
  savedRedirect(`${product.name} saved`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  let name = "";
  await updateCatalog("Delete product", (catalog) => {
    name = catalog.products.find((p) => p.id === id)?.name ?? "";
    const next = { products: catalog.products.filter((p) => p.id !== id) };
    return { catalog: next, deletes: orphanedImages(catalog, next) };
  });
  savedRedirect(`${name || "Product"} deleted`);
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await updateCatalog("Toggle product visibility", (catalog) => ({
    catalog: { products: catalog.products.map((p) => (p.id === id ? { ...p, published: !p.published } : p)) },
  }));
  savedRedirect("Visibility updated");
}

export async function moveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  await updateCatalog("Reorder products", (catalog) => {
    const list = [...catalog.products].sort((a, b) => a.order - b.order);
    const i = list.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i >= 0 && j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
    return { catalog: { products: list.map((p, k) => ({ ...p, order: k + 1 })) } };
  });
  savedRedirect("Order updated");
}

export async function getStorageMode() {
  await requireAdmin();
  return storageMode();
}

class UserError extends Error {}
