"use client";
import { useState } from "react";

declare global {
  interface Window {
    __antarLoaded?: boolean;
  }
}

/** Brand preloader — only on the first full load of the home page; HomeMotion sets the flag once it has played. */
export function Loader() {
  const [visible] = useState(() => typeof window === "undefined" || !window.__antarLoaded);
  if (!visible) return null;
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <div className="loader__inner">
        {/* eslint-disable-next-line @next/next/no-img-element -- must paint instantly, before hydration */}
        <img className="loader__logo" src="/images/antar-logo.webp" alt="" width={260} height={162} />
      </div>
      <div className="loader__curtain"></div>
    </div>
  );
}
