import Link from "next/link";
import { logout } from "./actions";

export function AdminHeader({ mode }: { mode: "github" | "local" }) {
  return (
    <header className="admin-header">
      <Link href="/admin" className="admin-header__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/antar-logo.webp" alt="" width={64} height={40} />
        <span>Products admin</span>
      </Link>
      <span className={`admin-mode admin-mode--${mode}`} title={mode === "github" ? "Saves are committed to GitHub; the site rebuilds automatically." : "Saves are written to the local project files."}>
        {mode === "github" ? "Live · saves to GitHub" : "Local · saves to files"}
      </span>
      <nav>
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logout}>
          <button className="abtn abtn--ghost">Sign out</button>
        </form>
      </nav>
    </header>
  );
}
