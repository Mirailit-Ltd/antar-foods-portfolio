const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
export const numberWord = (n: number) => WORDS[n] ?? String(n);

/** "10.3g" -> { value: 10.3, decimals: 1, unit: "g" } so it can be animated as a counter. */
export function parseQuantity(s: string) {
  const m = s.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { value: Number(m[1]), decimals: m[1].split(".")[1]?.length ?? 0, unit: m[2] };
}

export const paragraphs = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
