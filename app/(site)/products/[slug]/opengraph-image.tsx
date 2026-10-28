import { ImageResponse } from "next/og";
import { OG_SIZE, pngFromPublic } from "@/lib/og";
import { getProduct, getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const product = getProduct((await params).slug);
  return [{ id: "card", size, contentType, alt: product ? `Antar ${product.name} — ${product.shortDescription}` : site.name }];
}

/** Share card for a product: its pack shot on the product's card colours, with name and short description. */
export default async function Image({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const product = getProduct((await params).slug)!;
  const [logo, shot] = await Promise.all([pngFromPublic("images/antar-logo.webp", 150, 95), pngFromPublic(product.images[0].slice(1), 470, 470)]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 56, padding: "0 64px", background: `linear-gradient(160deg, ${product.theme.c1}, ${product.theme.c2})`, fontFamily: "sans-serif" }}>
        <div style={{ width: 500, height: 500, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 36, background: "#fff", boxShadow: "0 40px 60px rgba(60,5,5,.3)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.src} width={shot.width} height={shot.height} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#D7261E" }}>{product.category}</span>
            {product.badge && <span style={{ padding: "4px 14px", borderRadius: 999, background: "#D7261E", color: "#fff", fontSize: 20, fontWeight: 700 }}>{product.badge}</span>}
          </div>
          <div style={{ marginTop: 16, fontSize: product.name.length > 22 ? 58 : 72, fontWeight: 800, lineHeight: 1, letterSpacing: -2, color: "#2A1311" }}>{product.name}</div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: "#6B4B47", display: "flex" }}>
            {product.shortDescription.length > 110 ? `${product.shortDescription.slice(0, 107)}…` : product.shortDescription}
          </div>
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} width={logo.width} height={logo.height} alt="" />
            <span style={{ fontSize: 22, fontWeight: 700, color: "#2A1311" }}>Halal · Made in Bangladesh</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
