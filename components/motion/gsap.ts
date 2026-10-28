"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

// Single Lenis instance shared by the site chrome and page animations
let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const setLenis = (l: Lenis | null) => (lenis = l);

export function scrollToTarget(target: string | number) {
  const el = typeof target === "string" ? (target === "#top" ? 0 : document.querySelector<HTMLElement>(target)) : target;
  if (el === null) return;
  const reduced = prefersReducedMotion();
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else if (typeof el === "number") window.scrollTo({ top: el, behavior: reduced ? "auto" : "smooth" });
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}
