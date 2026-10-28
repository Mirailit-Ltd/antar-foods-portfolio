import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notfound">
      {/* React hoists this into <head>; Next adds noindex to 404 responses itself */}
      <title>Page not found | Antar Foods</title>
      <p className="eyebrow">
        <span className="dot"></span> 404
      </p>
      <h1>This plate is empty.</h1>
      <p>The page you were looking for doesn&apos;t exist or has moved.</p>
      <div className="notfound__actions">
        <Link href="/" className="btn btn--red">
          <span>Back home</span>
        </Link>
        <Link href="/products" className="btn btn--ghost">
          <span>See all products</span>
        </Link>
      </div>
    </main>
  );
}
