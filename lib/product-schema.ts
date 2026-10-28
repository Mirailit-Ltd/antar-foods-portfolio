import { z } from "zod";

/* Shared by the site, the admin form (client) and the server actions. */

export const ICONS = ["grain", "samosa", "chili", "leaf", "gur", "wheat", "sakura"] as const;

export const PREP_METHODS = {
  "deep-fry": "Deep fry",
  "air-fry": "Air fry",
  oven: "Oven",
  pan: "Pan fry",
  microwave: "Microwave",
  steam: "Steam",
  "ready-to-eat": "Ready to eat",
} as const;

const text = (max = 2000) => z.string().trim().max(max);
const optionalText = (max = 2000) => text(max).transform((v) => v || undefined).optional();
const imagePath = z.string().regex(/^\/(products|images)\/[\w./-]+$/, "Invalid image path");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #FFE4D6");

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  order: z.number().int(),
  published: z.boolean(),
  featured: z.boolean(),

  name: text(120).min(1, "Name is required"),
  nameJp: optionalText(120),
  nameBn: optionalText(120),
  category: text(80).min(1, "Category is required"),
  badge: optionalText(40),
  shortDescription: text(300).min(1, "Short description is required"),
  description: text(5000).min(1, "Description is required"),

  images: z.array(imagePath).min(1, "Add at least one image").max(12),
  variants: z.array(z.object({ label: text(60).min(1), image: imagePath.optional() })).max(20),
  tags: z.array(text(40).min(1)).max(10),
  theme: z.object({ c1: hex, c2: hex, icon: z.enum(ICONS) }),

  preparation: z
    .array(
      z.object({
        method: z.enum(Object.keys(PREP_METHODS) as [keyof typeof PREP_METHODS, ...(keyof typeof PREP_METHODS)[]]),
        time: optionalText(40),
        steps: optionalText(1000),
      })
    )
    .max(8),
  benefits: z.array(text(200).min(1)).max(12),
  shelfLife: optionalText(60),
  storage: optionalText(60),
  nutrition: z
    .object({
      basis: text(60).min(1),
      rows: z.array(z.object({ label: text(60).min(1), value: text(30).min(1) })).min(1).max(20),
    })
    .optional(),
  ingredients: optionalText(1500),
  allergens: optionalText(500),

  recipes: z
    .array(
      z.object({
        title: text(120).min(1),
        image: imagePath.optional(),
        time: optionalText(40),
        servings: optionalText(40),
        summary: optionalText(400),
        ingredients: z.array(text(200).min(1)).max(30),
        steps: z.array(text(600).min(1)).max(30),
      })
    )
    .max(8),
  hacks: z
    .array(z.object({ title: text(120).min(1), body: text(800).min(1), image: imagePath.optional() }))
    .max(8),
  whereToBuy: z
    .array(z.object({ name: text(80).min(1), url: z.url().optional().or(z.literal("").transform(() => undefined)) }))
    .max(12),
  faqs: z.array(z.object({ question: text(200).min(1), answer: text(1500).min(1) })).max(20),

  seo: z.object({ title: optionalText(70), description: optionalText(170) }),
});

export type Product = z.infer<typeof productSchema>;
export type ProductIcon = (typeof ICONS)[number];

export const catalogSchema = z.object({ products: z.array(productSchema) });
export type Catalog = z.infer<typeof catalogSchema>;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
