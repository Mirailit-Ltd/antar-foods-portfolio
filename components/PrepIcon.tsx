import type { Product } from "@/lib/product-schema";

type Method = Product["preparation"][number]["method"];

const PATHS: Record<Method, React.ReactNode> = {
  "deep-fry": (
    <>
      <path d="M8 22h32v6a12 12 0 0 1-12 12h-8A12 12 0 0 1 8 28z" />
      <path d="M4 22h4M40 22h4M17 16c0-3 3-3 3-6M27 16c0-3 3-3 3-6" />
    </>
  ),
  "air-fry": (
    <>
      <rect x="10" y="6" width="28" height="36" rx="8" />
      <circle cx="24" cy="26" r="7" />
      <path d="M24 19v14M17 26h14M16 12h16" />
    </>
  ),
  oven: (
    <>
      <rect x="6" y="8" width="36" height="32" rx="4" />
      <rect x="12" y="18" width="24" height="16" rx="2" />
      <path d="M12 13h2M18 13h2M28 13h8" />
    </>
  ),
  pan: (
    <>
      <circle cx="20" cy="26" r="13" />
      <path d="M33 26h11" />
      <path d="M15 22c3-3 7-3 10 0" />
    </>
  ),
  microwave: (
    <>
      <rect x="4" y="10" width="40" height="28" rx="4" />
      <rect x="9" y="15" width="22" height="18" rx="2" />
      <path d="M37 16v2M37 23v2M37 30v2" />
    </>
  ),
  steam: (
    <>
      <path d="M8 24h32v4a12 12 0 0 1-12 12h-8A12 12 0 0 1 8 28z" />
      <path d="M17 18c-2-3 2-5 0-8M24 18c-2-3 2-5 0-8M31 18c-2-3 2-5 0-8" />
    </>
  ),
  "ready-to-eat": (
    <>
      <path d="M6 22h36a18 18 0 0 1-36 0z" />
      <path d="m17 30 5 5 9-10" />
    </>
  ),
};

export function PrepIcon({ method }: { method: Method }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      {PATHS[method]}
    </svg>
  );
}
