"use client";
import Image from "next/image";
import { createContext, use, useState } from "react";
import type { Product } from "@/lib/product-schema";

type Media = Pick<Product, "name" | "images" | "variants">;

const MediaContext = createContext<{
  product: Media;
  active: number;
  setActive: (i: number) => void;
  variant: number;
  pickVariant: (i: number) => void;
} | null>(null);

function useMedia() {
  const ctx = use(MediaContext);
  if (!ctx) throw new Error("Wrap with <ProductMediaProvider>");
  return ctx;
}

/** Shares the selected image and pack size between the gallery and the pack-size picker in the info column. */
export function ProductMediaProvider({
  product,
  children,
}: {
  product: Media;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [variant, setVariant] = useState(0);

  const pickVariant = (i: number) => {
    setVariant(i);
    const img = product.variants[i]?.image;
    if (img && product.images.includes(img))
      setActive(product.images.indexOf(img));
  };

  return (
    <MediaContext value={{ product, active, setActive, variant, pickVariant }}>
      {children}
    </MediaContext>
  );
}

export function ProductGallery() {
  const { product, active, setActive } = useMedia();
  const images = product.images;
  const many = images.length > 1;
  const go = (dir: number) =>
    setActive((active + dir + images.length) % images.length);

  return (
    <div className="pgallery">
      <div
        className="pgallery__main"
        data-cursor="Look"
        tabIndex={many ? 0 : undefined}
        aria-roledescription={many ? "carousel" : undefined}
        aria-label={many ? `${product.name} images` : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={
              i === 0
                ? `Antar ${product.name}`
                : `Antar ${product.name} — image ${i + 1}`
            }
            fill
            sizes="(max-width: 1050px) 92vw, 690px"
            priority={i === 0}
            className={i === active ? "is-active" : undefined}
            aria-hidden={i !== active}
          />
        ))}
        {many && (
          <>
            <button
              type="button"
              className="pgallery__nav pgallery__nav--prev"
              aria-label="Previous image"
              onClick={() => go(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="pgallery__nav pgallery__nav--next"
              aria-label="Next image"
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span className="pgallery__count" aria-live="polite">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <div
          className="pgallery__thumbs"
          role="group"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === active ? "is-active" : undefined}
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <Image src={src} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Pack sizes; picking one shows its image in the gallery when it has one. */
export function PackSizes() {
  const { product, variant, pickVariant } = useMedia();
  if (!product.variants.length) return null;
  return (
    <div className="pvariants">
      <p className="pvariants__label">Pack size</p>
      <div className="pvariants__list" role="group" aria-label="Pack size">
        {product.variants.map((v, i) => (
          <button
            key={v.label}
            type="button"
            className={i === variant ? "is-active" : undefined}
            aria-pressed={i === variant}
            onClick={() => pickVariant(i)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
