"use client";
import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

/** Fades up every [data-reveal] block as it scrolls into view. */
export function RevealMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const items = el.dataset.reveal === "children" ? [...el.children] : [el];
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    });
    return () => ctx.revert();
  }, []);
  return null;
}
