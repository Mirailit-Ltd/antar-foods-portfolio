import { isAdmin } from "@/lib/auth";
import { readPublicFile } from "@/lib/storage";

const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif" };

/** Admin-only image preview: reads from the repo, so freshly saved images show before the site has rebuilt. */
export async function GET(_req: Request, { params }: RouteContext<"/api/admin/media/[...path]">) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const parts = (await params).path;
  const type = TYPES[parts.at(-1)?.split(".").pop()?.toLowerCase() ?? ""];
  if (!type || !["products", "images"].includes(parts[0]) || parts.some((p) => p === ".." || p.startsWith("."))) {
    return new Response("Not found", { status: 404 });
  }
  const file = await readPublicFile(parts.join("/"));
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), { headers: { "Content-Type": type, "Cache-Control": "private, max-age=300" } });
}
