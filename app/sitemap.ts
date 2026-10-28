import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Content only changes through a rebuild, so the build time is the last-modified date
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1, images: [`${SITE_URL}/images/hero-banner.webp`] },
    { url: `${SITE_URL}/products`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    ...getProducts().map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: p.images.map((src) => `${SITE_URL}${src}`),
    })),
  ];
}
