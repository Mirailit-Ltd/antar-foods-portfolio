import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__big" aria-hidden="true">
        {[..."Antar"].map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
      <div className="container footer__row">
        <Image src={site.logo} alt="Antar" width={90} height={56} />
        <nav className="footer__links" aria-label="Footer">
          <Link href="/products">All products</Link>
          <Link href="/#story">Our story</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <p>
          © {new Date().getFullYear()} Antar · A brand of {site.distributor.name}
        </p>
        <Link href="#top" className="footer__top">
          Back to top ↑
        </Link>
      </div>
    </footer>
  );
}
