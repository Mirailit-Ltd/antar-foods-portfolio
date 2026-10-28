"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  gsap,
  ScrollTrigger,
  getLenis,
  hasFinePointer,
  prefersReducedMotion,
  scrollToTarget,
  setLenis,
} from "./gsap";

/** Site-wide motion: smooth scroll, in-page anchor scrolling, custom cursor, magnetic buttons, footer reveal. */
export function SiteMotion() {
  const pathname = usePathname();

  // Smooth scroll, once for the whole site
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1, smoothWheel: true });
    const raf = (t: number) => lenis.raf(t * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Scroll triggers measure positions once; remeasure whenever the page height changes
  // (fonts and images loading, recipes opening, pinned sections) so none end up out of reach
  useEffect(() => {
    let lastHeight = document.body.scrollHeight;
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      clearTimeout(timer);
      timer = setTimeout(() => {
        ScrollTrigger.refresh();
        lastHeight = document.body.scrollHeight;
      }, 200);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Links to a section of the current page scroll smoothly instead of jumping
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element).closest?.(
        "a[href*='#']",
      ) as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.hash.length < 2
      )
        return;
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("antar:navigate"));
      scrollToTarget(url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // New page: start at the top (or at its #hash) and remeasure triggers
  useEffect(() => {
    const lenis = getLenis();
    if (location.hash.length > 1) {
      const el = document.querySelector<HTMLElement>(location.hash);
      if (el && lenis) lenis.scrollTo(el, { immediate: true });
      else el?.scrollIntoView();
    } else lenis?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Footer "Antar" letters rise in when the footer is actually on screen. An IntersectionObserver
  // is used instead of a ScrollTrigger so it can't be stranded by a stale scroll position.
  useEffect(() => {
    const big = document.querySelector<HTMLElement>(".footer__big");
    if (!big || prefersReducedMotion()) return;
    const letters = big.querySelectorAll("span");
    gsap.set(letters, { yPercent: 100, rotate: 8 });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        gsap.to(letters, {
          yPercent: 0,
          rotate: 0,
          stagger: 0.06,
          duration: 1.2,
          ease: "expo.out",
        });
      },
      { threshold: 0.15 },
    );
    io.observe(big);
    return () => {
      io.disconnect();
      gsap.killTweensOf(letters);
      gsap.set(letters, { clearProps: "transform" });
    };
  }, [pathname]);

  // Cursor follower: one delegated listener set for the whole site
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    if (!cursor || !hasFinePointer() || prefersReducedMotion()) {
      cursor?.style.setProperty("display", "none");
      return;
    }
    const label = cursor.querySelector<HTMLElement>(".cursor__label")!;
    const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    const onMove = (e: MouseEvent) => {
      cx(e.clientX);
      cy(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const big = t.closest<HTMLElement>("[data-cursor]");
      if (big) label.textContent = big.dataset.cursor!;
      cursor.classList.toggle("is-big", !!big);
      cursor.classList.toggle("is-link", !!t.closest("a, button"));
    };
    addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  // Magnetic buttons, rebound for each page's elements
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const offs: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", {
        duration: 0.6,
        ease: "elastic.out(1, .4)",
      });
      const my = gsap.quickTo(el, "y", {
        duration: 0.6,
        ease: "elastic.out(1, .4)",
      });
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      };
      const leave = () => {
        mx(0);
        my(0);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      offs.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        gsap.set(el, { clearProps: "transform" });
      });
    });
    return () => offs.forEach((off) => off());
  }, [pathname]);

  return null;
}
