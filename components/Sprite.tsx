import type { ProductIcon } from "@/lib/product-schema";

/** Food graphics used across the site, referenced with <Icon name="…" />. */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <defs>
    <linearGradient id="g-chili" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#FF5A3C" /><stop offset="1" stopColor="#B3120F" />
    </linearGradient>
    <linearGradient id="g-crust" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#FFD27A" /><stop offset="1" stopColor="#D98A2B" />
    </linearGradient>
    <linearGradient id="g-gur" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#A9512B" /><stop offset="1" stopColor="#5A1E10" />
    </linearGradient>
    </defs>
    <symbol id="i-chili" viewBox="0 0 120 120">
    <path d="M86 22c6-8 14-10 20-6-6 1-10 5-12 11" fill="none" stroke="#2F8F3A" strokeWidth="6" strokeLinecap="round"/>
    <path d="M78 26c10 2 16 10 14 20-4 26-34 56-74 58-6 0-6-6-1-8 28-10 44-34 48-56 2-10 6-16 13-14z" fill="url(#g-chili)"/>
    <path d="M74 40c-4 18-16 34-32 44" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round"/>
    <path d="M72 26c4-6 12-8 18-4-2 6-8 8-14 8z" fill="#3BA449"/>
    </symbol>
    <symbol id="i-samosa" viewBox="0 0 120 120">
    <path d="M60 10c6 0 10 4 13 10l34 70c4 9-1 18-12 18H25c-11 0-16-9-12-18l34-70c3-6 7-10 13-10z" fill="url(#g-crust)"/>
    <path d="M60 18 26 96M60 18l34 78" stroke="#B8691E" strokeOpacity=".35" strokeWidth="3" fill="none"/>
    <circle cx="46" cy="66" r="3" fill="#B8691E" opacity=".45"/><circle cx="70" cy="74" r="2.5" fill="#B8691E" opacity=".45"/><circle cx="58" cy="50" r="2.5" fill="#B8691E" opacity=".45"/>
    <path d="M50 30c-6 12-12 26-16 40" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </symbol>
    <symbol id="i-leaf" viewBox="0 0 120 120">
    <path d="M14 104C14 50 50 14 106 14c0 56-36 90-92 90z" fill="#3BA449"/>
    <path d="M18 100 96 24" stroke="#1F6E2A" strokeWidth="4" strokeLinecap="round"/>
    <path d="M44 74l-2-22M60 58l-2-20M44 74l22 2M60 58l22 2" stroke="#1F6E2A" strokeWidth="3" strokeLinecap="round" opacity=".7"/>
    </symbol>
    <symbol id="i-grain" viewBox="0 0 60 120">
    <ellipse cx="30" cy="60" rx="16" ry="44" fill="#FFF8EC"/>
    <ellipse cx="24" cy="48" rx="5" ry="20" fill="#fff"/>
    <ellipse cx="30" cy="60" rx="16" ry="44" fill="none" stroke="#E9D3B4" strokeWidth="3"/>
    </symbol>
    <symbol id="i-sakura" viewBox="0 0 120 120">
    <g fill="#FFB7C5">
    <path id="petal" d="M60 58c-12-14-16-30-6-40 4-4 8-2 6 4 2-6 6-8 10-4 10 10 2 26-10 40z"/>
    <use href="#petal" transform="rotate(72 60 60)"/><use href="#petal" transform="rotate(144 60 60)"/>
    <use href="#petal" transform="rotate(216 60 60)"/><use href="#petal" transform="rotate(288 60 60)"/>
    </g>
    <circle cx="60" cy="60" r="8" fill="#F0607A"/>
    <circle cx="60" cy="60" r="3.5" fill="#FFD23F"/>
    </symbol>
    <symbol id="i-wheat" viewBox="0 0 80 160">
    <path d="M40 156V40" stroke="#E0A21C" strokeWidth="4" strokeLinecap="round"/>
    <g fill="#FFC72C">
    <ellipse cx="40" cy="22" rx="7" ry="14"/>
    <ellipse cx="28" cy="46" rx="7" ry="14" transform="rotate(-30 28 46)"/><ellipse cx="52" cy="46" rx="7" ry="14" transform="rotate(30 52 46)"/>
    <ellipse cx="28" cy="72" rx="7" ry="14" transform="rotate(-30 28 72)"/><ellipse cx="52" cy="72" rx="7" ry="14" transform="rotate(30 52 72)"/>
    <ellipse cx="28" cy="98" rx="7" ry="14" transform="rotate(-30 28 98)"/><ellipse cx="52" cy="98" rx="7" ry="14" transform="rotate(30 52 98)"/>
    </g>
    </symbol>
    <symbol id="i-gur" viewBox="0 0 120 120">
    <path d="M14 58c0-20 20-34 46-34s46 14 46 34c0 22-20 38-46 38S14 80 14 58z" fill="url(#g-gur)"/>
    <ellipse cx="60" cy="52" rx="38" ry="20" fill="#C2693A"/>
    <ellipse cx="60" cy="52" rx="20" ry="9" fill="#8E3A1C"/>
    <path d="M28 48c8-10 22-14 36-14" stroke="#F3A66E" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7"/>
    </symbol>
    <symbol id="i-burst" viewBox="0 0 120 120">
    <path d="M60 4l10 22 22-12-4 25 25 4-18 17 18 17-25 4 4 25-22-12-10 22-10-22-22 12 4-25-25-4 18-17L7 43l25-4-4-25 22 12z" fill="currentColor"/>
    </symbol>
    <symbol id="i-plate" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="56" fill="#fff"/><circle cx="60" cy="60" r="42" fill="none" stroke="#F1E3DA" strokeWidth="3"/>
    </symbol>
    </svg>
  );
}

export function Icon({ name, className }: { name: ProductIcon | "burst" | "plate"; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}
