import "server-only";
import raw from "@/public/data/products.json";
import { catalogSchema, type Product } from "./product-schema";

// Bundled at build time: the public site only changes when the JSON changes and the site rebuilds.
// Parsing here also fails the build if the JSON is ever invalid.
const catalog = catalogSchema.parse(raw);

const byOrder = (a: Product, b: Product) => a.order - b.order || a.name.localeCompare(b.name);

export function getProducts() {
  return catalog.products.filter((p) => p.published).sort(byOrder);
}

export function getProduct(slug: string) {
  return getProducts().find((p) => p.slug === slug);
}

export function getFeaturedProduct() {
  const all = getProducts();
  return all.find((p) => p.featured) ?? all[0];
}

export function getCategories() {
  return [...new Set(getProducts().map((p) => p.category))];
}

export function getSimilarProducts(product: Product, limit = 3) {
  const others = getProducts().filter((p) => p.id !== product.id);
  const same = others.filter((p) => p.category === product.category);
  return [...same, ...others.filter((p) => p.category !== product.category)].slice(0, limit);
}

export function categorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
