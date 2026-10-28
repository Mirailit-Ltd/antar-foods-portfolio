import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="admin-login">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/antar-logo.webp" alt="Antar" width={140} height={87} />
      <h1>Admin</h1>
      <LoginForm />
    </main>
  );
}
