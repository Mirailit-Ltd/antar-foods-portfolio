import Link from "next/link";
import { site } from "@/lib/site";
import { ContactForm } from "./contact/ContactForm";
import { Icon } from "./Sprite";

/** "Let's talk" section. With `withForm`, the message form sits beside the details instead of a link to /contact. */
export function Contact({ withForm = false }: { withForm?: boolean }) {
  return (
    <section
      className={`contact${withForm ? " contact--form" : ""}`}
      id="contact"
    >
      <div className="contact__fx" aria-hidden="true">
        <Icon name="samosa" className="cfx cfx--1" />
        <Icon name="chili" className="cfx cfx--2" />
        <Icon name="sakura" className="cfx cfx--3" />
        <Icon name="grain" className="cfx cfx--4" />
      </div>
      <div className="container contact__inner">
        <div className="contact__info">
          <p className="eyebrow eyebrow--light">
            <span className="dot"></span> Let&apos;s talk
          </p>
          <h2 className="contact__title">
            Hungry for a
            <br /> partnership?
          </h2>
          <p className="contact__lead">
            Retailers, distributors and food lovers — we&apos;d love to hear
            from you.
          </p>
          <a href={`mailto:${site.email}`} className="contact__mail magnetic">
            {site.email.split("@")[0]}@<wbr />
            {site.email.split("@")[1]}
          </a>
          {!withForm && (
            <div className="contact__cta">
              <Link href="/contact" className="btn btn--gold magnetic">
                <span>Send us a message</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          )}

          <div className="contact__cols">
            <div>
              <h3>Imported &amp; distributed in Japan</h3>
              <p>
                <span lang="ja">{site.distributor.nameJp}</span>
                <br />
                {site.distributor.name}
              </p>
              <a href={site.distributor.url} target="_blank" rel="noopener">
                {site.distributor.url.replace(/^https?:\/\//, "")} ↗
              </a>
            </div>
            <div>
              <h3>Product of</h3>
              <p>
                Bangladesh 🇧🇩
                <br />
                Enjoyed in Japan 🇯🇵
              </p>
            </div>
          </div>
        </div>
        {withForm && (
          <div className="contact__form">
            <ContactForm />
          </div>
        )}
      </div>
    </section>
  );
}
