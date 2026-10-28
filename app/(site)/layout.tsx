import { GoogleAnalytics } from "@next/third-parties/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Sprite } from "@/components/Sprite";
import { SiteMotion } from "@/components/motion/SiteMotion";
import { GA_MEASUREMENT_ID } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sprite />
      <div className="cursor" id="cursor" aria-hidden="true">
        <span className="cursor__label">View</span>
      </div>
      <Header />
      <main id="top">{children}</main>
      <Footer />
      <SiteMotion />
      {/* Public pages only, so admin visits aren't counted. GA4's enhanced measurement records
          client-side navigations ("page changes based on browser history events") on its own. */}
      {GA_MEASUREMENT_ID && process.env.NODE_ENV === "production" && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </>
  );
}
