import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Share-card images are drawn by next/og, which can't read WebP — convert a file from public/ to a PNG data URL.
 * Runs at build time, when the share cards are pre-rendered.
 */
export async function pngFromPublic(publicPath: string, maxWidth: number, maxHeight: number) {
  const input = await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", publicPath));
  const { data, info } = await sharp(input).resize({ width: maxWidth, height: maxHeight, fit: "inside" }).png().toBuffer({ resolveWithObject: true });
  return { src: `data:image/png;base64,${data.toString("base64")}`, width: info.width, height: info.height };
}
