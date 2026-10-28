"use client";
import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="admin-card">
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {state?.error && <p className="admin-error" role="alert">{state.error}</p>}
      <button className="abtn abtn--primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
