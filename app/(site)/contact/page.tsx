import { JsonLd } from "@/components/JsonLd";
import { Icon } from "@/components/Sprite";
import { RevealMotion } from "@/components/motion/RevealMotion";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, site } from "@/lib/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = pageMetadata({
  title: "Contact Us — Wholesale & Product Enquiries",
  description: "Get in touch with Antar Foods. Retailers, distributors and food lovers in Japan — send us a message about our Bangladeshi snacks, frozen foods and sweets.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${SITE_URL}/contact`,
          mainEntity: {
            "@type": "Organization",
            name: site.name,
            email: site.email,
            contactPoint: { "@type": "ContactPoint", contactType: "sales", email: site.email, areaServed: "JP", availableLanguage: ["English", "Japanese"] },
          },
        }}
      />
      <section className="cpage">
        <div className="container cpage__grid">
          <div className="cpage__info">
            <p className="eyebrow" data-reveal>
              <span className="dot"></span> Let&apos;s talk · <span lang="ja">お問い合わせ</span>
            </p>
            <h1 className="cpage__title" data-reveal>
              Get in touch
            </h1>
            <p className="cpage__lead" data-reveal>
              Retailers, distributors and food lovers — questions about our products, wholesale orders or partnerships? Send us a message and we&apos;ll get back to you.
            </p>

            <dl className="cpage__details" data-reveal="children">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>
                    {site.email.split("@")[0]}@<wbr />
                    {site.email.split("@")[1]}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Imported &amp; distributed in Japan</dt>
                <dd>
                  <span lang="ja">{site.distributor.nameJp}</span>
                  <br />
                  {site.distributor.name}
                  <br />
                  <a href={site.distributor.url} target="_blank" rel="noopener">
                    {site.distributor.url.replace(/^https?:\/\//, "")} ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Product of</dt>
                <dd>Bangladesh 🇧🇩 · Enjoyed in Japan 🇯🇵</dd>
              </div>
            </dl>
          </div>

          <div className="cpage__form" data-reveal>
            <ContactForm />
          </div>
        </div>
        <Icon name="samosa" className="cpage__fx cpage__fx--1" />
        <Icon name="chili" className="cpage__fx cpage__fx--2" />
      </section>
      <RevealMotion />
    </>
  );
}
