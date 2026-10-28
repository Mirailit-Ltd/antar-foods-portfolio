import { ImageResponse } from "next/og";
import { pngFromPublic } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await pngFromPublic("images/antar-logo.webp", 160, 160);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFF8F1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} width={logo.width} height={logo.height} alt="" />
      </div>
    ),
    size
  );
}
