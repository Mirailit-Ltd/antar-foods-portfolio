import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Loader } from "@/components/Loader";
import { Contact } from "@/components/Contact";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Sprite";
import { HomeMotion } from "@/components/motion/HomeMotion";
import { numberWord, paragraphs, parseQuantity } from "@/lib/format";
import { getFeaturedProduct, getProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${site.name} — ${site.tagline}`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

export default function HomePage() {
  const products = getProducts();
  const featured = getFeaturedProduct();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: SITE_URL,
            logo: `${SITE_URL}${site.logo}`,
            email: site.email,
            parentOrganization: {
              "@type": "Organization",
              name: site.distributor.name,
              url: site.distributor.url,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: SITE_URL,
          },
        ]}
      />
      <noscript>
        <style>{`.loader{display:none}.reveal-words{opacity:1}`}</style>
      </noscript>
      <Loader />

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero__blob" aria-hidden="true">
          <svg viewBox="0 0 600 600">
            <path
              id="blobPath"
              d="M440 90c70 50 120 140 110 230s-80 180-180 210-210-10-260-90S60 240 110 160 370 40 440 90z"
            />
          </svg>
        </div>

        <div className="hero__float" aria-hidden="true">
          <svg className="fx fx--chili" data-depth="0.6">
            <use href="#i-chili" />
          </svg>
          <svg className="fx fx--samosa" data-depth="1.2">
            <use href="#i-samosa" />
          </svg>
          <svg className="fx fx--leaf" data-depth="0.4">
            <use href="#i-leaf" />
          </svg>
          <svg className="fx fx--sakura" data-depth="0.9">
            <use href="#i-sakura" />
          </svg>
          <svg className="fx fx--grain1" data-depth="1.6">
            <use href="#i-grain" />
          </svg>
          <svg className="fx fx--grain2" data-depth="1.1">
            <use href="#i-grain" />
          </svg>
          <svg className="fx fx--grain3" data-depth="0.7">
            <use href="#i-grain" />
          </svg>
          <svg className="fx fx--wheat" data-depth="0.5">
            <use href="#i-wheat" />
          </svg>
          <svg className="fx fx--gur" data-depth="1.3">
            <use href="#i-gur" />
          </svg>
        </div>

        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">
            <span className="dot"></span> From Bangladesh to Japan ·{" "}
            <span lang="ja">バングラデシュから日本へ</span>
          </p>
          <h1 className="hero__title">
            <span className="line">
              <span className="word">Meet</span>{" "}
              <span className="word word--red">Antar.</span>
            </span>
            <span className="line">
              <span className="word">Taste</span>{" "}
              <span className="word">something</span>
            </span>
            <span className="line">
              <span className="word word--script">new</span>
              <svg
                className="hero__swash"
                viewBox="0 0 300 40"
                aria-hidden="true"
              >
                <path d="M5 30C70 8 170 4 295 18" />
              </svg>
            </span>
          </h1>
          <p className="hero__lead">
            Discover fresh flavours, exciting bites and new favourites — crispy
            snacks, golden samosas and heritage sweets, made the way home
            tastes.
          </p>
          <div className="hero__actions">
            <Link href="/#products" className="btn btn--red magnetic">
              <span>Explore the lineup</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="/#story" className="btn btn--ghost magnetic">
              <span>Our story</span>
            </Link>
          </div>
        </div>

        <div className="hero__stage" id="heroStage">
          <div className="hero__ring">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path
                  id="ringPath"
                  d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0"
                />
              </defs>
              <text>
                <textPath href="#ringPath">
                  NO HARMFUL PRESERVATIVES ✦ HALAL ✦ EXPORT QUALITY ✦{" "}
                </textPath>
              </text>
            </svg>
            <Icon name="samosa" className="hero__ring-core" />
          </div>
          <figure className="pack pack--bag" data-depth="0.8">
            <Image
              src="/images/hero-puffed-rice.png"
              alt="Antar Puffed Rice 400g bag"
              fill
              sizes="(max-width: 900px) 90vw, 620px"
              priority
            />
          </figure>
          <figure className="pack pack--jar" data-depth="1.4">
            <Image
              src="/images/hero-khejur-gur.png"
              alt="Antar Premium Khejur Patali Gur jar"
              fill
              sizes="(max-width: 900px) 60vw, 420px"
              priority
            />
          </figure>
          <figure className="pack pack--paratha" data-depth="1.9">
            <Image
              src="/images/hero-plain-paratha.png"
              alt="Antar Plain Paratha pack"
              fill
              sizes="(max-width: 900px) 50vw, 320px"
              priority
            />
          </figure>
          <div className="hero__sticker" data-depth="2.2">
            <Icon name="burst" />
            <span>
              100%
              <br />
              Halal
            </span>
          </div>
        </div>

        <Link href="/#story" className="hero__scroll" aria-label="Scroll down">
          <span></span>
        </Link>
      </section>

      {/* MARQUEE */}
      <section className="marquee" aria-label="Product names">
        <div className="marquee__track">
          <div className="marquee__group">
            {products.map((p) => (
              <Fragment key={p.id}>
                <span>{p.name}</span>
                <Icon name={p.theme.icon} />
              </Fragment>
            ))}
          </div>
        </div>
        <div className="marquee__track marquee__track--alt">
          <div className="marquee__group" lang="ja">
            {products
              .filter((p) => p.nameJp)
              .map((p) => (
                <Fragment key={p.id}>
                  <span>{p.nameJp}</span>
                  <span className="sep">✦</span>
                </Fragment>
              ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="story" id="story">
        <div className="container">
          <p className="eyebrow">
            <span className="dot"></span> The Antar story
          </p>
          <h2 className="story__text reveal-words">
            From the golden paddy fields of <em>Bangladesh</em> to dinner tables
            across <em>Japan</em> — Antar packs the warm, honest flavours of{" "}
            <em>home</em> into every crunch, every fold and every bite.
          </h2>

          <div className="story__grid">
            <div className="story__card story__card--img">
              <Image
                src="/images/hero-banner.webp"
                alt="Antar products on a wooden table in a Japanese room"
                width={2000}
                height={763}
                sizes="(max-width: 900px) 100vw, 780px"
              />
            </div>
            <div className="story__stats">
              <div className="stat">
                <strong>
                  <span className="count" data-to={products.length}>
                    0
                  </span>
                  +
                </strong>
                <span>Signature products</span>
              </div>
              <div className="stat">
                <strong>
                  <span className="count" data-to="100">
                    0
                  </span>
                  %
                </strong>
                <span>Halal certified</span>
              </div>
              <div className="stat">
                <strong>
                  <span className="count" data-to="0">
                    0
                  </span>
                </strong>
                <span>Harmful preservatives</span>
              </div>
              <div className="stat">
                <strong>
                  <span className="count" data-to="2">
                    0
                  </span>
                </strong>
                <span>Countries, one taste</span>
              </div>
            </div>
          </div>
        </div>
        <Icon name="sakura" className="story__fx story__fx--1" />
        <Icon name="leaf" className="story__fx story__fx--2" />
      </section>

      {/* PRODUCTS (horizontal) — GSAP wraps the pinned section in a pin-spacer, so React needs a parent it owns */}
      <div className="products-pin-root">
        <section className="products" id="products">
          <div className="products__head container">
            <div>
              <p className="eyebrow eyebrow--light">
                <span className="dot"></span> The lineup
              </p>
              <h2 className="products__title">
                {numberWord(products.length)}{" "}
                {products.length === 1 ? "way" : "ways"}
                <br />
                to fall in love.
              </h2>
            </div>
            <p className="products__hint">
              Scroll to explore{" "}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </p>
          </div>

          <div className="products__pin">
            <div className="products__track" id="productsTrack">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
              <div className="pcard pcard--end">
                <p>
                  More delicious things
                  <br />
                  are cooking.
                </p>
                <Link href="/products" className="btn btn--gold magnetic">
                  <span>See all products</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="products__progress">
            <span id="productsProgress"></span>
          </div>
        </section>
      </div>

      {/* SPOTLIGHT */}
      {featured && (
        <section className="spotlight" id="spotlight">
          <div className="container spotlight__grid">
            <div className="spotlight__visual">
              <div className="spotlight__disc"></div>
              <div className="spotlight__pack">
                <Image
                  src={featured.images[0] ?? featured.images[1]}
                  alt={`Antar ${featured.name} front of pack`}
                  fill
                  sizes="(max-width: 900px) 90vw, 620px"
                />
              </div>
              <Icon name="grain" className="spotlight__grain g1" />
              <Icon name="grain" className="spotlight__grain g2" />
              <Icon name="grain" className="spotlight__grain g3" />
              <Icon name="grain" className="spotlight__grain g4" />
              <Icon name="wheat" className="spotlight__wheat" />
            </div>
            <div className="spotlight__copy">
              <p className="eyebrow">
                <span className="dot"></span> Product spotlight
              </p>
              <h2>
                {featured.name}
                {(featured.nameBn || featured.nameJp) && (
                  <span className="spotlight__jp">
                    {[featured.nameBn, featured.nameJp]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </h2>
              <p className="spotlight__lead">
                {paragraphs(featured.description)[0]}
              </p>
              {featured.nutrition && (
                <div className="nutri">
                  {featured.nutrition.rows.slice(0, 4).map((row) => {
                    const q = parseQuantity(row.value);
                    const shortUnit = q && q.unit.length <= 2;
                    return (
                      <div className="nutri__item" key={row.label}>
                        <strong>
                          {q ? (
                            <>
                              <span
                                className="count"
                                data-to={q.value}
                                data-dec={q.decimals}
                              >
                                0
                              </span>
                              {shortUnit && q.unit}
                            </>
                          ) : (
                            row.value
                          )}
                        </strong>
                        <span>
                          {q && !shortUnit ? `${q.unit} · ` : ""}
                          {row.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {featured.benefits.length > 0 && (
                <ul className="ticks">
                  {featured.benefits.slice(0, 4).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              <Link
                href={`/products/${featured.slug}`}
                className="btn btn--red magnetic spotlight__cta"
              >
                <span>View {featured.name}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* QUALITY */}
      <section className="quality" id="quality">
        <div className="container">
          <div className="quality__head">
            <p className="eyebrow">
              <span className="dot"></span> Our promise
            </p>
            <h2>
              Good food is <span className="hl">simple</span> food.
            </h2>
          </div>
          <div className="quality__grid">
            <div className="qcard">
              <div className="qcard__icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M24 4 8 10v12c0 11 7 19 16 22 9-3 16-11 16-22V10z" />
                  <path d="m16 24 6 6 10-12" />
                </svg>
              </div>
              <h3>No harmful preservatives</h3>
              <p>
                Clean recipes you can read — made to taste like they were cooked
                at home.
              </p>
            </div>
            <div className="qcard">
              <div className="qcard__icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r="18" />
                  <path d="M30 15a11 11 0 1 0 0 18 9 9 0 1 1 0-18z" />
                </svg>
              </div>
              <h3>Halal certified</h3>
              <p>
                Every product is certified halal, so the whole family can enjoy
                with peace of mind.
              </p>
            </div>
            <div className="qcard">
              <div className="qcard__icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r="18" />
                  <path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36" />
                </svg>
              </div>
              <h3>Export quality</h3>
              <p>
                Produced to international standards and packed to travel from
                Dhaka to Tokyo.
              </p>
            </div>
            <div className="qcard">
              <div className="qcard__icon">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M8 30h32a16 16 0 0 1-32 0z" />
                  <path d="M18 22c0-4 4-4 4-8M26 22c0-4 4-4 4-8" />
                </svg>
              </div>
              <h3>Authentic recipes</h3>
              <p>
                Traditional Bangladeshi flavours, kept honest — no shortcuts, no
                compromises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="gallery" id="gallery">
        <div className="container">
          <p className="eyebrow eyebrow--light">
            <span className="dot"></span> On the shelf
          </p>
          <h2 className="gallery__title">
            Made for the shelf.
            <br />
            <span>Made for the table.</span>
          </h2>
        </div>
        <div className="container">
          <div className="gallery__grid">
            <figure className="gimg gimg--tall" data-cursor="Look">
              <div className="gimg__inner">
                <Image
                  src="/images/all_items.webp"
                  alt="The Antar product lineup on a supermarket display"
                  width={706}
                  height={600}
                  sizes="(max-width: 900px) 100vw, 706px"
                />
              </div>
              <figcaption>
                The full lineup · <span lang="ja">全ラインナップ</span>
              </figcaption>
            </figure>
            <figure className="gimg" data-cursor="Look">
              <div className="gimg__inner">
                <Image
                  src="/images/puffed_rice.webp"
                  alt="Antar Puffed Rice front and back of pack"
                  width={600}
                  height={300}
                  sizes="(max-width: 900px) 100vw, 600px"
                />
              </div>
              <figcaption>Puffed Rice · Front &amp; back</figcaption>
            </figure>
            <figure className="gimg" data-cursor="Look">
              <div className="gimg__inner">
                <Image
                  src="/images/frozen_items.webp"
                  alt="Antar frozen snacks and patali gur"
                  width={600}
                  height={240}
                  sizes="(max-width: 900px) 100vw, 600px"
                />
              </div>
              <figcaption>
                Frozen favourites · <span lang="ja">冷凍スナック</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <Contact withForm />
      <HomeMotion />
    </>
  );
}
