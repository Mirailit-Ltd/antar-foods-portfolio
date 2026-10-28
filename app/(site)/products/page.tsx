import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { RevealMotion } from "@/components/motion/RevealMotion";
import { categorySlug, getCategories, getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Bangladeshi Snacks, Frozen Samosas & Sweets",
  description: "The full Antar lineup — puffed rice, frozen samosas, singara, spring rolls, paratha and premium khejur patali gur. Halal certified, made in Bangladesh for Japan.",
  path: "/products",
});

export default function ProductsPage() {
  const products = getProducts();
  const categories = getCategories();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/products/${p.slug}`, name: p.name })),
        }}
      />
      <section className="plist">
        <div className="container">
          <p className="eyebrow eyebrow--light" data-reveal>
            <span className="dot"></span> The lineup · <span lang="ja">全ラインナップ</span>
          </p>
          <h1 className="plist__title" data-reveal>
            Our products
          </h1>
          <p className="plist__lead" data-reveal>
            Authentic Bangladeshi snacks, breads and sweets — halal certified and made without harmful preservatives.
          </p>
          {categories.length > 1 && (
            <nav className="plist__cats" aria-label="Categories" data-reveal>
              {categories.map((c) => (
                <a key={c} href={`#${categorySlug(c)}`}>
                  {c}
                </a>
              ))}
            </nav>
          )}

          {categories.map((c) => (
            <section key={c} id={categorySlug(c)} className="plist__group" aria-labelledby={`${categorySlug(c)}-title`}>
              <h2 id={`${categorySlug(c)}-title`} className="plist__cat" data-reveal>
                {c}
              </h2>
              <div className="pgrid" data-reveal="children">
                {products
                  .filter((p) => p.category === c)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <RevealMotion />
    </>
  );
}
