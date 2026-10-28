import type { Metadata, Viewport } from "next";
import { Anton, Fraunces, Noto_Sans_JP, Outfit } from "next/font/google";
import { GOOGLE_SITE_VERIFICATION, SITE_URL, site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
});
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
// Japanese glyphs come in many unicode-range slices; let the browser fetch only what a page uses
const notoJp = Noto_Sans_JP({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-noto-jp", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // Icons and share images come from app/icon.tsx, app/apple-icon.tsx and the opengraph-image files
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#D7261E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below may add data-loaded before React hydrates
    <html lang="en" className={`${fraunces.variable} ${anton.variable} ${outfit.variable} ${notoJp.variable}`} suppressHydrationWarning>
      <head>
        {/* Skip the brand preloader for the rest of the browser session, before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{sessionStorage.getItem("antar-loaded")&&(document.documentElement.dataset.loaded="1")}catch(e){}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
