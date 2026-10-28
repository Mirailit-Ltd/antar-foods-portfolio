"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ICONS, PREP_METHODS, slugify, type Product } from "@/lib/product-schema";
import { saveProduct } from "../actions";

/* Image refs are either a saved path ("/products/x.webp") or "new:<id>" for a file picked in this session. */
type ImgRef = string;
type Pending = Map<string, Blob>;

/* Editing shape: lists that are "one per line" in the UI are kept as plain text until submit. */
type Form = Omit<Product, "id" | "benefits" | "tags" | "recipes" | "nutrition" | "order"> & {
  id?: string;
  order: number;
  benefitsText: string;
  tagsText: string;
  nutrition: { basis: string; rows: { label: string; value: string }[] };
  recipes: (Omit<Product["recipes"][number], "ingredients" | "steps"> & { ingredientsText: string; stepsText: string })[];
};

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function toForm(p?: Product): Form {
  return {
    id: p?.id,
    order: p?.order ?? 0,
    slug: p?.slug ?? "",
    published: p?.published ?? true,
    featured: p?.featured ?? false,
    name: p?.name ?? "",
    nameJp: p?.nameJp,
    nameBn: p?.nameBn,
    category: p?.category ?? "",
    badge: p?.badge,
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    images: p?.images ?? [],
    variants: p?.variants ?? [],
    tagsText: (p?.tags ?? []).join("\n"),
    theme: p?.theme ?? { c1: "#FFE9E4", c2: "#FFD2C7", icon: "samosa" },
    preparation: p?.preparation ?? [],
    benefitsText: (p?.benefits ?? []).join("\n"),
    shelfLife: p?.shelfLife,
    storage: p?.storage,
    nutrition: p?.nutrition ?? { basis: "Average quantities per 100g", rows: [] },
    ingredients: p?.ingredients,
    allergens: p?.allergens,
    recipes: (p?.recipes ?? []).map(({ ingredients, steps, ...r }) => ({ ...r, ingredientsText: ingredients.join("\n"), stepsText: steps.join("\n") })),
    hacks: p?.hacks ?? [],
    whereToBuy: p?.whereToBuy ?? [],
    faqs: p?.faqs ?? [],
    seo: p?.seo ?? {},
  };
}

function fromForm(f: Form) {
  const { benefitsText, tagsText, recipes, nutrition, ...rest } = f;
  return {
    ...rest,
    benefits: lines(benefitsText),
    tags: lines(tagsText),
    nutrition: nutrition.rows.length ? nutrition : undefined,
    recipes: recipes.map(({ ingredientsText, stepsText, ...r }) => ({ ...r, ingredients: lines(ingredientsText), steps: lines(stepsText) })),
  };
}

/** Downscale to max 1600px and re-encode as WebP (JPEG where the browser can't encode WebP). */
async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") return webp;
  return (await encode("image/jpeg"))!;
}

