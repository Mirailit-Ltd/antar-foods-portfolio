import { ImageResponse } from "next/og";
import { OG_SIZE, pngFromPublic } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — authentic Bangladeshi snacks, frozen samosas and sweets in Japan`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Default share card for every page that doesn't have its own. */
export default async function Image() {
  const [logo, bag, jar, paratha] = await Promise.all([
    pngFromPublic("images/antar-logo.webp", 220, 140),
    pngFromPublic("images/hero-puffed-rice.webp", 300, 330),
    pngFromPublic("images/hero-patali-gur.webp", 170, 260),
    pngFromPublic("images/hero-paratha.webp", 200, 205),
  ]);
  const card = { position: "absolute" as const, display: "flex", borderRadius: 22, border: "6px solid #fff", boxShadow: "0 30px 40px rgba(60,5,5,.35)", overflow: "hidden" as const };

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF8F1", position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", right: -120, top: -40, width: 720, height: 720, borderRadius: 9999, background: "#D7261E", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 72px", width: 640 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} width={logo.width} height={logo.height} alt="" />
          <div style={{ marginTop: 28, fontSize: 84, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2, color: "#2A1311", display: "flex", flexDirection: "column" }}>
            <span>Taste something</span>
            <span style={{ color: "#D7261E" }}>new.</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 30, color: "#6B4B47", lineHeight: 1.3 }}>Authentic Bangladeshi snacks, samosas and sweets — made for Japan.</div>
          <div style={{ marginTop: 30, display: "flex" }}>
            <div style={{ padding: "10px 22px", borderRadius: 999, background: "#FFC72C", color: "#2A1311", fontSize: 24, fontWeight: 700 }}>100% Halal</div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ ...card, left: 720, top: 60, transform: "rotate(-6deg)" }}><img src={bag.src} width={bag.width} height={bag.height} alt="" /></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ ...card, left: 1000, top: 210, transform: "rotate(7deg)" }}><img src={jar.src} width={jar.width} height={jar.height} alt="" /></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ ...card, left: 690, top: 380, transform: "rotate(5deg)" }}><img src={paratha.src} width={paratha.width} height={paratha.height} alt="" /></div>
      </div>
    ),
    size
  );
}
