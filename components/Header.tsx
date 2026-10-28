"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, getLenis } from "./motion/gsap";

export const NAV_LINKS = [
  { href: "/#story", label: "Story", section: "story" },
  { href: "/products", label: "Products", section: "products" },
  { href: "/#spotlight", label: "Spotlight", section: "spotlight" },
  { href: "/#quality", label: "Quality", section: "quality" },
  { href: "/#gallery", label: "Gallery", section: "gallery" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > lastY && !openRef.current);
      lastY = y;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const close = () => setOpen(false);
    document.addEventListener("antar:navigate", close);
    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("antar:navigate", close);
    };
  }, []);

  // Close the menu whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const lenis = getLenis();
    if (!open) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    const links = menuRef.current!.querySelectorAll("nav a");
    const tween = gsap.fromTo(
      links,
      { yPercent: 60, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.06,
        duration: 0.7,
        ease: "expo.out",
        delay: 0.25,
      },
    );
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      tween.kill();
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Inner pages start on varied backgrounds, so the bar is always solid there */}
      <header
        className={` nav${scrolled || pathname !== "/" ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}
        id="nav"
      >
        <div className="container nav__inner">
          <Link href="/" className="nav__logo" aria-label="Antar home">
            <Image
              src="/images/antar-logo.webp"
              alt="Antar"
              width={120}
              height={75}
              priority
            />
          </Link>
          <nav className="nav__links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-section={l.section}
                className={
                  l.href === "/products" && pathname.startsWith("/products")
                    ? "is-active"
                    : undefined
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact" className="btn btn--pill nav__cta">
            <span>Get in touch</span>
          </Link>
        </div>
        <button
          className="nav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
        </button>
      </header>

      <div
        className={`menu${open ? " is-open" : ""}`}
        id="menu"
        ref={menuRef}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile">
          {[...NAV_LINKS, { href: "/contact", label: "Contact" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="menu__jp" lang="ja">
          美味しさを、新しく。
        </p>
      </div>
    </>
  );
}
