// Google Search Console HTML-tag verification code and GA4 measurement ID (G-XXXXXXX); both optional
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://antarfoods.com").replace(/\/$/, "");

export const site = {
  name: "Antar Foods",
  shortName: "Antar",
  tagline: "Taste Something New",
  description:
    "Antar brings authentic Bangladeshi flavours to Japan — puffed rice, samosas, singara, spring rolls, paratha and premium khejur patali gur.",
  email: "antar.foods.ltd@gmail.com",
  distributor: {
    name: "Gold Lavender Co. Ltd.",
    nameJp: "株式会社 Gold Lavender",
    url: "https://shinjukuhalalfood.com",
  },
  logo: "/images/antar-logo.webp",
};
