"use server";
import { z } from "zod";
import { escapeHtml, mailConfigured, sendMail } from "@/lib/mail";

export type ContactState =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Partial<Record<"name" | "email" | "message", string>>; values?: Record<string, string> }
  | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name is too long."),
  email: z.email("Please enter a valid email address.").max(200),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(5000, "Message is too long (max 5000 characters)."),
});

// Humans take a few seconds to fill the form; instant submissions are bots
const MIN_FILL_MS = 3000;

export async function sendContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? ""),
  };

  // Spam traps: a hidden field only bots fill in, and a minimum time on the page.
  // Pretend success so bots get no signal to adapt to, but log it so a dropped message can be traced.
  const startedAt = Number(formData.get("startedAt"));
  const trap = formData.get("hp_antar_check")
    ? "hidden field filled"
    : !startedAt
      ? "missing start time"
      : Date.now() - startedAt < MIN_FILL_MS
        ? `submitted in ${Date.now() - startedAt}ms`
        : null;
  if (trap) {
    console.warn(`[contact] dropped as spam (${trap}) from ${values.email || "no email"}`);
    return { ok: true };
  }

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: NonNullable<Extract<ContactState, { ok: false }>["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof fieldErrors;
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, fieldErrors, values };
  }
  const { name, email, message } = parsed.data;

  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] SMTP not configured (restart the dev server after editing .env.local) — message not sent:\n", { name, email, message });
      return { ok: true };
    }
    console.error("[contact] SMTP is not configured");
    return { ok: false, error: "Sorry, the contact form isn't available right now. Please email us directly.", values };
  }

  try {
    await sendMail({
      subject: `Website enquiry from ${name.replace(/[\r\n]+/g, " ")}`,
      replyTo: `"${name.replace(/["\r\n]+/g, "")}" <${email}>`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
  } catch (e) {
    console.error("[contact] sending failed", e);
    return { ok: false, error: "Sorry, your message couldn't be sent. Please try again in a moment or email us directly.", values };
  }
  return { ok: true };
}
