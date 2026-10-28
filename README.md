# Antar Foods

Website for **Antar**, authentic Bangladeshi food products for Japan. Built with Next.js 15 (App Router), with GSAP, ScrollTrigger and Lenis animation, and a small admin for managing products.

The site has no database or file storage service. Products live in a JSON file and their images live in the repo.

```
public/data/products.json   all products (the "database")
public/products/            product images (managed by the admin)
public/images/              design images: logo, hero, gallery (not touched by the admin)
app/(site)/                 public pages: home, /products, /products/[slug]
app/admin/                  admin pages and server actions
lib/product-schema.ts       product fields and validation (zod)
lib/storage.ts              reading and saving products: local files, or GitHub commits
```

## How publishing works

The public pages are pre-rendered at build time from `products.json`. That keeps them fast and SEO-friendly, but it means **a change only goes live after the site rebuilds**.

- **On Amplify (production):** saving in `/admin` commits the JSON and any new images to GitHub through the GitHub API. Amplify sees the commit and rebuilds. Changes are live in about 3–5 minutes.
- **Locally (`npm run dev`):** with no GitHub variables set, the admin writes straight to `public/data/products.json` and `public/products/`. Commit and push them yourself.

Amplify's servers can't keep files written at runtime, which is why production saves go through Git.

## Run locally

```bash
cp .env.example .env.local   # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm install
npm run dev
```

Open http://localhost:3000. The admin is at http://localhost:3000/admin.

## Deploy on AWS Amplify

1. Connect this repo and branch in Amplify Hosting. `amplify.yml` is already set up.
2. Under **Environment variables**, add:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://antarfoods.com` (used for canonical URLs, the sitemap and Open Graph) |
   | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional: Search Console HTML-tag verification code |
   | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional: Google Analytics 4 ID, e.g. `G-XXXXXXXXXX` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP login for sending contact-form emails |
   | `SMTP_FROM` | sender address, e.g. `"Antar Foods website <no-reply@antarfoods.com>"` |
   | `CONTACT_TO_EMAIL` | optional: where messages go (default `antar.foods.ltd@gmail.com`) |
   | `ADMIN_PASSWORD` | the admin password |
   | `ADMIN_SESSION_SECRET` | a random string of 32+ characters |
   | `GITHUB_TOKEN` | a fine-grained token with **Contents: Read and write** on this repo only |
   | `GITHUB_REPO` | `owner/repo` |
   | `GITHUB_BRANCH` | the branch Amplify deploys, e.g. `main` |

3. Make sure **auto build** is on for that branch, so admin commits trigger a deploy.

Amplify only exposes env vars at build time, so `amplify.yml` copies the server-side ones into `.env.production` for the runtime.

## Product pages

Each product page shows these sections, and each one only appears when it has content:

- gallery with pack-size selector
- description
- preparation methods
- benefits, shelf life and storage
- nutrition facts
- ingredients and allergens
- trending recipes
- cooking hacks
- where to buy
- FAQs
- similar products

Product pages publish structured data for search engines:
- `Product` and `BreadcrumbList` on every product.
- `Recipe` when a recipe has steps.
- `FAQPage` when a product has FAQs.

## Images

Images uploaded in the admin are resized in the browser to a maximum of 1600px and converted to WebP before upload. They are saved as `public/products/<slug>-<id>.webp`.

When a product or image is removed, its file is deleted too, unless another product still uses it.

## Google Search Console & Analytics

**Search Console**
1. In Search Console, add a **URL-prefix** property for your site URL and choose the **HTML tag** method.
2. Copy only the `content` value from the tag (`<meta name="google-site-verification" content="THIS_PART">`).
3. Set it as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Amplify and redeploy, then click **Verify**.
4. Submit `https://<your-domain>/sitemap.xml` under **Sitemaps**.

A **Domain** property (verified by a DNS TXT record) covers every subdomain and protocol, but it is set up at your DNS provider rather than in this code.

**Analytics**
1. Create a GA4 property and a **Web** data stream for your domain, and copy its Measurement ID (`G-…`).
2. Set it as `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Amplify and redeploy.
3. Keep **Enhanced measurement → Page changes based on browser history events** on, so client-side page changes are counted.

Analytics only loads in production builds and never on `/admin`. Both values are public (they end up in the page HTML) and are read at build time, so changing them needs a redeploy.

## Contact form

`/contact` emails each message to `CONTACT_TO_EMAIL` over SMTP, with the visitor's address as reply-to, so you can answer straight from your inbox. Any SMTP provider works:

| Provider | SMTP_HOST | SMTP_PORT | Notes |
|---|---|---|---|
| Brevo | `smtp-relay.brevo.com` | 587 | SMTP key from Brevo → SMTP & API |
| Amazon SES | `email-smtp.<region>.amazonaws.com` | 587 | SES SMTP credentials; verify the `SMTP_FROM` domain |
| Gmail / Google Workspace | `smtp.gmail.com` | 587 | needs an App Password (2-step verification on) |

`SMTP_FROM` must be an address or domain your provider allows you to send from, otherwise mail gets rejected or lands in spam.

Spam is filtered with a hidden trap field and a minimum fill-in time. In local development without SMTP settings, messages are printed to the terminal instead of being sent.
