import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/product-schema";
import { Icon } from "./Sprite";

export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  const tall = product.images[0] && /gur|jar/.test(product.images[0]);
  return (
    <article className="pcard" style={{ "--c1": product.theme.c1, "--c2": product.theme.c2 } as React.CSSProperties} data-cursor="Taste">
      {index !== undefined && <span className="pcard__num">{String(index + 1).padStart(2, "0")}</span>}
      <div className={`pcard__media${tall ? " pcard__media--tall" : ""}`}>
        <Image src={product.images[0]} alt={`Antar ${product.name}`} fill sizes="(max-width: 760px) 92vw, 420px" />
      </div>
      <div className="pcard__body">
        {(product.nameJp || product.nameBn) && <p className="pcard__jp">{[product.nameJp, product.nameBn].filter(Boolean).join(" · ")}</p>}
        <H>
          <Link href={`/products/${product.slug}`} className="pcard__link">
            {product.name}
          </Link>
          {product.badge && <em className="badge-hot">{product.badge}</em>}
        </H>
        <p>{product.shortDescription}</p>
        {product.tags.length > 0 && (
          <ul className="tags">
            {product.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
      <Icon name={product.theme.icon} className="pcard__fx" />
    </article>
  );
}
