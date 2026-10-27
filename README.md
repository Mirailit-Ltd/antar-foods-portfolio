# antar-foods-portfolio

Portfolio website for **Antar** — authentic Bangladeshi food products for Japan (antarfoods.com).

A static, single-page site with scroll and motion animation (GSAP, ScrollTrigger, Lenis), showcasing the product lineup: Puffed Rice, Punjabi Aloo Samosa, Vegetable Samosa, Vegetable Singara, Vegetable Spring Roll, Premium Khejur Patali Gur and Plain Paratha.

## Structure

```
index.html          page markup and inline SVG food graphics
assets/css/style.css
assets/js/main.js   animations and interactions
assets/img/         logo and product images
```

## Run locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Updating product images

Replace the files in `assets/img/` keeping the same names (e.g. `aloo-samosa.webp`, `patali-gur.webp`).
