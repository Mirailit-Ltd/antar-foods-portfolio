import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { catalogSchema, type Catalog } from "./product-schema";

/*
 * The catalog lives in public/data/products.json and images in public/products/.
 * - local mode (no GitHub env vars): read/write those files directly with fs. Used for `npm run dev`.
 * - github mode: read/write the same paths in the GitHub repo through the Git Data API, as one commit
 *   per save. Amplify sees the commit and rebuilds, which publishes the change.
 */

const DATA_PATH = "public/data/products.json";

export type Upload = { path: string; data: Buffer }; // path relative to the repo root, e.g. public/products/x.webp
export type Mutation = { catalog: Catalog; uploads?: Upload[]; deletes?: string[] };

const github = () => {
  const token = process.env.GITHUB_TOKEN;
  // Accept "owner/repo" or a pasted URL like https://github.com/owner/repo.git
  const repo = process.env.GITHUB_REPO?.trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");
  return token && repo ? { token, repo, branch: process.env.GITHUB_BRANCH || "main" } : null;
};

export const storageMode = (): "github" | "local" => (github() ? "github" : "local");

export async function readCatalog(): Promise<Catalog> {
  let raw: string;
  if (storageMode() === "github") {
    const file = await ghRaw(DATA_PATH);
    if (!file) throw new Error(`${DATA_PATH} was not found on the "${github()!.branch}" branch of ${github()!.repo}. Push the project to GitHub first.`);
    raw = file.toString("utf8");
  } else raw = await fs.readFile(abs(DATA_PATH), "utf8");
  return catalogSchema.parse(JSON.parse(raw));
}

/** Reads a file under public/ (e.g. "products/x.webp") — lets the admin preview images that aren't deployed yet. */
export async function readPublicFile(rel: string): Promise<Buffer | null> {
  const p = `public/${rel}`;
  if (storageMode() === "github") return ghRaw(p);
  try {
    return await fs.readFile(abs(p));
  } catch {
    return null;
  }
}

/** Reads the latest catalog, applies `mutate` and saves everything in one go. Retries once if the branch moved meanwhile. */
export async function updateCatalog(message: string, mutate: (catalog: Catalog) => Mutation | Promise<Mutation>) {
  for (let attempt = 0; ; attempt++) {
    const result = await mutate(await readCatalog());
    const catalog = catalogSchema.parse(result.catalog);
    const json = JSON.stringify(catalog, null, 2) + "\n";
    try {
      if (storageMode() === "github") await ghCommit(message, json, result.uploads ?? [], result.deletes ?? []);
      else await localWrite(json, result.uploads ?? [], result.deletes ?? []);
      return catalog;
    } catch (e) {
      if (e instanceof RefMovedError && attempt === 0) continue;
      throw e;
    }
  }
}

/* ---------- local ---------- */

function abs(rel: string) {
  const root = process.cwd();
  // Ignore for file tracing: in production (github mode) this is never used, so don't bundle the project into the server
  const p = path.resolve(/*turbopackIgnore: true*/ root, rel);
  if (!p.startsWith(path.join(root, "public") + path.sep)) throw new Error(`Refusing to touch ${rel}`);
  return p;
}

async function localWrite(json: string, uploads: Upload[], deletes: string[]) {
  for (const u of uploads) {
    await fs.mkdir(path.dirname(abs(u.path)), { recursive: true });
    await fs.writeFile(abs(u.path), u.data);
  }
  // Write to a temp file and rename so a crash can never leave half-written JSON
  const tmp = abs(`${DATA_PATH}.${randomUUID()}.tmp`);
  await fs.writeFile(tmp, json);
  await fs.rename(tmp, abs(DATA_PATH));
  for (const d of deletes) await fs.rm(abs(d), { force: true });
}

/* ---------- GitHub ---------- */

class RefMovedError extends Error {}

async function gh(pathname: string, init: RequestInit & { accept?: string } = {}) {
  const cfg = github()!;
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}${pathname}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: init.accept ?? "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  return res;
}

async function ghJson<T>(pathname: string, init?: RequestInit) {
  const res = await gh(pathname, init);
  if (res.status === 404 || res.status === 401 || res.status === 403) {
    throw new Error(
      `GitHub ${init?.method ?? "GET"} ${pathname} failed (${res.status}). Check GITHUB_REPO ("owner/repo"), GITHUB_BRANCH, ` +
        `and that GITHUB_TOKEN has "Contents: Read and write" access to this repository.`
    );
  }
  if (!res.ok) throw new Error(`GitHub ${init?.method ?? "GET"} ${pathname} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

async function ghRaw(p: string): Promise<Buffer | null> {
  const { branch } = github()!;
  // Read at the exact head commit: branch-name reads can be served stale for a short while after a save
  const ref = await ghJson<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const res = await gh(`/contents/${p.split("/").map(encodeURIComponent).join("/")}?ref=${ref.object.sha}`, {
    accept: "application/vnd.github.raw+json",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read ${p} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ghCommit(message: string, json: string, uploads: Upload[], deletes: string[]) {
  const { branch } = github()!;
  const ref = await ghJson<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  const parent = await ghJson<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);

  const blob = (content: string, encoding: "utf-8" | "base64") =>
    ghJson<{ sha: string }>("/git/blobs", { method: "POST", body: JSON.stringify({ content, encoding }) });

  const tree = [
    { path: DATA_PATH, mode: "100644", type: "blob", sha: (await blob(json, "utf-8")).sha },
    ...(await Promise.all(
      uploads.map(async (u) => ({ path: u.path, mode: "100644", type: "blob", sha: (await blob(u.data.toString("base64"), "base64")).sha }))
    )),
    ...deletes.map((d) => ({ path: d, mode: "100644", type: "blob", sha: null })),
  ];

  const newTree = await ghJson<{ sha: string }>("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await ghJson<{ sha: string }>("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  const res = await gh(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  if (res.status === 422) throw new RefMovedError("Branch moved during save");
  if (!res.ok) throw new Error(`GitHub update ref failed: ${res.status} ${await res.text()}`);
}
