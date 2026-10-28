import { ImageResponse } from "next/og";
import { pngFromPublic } from "@/lib/og";

// Google wants a square favicon in a multiple of 48px
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await pngFromPublic("images/antar-logo.webp", 176, 176);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFF8F1", borderRadius: 40 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} width={logo.width} height={logo.height} alt="" />
      </div>
    ),
    size
  );
}
