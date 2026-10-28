"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendContact } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, undefined);
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const failed = state && !state.ok ? state : undefined;
  const err = failed?.fieldErrors ?? {};

  useEffect(() => {
    setStartedAt(Date.now());
    // "Wholesale enquiry" links pass ?product=<name> to start the message
    const product = new URLSearchParams(location.search).get("product");
    const message = formRef.current?.elements.namedItem("message") as HTMLTextAreaElement | null;
    if (product && message && !message.value) message.value = `Hello, I'd like to know more about Antar ${product.slice(0, 80)}.\n\n`;
  }, []);

  if (state?.ok) {
    return (
      <div className="cform cform--done" role="status">
        <div className="cform__check" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" /></svg>
        </div>
        <h2>Thank you!</h2>
        <p>Your message is on its way. We usually reply within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="cform" noValidate>
      {failed?.error && (
        <p className="cform__error" role="alert">
          {failed.error}
        </p>
      )}
      <label className="cform__field">
        <span>Name</span>
        <input name="name" autoComplete="name" required maxLength={100} defaultValue={failed?.values?.name} aria-invalid={!!err.name} aria-describedby={err.name ? "err-name" : undefined} />
        {err.name && <em id="err-name">{err.name}</em>}
      </label>
      <label className="cform__field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required maxLength={200} defaultValue={failed?.values?.email} aria-invalid={!!err.email} aria-describedby={err.email ? "err-email" : undefined} />
        {err.email && <em id="err-email">{err.email}</em>}
      </label>
      <label className="cform__field">
        <span>Message</span>
        <textarea name="message" rows={6} required maxLength={5000} defaultValue={failed?.values?.message} aria-invalid={!!err.message} aria-describedby={err.message ? "err-message" : undefined} />
        {err.message && <em id="err-message">{err.message}</em>}
      </label>

      {/* Spam trap: invisible to people, filled in by bots. The name and label must not look like a
          real field ("company", "phone"…), or browser autofill fills it in and real messages get dropped. */}
      <div className="cform__trap" aria-hidden="true">
        <label>
          Leave this empty <input name="hp_antar_check" tabIndex={-1} autoComplete="new-password" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <button className="btn btn--red magnetic cform__submit" disabled={pending}>
        <span>{pending ? "Sending…" : "Send message"}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
  );
}