export function ProductForm({ product, categories }: { product?: Product; categories: string[] }) {
  const [form, setForm] = useState<Form>(() => toForm(product));
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [busy, setBusy] = useState(false);
  const pending = useRef<Pending>(new Map());
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [state, action, saving] = useActionState(saveProduct, undefined);
  const errs = state?.fieldErrors ?? {};
  const err = (path: string) => errs[path] && <span className="field__error">{errs[path]}</span>;

  const previewsRef = useRef(previews);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => () => Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (state?.error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const preview = (ref: ImgRef) => (ref.startsWith("new:") ? previews[ref] : `/api/admin/media${ref}`);

  async function addFiles(files: FileList | null): Promise<ImgRef[]> {
    if (!files?.length) return [];
    setBusy(true);
    try {
      const added: Record<string, string> = {};
      for (const file of Array.from(files)) {
        const blob = await prepareImage(file);
        const ref = `new:${crypto.randomUUID()}`;
        pending.current.set(ref, blob);
        added[ref] = URL.createObjectURL(blob);
      }
      setPreviews((p) => ({ ...p, ...added }));
      return Object.keys(added);
    } catch {
      alert("One of the images could not be read. Please use JPEG, PNG or WebP.");
      return [];
    } finally {
      setBusy(false);
    }
  }

  function submit(fd: FormData) {
    const data = fromForm(form);
    const json = JSON.stringify(data);
    fd.set("product", json);
    // Only send the new files the product still uses
    for (const [ref, blob] of pending.current) {
      if (json.includes(`"${ref}"`)) fd.append(`upload:${ref.slice(4)}`, blob, `${ref.slice(4)}.${blob.type === "image/webp" ? "webp" : "jpg"}`);
    }
    action(fd);
  }

  const imagePicker = (value: ImgRef | undefined, onChange: (v: ImgRef | undefined) => void, label = "Image") => (
    <div className="imgpick">
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview(value)} alt="" />
          <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => onChange(undefined)}>Remove</button>
        </>
      ) : (
        <label className="abtn abtn--ghost abtn--sm">
          + {label}
          <input type="file" accept="image/*" hidden onChange={async (e) => { const [ref] = await addFiles(e.target.files); if (ref) onChange(ref); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );

  return (
    <form action={submit} className="pform" noValidate>
      {state?.error && <div className="admin-error admin-error--banner" role="alert">{state.error}{Object.keys(errs).length > 0 && <ul>{Object.entries(errs).map(([k, v]) => <li key={k}><code>{k}</code>: {v}</li>)}</ul>}</div>}

      <Section title="Basics" hint="Shown on product cards, the product page and in search results.">
        <div className="grid2">
          <label className="field">
            <span>Name *</span>
            <input value={form.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} required />
            {err("name")}
          </label>
          <label className="field">
            <span>URL slug *</span>
            <div className="field__prefix"><em>/products/</em><input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} required /></div>
            {err("slug")}
          </label>
          <label className="field">
            <span>Japanese name</span>
            <input value={form.nameJp ?? ""} onChange={(e) => set("nameJp", e.target.value)} lang="ja" />
          </label>
          <label className="field">
            <span>Bengali name</span>
            <input value={form.nameBn ?? ""} onChange={(e) => set("nameBn", e.target.value)} lang="bn" />
          </label>
          <label className="field">
            <span>Category *</span>
            <input value={form.category} onChange={(e) => set("category", e.target.value)} list="categories" required />
            <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            {err("category")}
          </label>
          <label className="field">
            <span>Badge <small>e.g. Hot &amp; Spicy</small></span>
            <input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Short description * <small>card text, max 300 characters</small></span>
          <textarea rows={2} maxLength={300} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          {err("shortDescription")}
        </label>
        <label className="field">
          <span>Full description * <small>leave an empty line between paragraphs</small></span>
          <textarea rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} />
          {err("description")}
        </label>
        <div className="checks">
          <label><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published (visible on the site)</label>
          <label><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Spotlight on the home page</label>
        </div>
      </Section>

      <Section title="Images" hint="The first image is the main one. Images are resized to max 1600px and converted to WebP before upload.">
        <div className="gallery-edit">
          {form.images.map((ref, i) => (
            <figure key={ref}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview(ref)} alt="" />
              {i === 0 && <span className="admin-pill">Main</span>}
              <div>
                <button type="button" className="abtn abtn--icon" disabled={i === 0} onClick={() => set("images", move(form.images, i, -1))} aria-label="Move left">←</button>
                <button type="button" className="abtn abtn--icon" disabled={i === form.images.length - 1} onClick={() => set("images", move(form.images, i, 1))} aria-label="Move right">→</button>
                <button type="button" className="abtn abtn--icon abtn--danger" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i), variants: f.variants.map((v) => (v.image === ref ? { ...v, image: undefined } : v)) }))} aria-label="Remove image">✕</button>
              </div>
            </figure>
          ))}
          <label className="gallery-edit__add">
            {busy ? "Processing…" : "+ Add images"}
            <input type="file" accept="image/*" multiple hidden onChange={async (e) => { const refs = await addFiles(e.target.files); setForm((f) => ({ ...f, images: [...f.images, ...refs] })); e.target.value = ""; }} />
          </label>
        </div>
        {err("images")}
      </Section>

      <Section title="Pack sizes & tags" hint="Pack sizes appear as a selector on the product page; pick an image to switch the gallery to it.">
        <Repeater
          items={form.variants}
          onChange={(v) => set("variants", v)}
          blank={{ label: "" }}
          addLabel="Add pack size"
          render={(v, update, i) => (
            <div className="row">
              <label className="field"><span>Label</span><input value={v.label} placeholder="10 pcs · 750g" onChange={(e) => update({ ...v, label: e.target.value })} />{err(`variants.${i}.label`)}</label>
              <div className="field">
                <span>Image</span>
                <select value={v.image ?? ""} onChange={(e) => update({ ...v, image: e.target.value || undefined })}>
                  <option value="">— none —</option>
                  {form.images.map((ref, k) => <option key={ref} value={ref}>Image {k + 1}</option>)}
                </select>
              </div>
            </div>
          )}
        />
        <label className="field">
          <span>Tags <small>one per line, shown as chips</small></span>
          <textarea rows={3} value={form.tagsText} onChange={(e) => set("tagsText", e.target.value)} />
        </label>
      </Section>

      <Section title="Card style" hint="Colours and graphic used for this product's card and page header.">
        <div className="row">
          <label className="field"><span>Colour 1</span><input type="color" value={form.theme.c1} onChange={(e) => set("theme", { ...form.theme, c1: e.target.value.toUpperCase() })} /></label>
          <label className="field"><span>Colour 2</span><input type="color" value={form.theme.c2} onChange={(e) => set("theme", { ...form.theme, c2: e.target.value.toUpperCase() })} /></label>
          <label className="field">
            <span>Graphic</span>
            <select value={form.theme.icon} onChange={(e) => set("theme", { ...form.theme, icon: e.target.value as Form["theme"]["icon"] })}>
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <div className="swatch" style={{ background: `linear-gradient(160deg, ${form.theme.c1}, ${form.theme.c2})` }} aria-hidden="true" />
        </div>
      </Section>

      <Section title="Preparation methods" hint="Optional. Leave empty to hide the section.">
        <Repeater
          items={form.preparation}
          onChange={(v) => set("preparation", v)}
          blank={{ method: "deep-fry" }}
          addLabel="Add method"
          render={(m, update) => (
            <>
              <div className="row">
                <label className="field">
                  <span>Method</span>
                  <select value={m.method} onChange={(e) => update({ ...m, method: e.target.value as typeof m.method })}>
                    {Object.entries(PREP_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                <label className="field"><span>Time</span><input value={m.time ?? ""} placeholder="5–6 min" onChange={(e) => update({ ...m, time: e.target.value })} /></label>
              </div>
              <label className="field"><span>Instructions</span><textarea rows={2} value={m.steps ?? ""} onChange={(e) => update({ ...m, steps: e.target.value })} /></label>
            </>
          )}
        />
      </Section>

      <Section title="Product details" hint="Each block only appears on the site when filled in.">
        <label className="field">
          <span>Product benefits <small>one per line</small></span>
          <textarea rows={4} value={form.benefitsText} onChange={(e) => set("benefitsText", e.target.value)} />
        </label>
        <div className="grid2">
          <label className="field"><span>Shelf life</span><input value={form.shelfLife ?? ""} placeholder="12 months" onChange={(e) => set("shelfLife", e.target.value)} /></label>
          <label className="field"><span>Storage</span><input value={form.storage ?? ""} placeholder="Keep frozen at -18°C" onChange={(e) => set("storage", e.target.value)} /></label>
        </div>
        <label className="field"><span>Ingredients</span><textarea rows={3} value={form.ingredients ?? ""} onChange={(e) => set("ingredients", e.target.value)} /></label>
        <label className="field"><span>Allergens</span><textarea rows={2} value={form.allergens ?? ""} onChange={(e) => set("allergens", e.target.value)} /></label>

        <h3 className="pform__sub">Nutrition facts</h3>
        <label className="field"><span>Basis</span><input value={form.nutrition.basis} onChange={(e) => set("nutrition", { ...form.nutrition, basis: e.target.value })} /></label>
        <Repeater
          items={form.nutrition.rows}
          onChange={(rows) => set("nutrition", { ...form.nutrition, rows })}
          blank={{ label: "", value: "" }}
          addLabel="Add nutrition row"
          render={(r, update, i) => (
            <div className="row">
              <label className="field"><span>Label</span><input value={r.label} placeholder="Protein" onChange={(e) => update({ ...r, label: e.target.value })} />{err(`nutrition.rows.${i}.label`)}</label>
              <label className="field"><span>Value</span><input value={r.value} placeholder="10.3g" onChange={(e) => update({ ...r, value: e.target.value })} />{err(`nutrition.rows.${i}.value`)}</label>
            </div>
          )}
        />
      </Section>

      <Section title="Trending recipes" hint="Optional. Recipes with steps are also published as Recipe structured data for Google.">
        <Repeater
          items={form.recipes}
          onChange={(v) => set("recipes", v)}
          blank={{ title: "", ingredientsText: "", stepsText: "" }}
          addLabel="Add recipe"
          render={(r, update, i) => (
            <>
              <div className="grid2">
                <label className="field"><span>Title</span><input value={r.title} onChange={(e) => update({ ...r, title: e.target.value })} />{err(`recipes.${i}.title`)}</label>
                <div className="field"><span>Image</span>{imagePicker(r.image, (image) => update({ ...r, image }))}</div>
                <label className="field"><span>Time</span><input value={r.time ?? ""} placeholder="30 mins" onChange={(e) => update({ ...r, time: e.target.value })} /></label>
                <label className="field"><span>Servings</span><input value={r.servings ?? ""} placeholder="2–4" onChange={(e) => update({ ...r, servings: e.target.value })} /></label>
              </div>
              <label className="field"><span>Summary</span><textarea rows={2} value={r.summary ?? ""} onChange={(e) => update({ ...r, summary: e.target.value })} /></label>
              <div className="grid2">
                <label className="field"><span>Ingredients <small>one per line</small></span><textarea rows={5} value={r.ingredientsText} onChange={(e) => update({ ...r, ingredientsText: e.target.value })} /></label>
                <label className="field"><span>Steps <small>one per line</small></span><textarea rows={5} value={r.stepsText} onChange={(e) => update({ ...r, stepsText: e.target.value })} /></label>
              </div>
            </>
          )}
        />
      </Section>

      <Section title="Cooking hacks" hint="Optional quick tips.">
        <Repeater
          items={form.hacks}
          onChange={(v) => set("hacks", v)}
          blank={{ title: "", body: "" }}
          addLabel="Add hack"
          render={(h, update, i) => (
            <>
              <div className="grid2">
                <label className="field"><span>Title</span><input value={h.title} onChange={(e) => update({ ...h, title: e.target.value })} />{err(`hacks.${i}.title`)}</label>
                <div className="field"><span>Image</span>{imagePicker(h.image, (image) => update({ ...h, image }))}</div>
              </div>
              <label className="field"><span>Tip</span><textarea rows={3} value={h.body} onChange={(e) => update({ ...h, body: e.target.value })} />{err(`hacks.${i}.body`)}</label>
            </>
          )}
        />
      </Section>

      <Section title="Where to buy" hint="Optional stores or online shops.">
        <Repeater
          items={form.whereToBuy}
          onChange={(v) => set("whereToBuy", v)}
          blank={{ name: "" }}
          addLabel="Add store"
          render={(s, update, i) => (
            <div className="row">
              <label className="field"><span>Store name</span><input value={s.name} onChange={(e) => update({ ...s, name: e.target.value })} />{err(`whereToBuy.${i}.name`)}</label>
              <label className="field"><span>Link</span><input type="url" value={s.url ?? ""} placeholder="https://" onChange={(e) => update({ ...s, url: e.target.value })} />{err(`whereToBuy.${i}.url`)}</label>
            </div>
          )}
        />
      </Section>

      <Section title="FAQs" hint="Optional questions and answers about this product.">
        <Repeater
          items={form.faqs}
          onChange={(v) => set("faqs", v)}
          blank={{ question: "", answer: "" }}
          addLabel="Add question"
          render={(f, update, i) => (
            <>
              <label className="field"><span>Question</span><input value={f.question} onChange={(e) => update({ ...f, question: e.target.value })} />{err(`faqs.${i}.question`)}</label>
              <label className="field"><span>Answer</span><textarea rows={3} value={f.answer} onChange={(e) => update({ ...f, answer: e.target.value })} />{err(`faqs.${i}.answer`)}</label>
            </>
          )}
        />
      </Section>

      <Section title="Search engine overrides" hint="Optional. By default the name and short description are used.">
        <label className="field">
          <span>SEO title <small>{(form.seo.title ?? "").length}/70</small></span>
          <input maxLength={70} value={form.seo.title ?? ""} onChange={(e) => set("seo", { ...form.seo, title: e.target.value })} />
        </label>
        <label className="field">
          <span>Meta description <small>{(form.seo.description ?? "").length}/170</small></span>
          <textarea rows={2} maxLength={170} value={form.seo.description ?? ""} onChange={(e) => set("seo", { ...form.seo, description: e.target.value })} />
        </label>
      </Section>

      <div className="pform__bar">
        <Link href="/admin" className="abtn abtn--ghost">Cancel</Link>
        <button className="abtn abtn--primary" disabled={saving || busy}>{saving ? "Saving…" : product ? "Save changes" : "Create product"}</button>
      </div>
    </form>
  );
}

function move<T>(arr: T[], i: number, dir: number) {
  const next = [...arr];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="pform__section">
      <legend>{title}</legend>
      {hint && <p className="pform__hint">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Repeater<T>({ items, onChange, blank, addLabel, render }: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: T;
  addLabel: string;
  render: (item: T, update: (item: T) => void, index: number) => React.ReactNode;
}) {
  return (
    <div className="repeater">
      {items.map((item, i) => (
        <div className="repeater__item" key={i}>
          <div className="repeater__body">{render(item, (next) => onChange(items.map((x, k) => (k === i ? next : x))), i)}</div>
          <div className="repeater__tools">
            <button type="button" className="abtn abtn--icon" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} aria-label="Move up">↑</button>
            <button type="button" className="abtn abtn--icon" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} aria-label="Move down">↓</button>
            <button type="button" className="abtn abtn--icon abtn--danger" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => onChange([...items, { ...blank }])}>+ {addLabel}</button>
    </div>
  );
}
