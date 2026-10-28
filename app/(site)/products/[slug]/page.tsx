import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contact } from "@/components/Contact";
import { JsonLd } from "@/components/JsonLd";
import { PrepIcon } from "@/components/PrepIcon";
import { ProductCard } from "@/components/ProductCard";
import {
  PackSizes,
  ProductGallery,
  ProductMediaProvider,
} from "@/components/ProductGallery";
import { Icon } from "@/components/Sprite";
import { RevealMotion } from "@/components/motion/RevealMotion";
import { paragraphs } from "@/lib/format";
import { PREP_METHODS, type Product } from "@/lib/product-schema";
import {
  categorySlug,
  getProduct,
  getProducts,
  getSimilarProducts,
} from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  // A custom SEO title is used as-is; the default gets " | Antar Foods" appended
  return pageMetadata({
    title:
      product.seo.title ??
      `${product.name}${product.nameJp ? ` · ${product.nameJp}` : ""}`,
    absoluteTitle: !!product.seo.title,
    description: product.seo.description ?? product.shortDescription,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const similar = getSimilarProducts(product);
  const specs = [
    { label: "Category", value: product.category },
    {
      label: "Pack size",
      value: product.variants.map((v) => v.label).join(" / "),
    },
    { label: "Shelf life", value: product.shelfLife },
    { label: "Storage", value: product.storage },
    { label: "Origin", value: "Bangladesh" },
    { label: "Halal", value: "Certified" },
  ].filter((s) => s.value);

  return (
    <>
      <JsonLd data={structuredData(product)} />

      <section
        className="phero"
        style={
          {
            "--c1": product.theme.c1,
            "--c2": product.theme.c2,
          } as React.CSSProperties
        }
      >
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href={`/products#${categorySlug(product.category)}`}>
                  {product.category}
                </Link>
              </li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <ProductMediaProvider
            product={{
              name: product.name,
              images: product.images,
              variants: product.variants,
            }}
          >
            <div className="phero__grid">
              <ProductGallery />

              <div className="phero__info">
                <p className="eyebrow">
                  <span className="dot"></span> {product.category}
                </p>
                <h1 className="phero__title">{product.name}</h1>
                {product.badge && (
                  <em className="badge-hot phero__badge">{product.badge}</em>
                )}
                {(product.nameJp || product.nameBn) && (
                  <p className="phero__alt">
                    {product.nameJp && <span lang="ja">{product.nameJp}</span>}
                    {product.nameJp && product.nameBn && " · "}
                    {product.nameBn && <span lang="bn">{product.nameBn}</span>}
                  </p>
                )}
                <div className="phero__desc">
                  {paragraphs(product.description).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {product.tags.length > 0 && (
                  <ul className="tags">
                    {product.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <PackSizes />
                <div className="phero__actions">
                  <a
                    href={
                      product.whereToBuy.length ? "#where-to-buy" : "#contact"
                    }
                    className="btn btn--red magnetic"
                  >
                    <span>Where to buy</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                  <Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="btn btn--ghost magnetic">
                    <span>Wholesale enquiry</span>
                  </Link>
                </div>
              </div>
            </div>
          </ProductMediaProvider>
        </div>
        <Icon name={product.theme.icon} className="phero__fx" />
      </section>

      {/* {product.preparation.length > 0 && (
        <section className="psec" aria-labelledby="prep-title">
          <div className="container">
            <h2 id="prep-title" className="psec__title" data-reveal>Preparation methods</h2>
            <div className="prep" data-reveal="children">
              {product.preparation.map((m) => (
                <div className="prep__item" key={m.method}>
                  <div className="qcard__icon"><PrepIcon method={m.method} /></div>
                  <h3>{PREP_METHODS[m.method]}</h3>
                  {m.time && <p className="prep__time">{m.time}</p>}
                  {m.steps && <p>{m.steps}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )} */}

      <section className="psec psec--blush" aria-labelledby="details-title">
        <div className="container">
          <h2 id="details-title" className="psec__title" data-reveal>
            Product details
          </h2>

          <dl className="specs" data-reveal="children">
            {specs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          {product.benefits.length > 0 && (
            <div className="pcardbox" data-reveal>
              <h3>Why you&apos;ll love it</h3>
              <ul className="ticks">
                {product.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {product.recipes.length > 0 && (
        <section className="psec" aria-labelledby="recipes-title">
          <div className="container">
            <p className="eyebrow" data-reveal>
              <span className="dot"></span> Cook with Antar
            </p>
            <h2 id="recipes-title" className="psec__title" data-reveal>
              Trending recipes
            </h2>
            <div className="recipes" data-reveal="children">
              {product.recipes.map((r) => (
                <article className="recipe" key={r.title}>
                  {r.image && (
                    <div className="recipe__img">
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        sizes="(max-width: 760px) 92vw, 400px"
                      />
                    </div>
                  )}
                  <div className="recipe__body">
                    <h3>{r.title}</h3>
                    {(r.time || r.servings) && (
                      <p className="recipe__meta">
                        {r.time && <span>⏱ {r.time}</span>}
                        {r.servings && <span>🍽 Serves {r.servings}</span>}
                      </p>
                    )}
                    {r.summary && <p>{r.summary}</p>}
                    {(r.ingredients.length > 0 || r.steps.length > 0) && (
                      <details className="recipe__more">
                        <summary>View recipe</summary>
                        {r.ingredients.length > 0 && (
                          <>
                            <h4>Ingredients</h4>
                            <ul>
                              {r.ingredients.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {r.steps.length > 0 && (
                          <>
                            <h4>Method</h4>
                            <ol>
                              {r.steps.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ol>
                          </>
                        )}
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.hacks.length > 0 && (
        <section className="psec psec--blush" aria-labelledby="hacks-title">
          <div className="container">
            <h2 id="hacks-title" className="psec__title" data-reveal>
              Cooking hacks
            </h2>
            <div className="hacks" data-reveal="children">
              {product.hacks.map((h) => (
                <article className="hack" key={h.title}>
                  {h.image && (
                    <div className="hack__img">
                      <Image
                        src={h.image}
                        alt={h.title}
                        fill
                        sizes="(max-width: 760px) 92vw, 300px"
                      />
                    </div>
                  )}
                  <div>
                    <h3>{h.title}</h3>
                    <p>{h.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {product.whereToBuy.length > 0 && (
        <section
          className="psec psec--tight"
          id="where-to-buy"
          aria-labelledby="buy-title"
        >
          <div className="container">
            <div className="buy" data-reveal>
              <div className="buy__text">
                <p className="eyebrow eyebrow--light">
                  <span className="dot"></span> Where to buy
                </p>
                <h2 id="buy-title">Find {product.name} near you</h2>
                <p>Available at these stores and online shops across Japan.</p>
              </div>
              <ul className="buy__stores">
                {product.whereToBuy.map((s) => (
                  <li key={s.name}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener">
                        <span>{s.name}</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </a>
                    ) : (
                      <span className="buy__store">{s.name}</span>
                    )}
                  </li>
                ))}
              </ul>
              <Icon name={product.theme.icon} className="buy__fx" />
            </div>
          </div>
        </section>
      )}

      {product.faqs.length > 0 && (
        <section className="psec psec--blush" aria-labelledby="faq-title">
          <div className="container">
            <h2 id="faq-title" className="psec__title" data-reveal>
              Frequently asked questions
            </h2>
            <div className="faqs" data-reveal="children">
              {product.faqs.map((f) => (
                <details key={f.question} className="faq">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="psec psec--dark" aria-labelledby="similar-title">
          <div className="container">
            <p className="eyebrow eyebrow--light" data-reveal>
              <span className="dot"></span> Keep exploring
            </p>
            <h2 id="similar-title" className="psec__title" data-reveal>
              Similar products
            </h2>
            <div className="pgrid" data-reveal="children">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Contact />
      <RevealMotion />
    </>
  );
}

/** "1 hr 10 mins" -> "PT1H10M" for schema.org durations. */
function isoDuration(s?: string) {
  if (!s) return undefined;
  const h = s.match(/(\d+)\s*(h|hr|hour)/i)?.[1];
  const m = s.match(/(\d+)\s*(m|min)/i)?.[1];
  return h || m ? `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` : undefined;
}

function structuredData(product: Product) {
  const url = `${SITE_URL}/products/${product.slug}`;
  const abs = (src: string) => `${SITE_URL}${src}`;
  const data: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(product.nameJp ? { alternateName: product.nameJp } : {}),
      description: product.shortDescription,
      image: product.images.map(abs),
      url,
      sku: product.slug,
      category: product.category,
      brand: { "@type": "Brand", name: site.shortName },
      manufacturer: { "@type": "Organization", name: site.name },
      countryOfOrigin: "BD",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: `${SITE_URL}/products`,
        },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];
  if (product.faqs.length) {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: product.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  for (const r of product.recipes.filter((r) => r.steps.length)) {
    data.push({
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: r.title,
      ...(r.summary ? { description: r.summary } : {}),
      image: r.image ? [abs(r.image)] : product.images.slice(0, 1).map(abs),
      author: { "@type": "Organization", name: site.name },
      ...(isoDuration(r.time) ? { totalTime: isoDuration(r.time) } : {}),
      ...(r.servings ? { recipeYield: r.servings } : {}),
      recipeIngredient: r.ingredients,
      recipeInstructions: r.steps.map((text) => ({
        "@type": "HowToStep",
        text,
      })),
    });
  }
  return data;
}
