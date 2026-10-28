import "server-only";
import nodemailer from "nodemailer";
import { site } from "./site";

/*
 * Outgoing mail over SMTP — works with Brevo, Amazon SES, Gmail (app password), or any mail host.
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM; messages go to CONTACT_TO_EMAIL (default: site email).
 */
export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export async function sendMail(msg: { subject: string; text: string; html: string; replyTo?: string }) {
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM || `"${site.name} website" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO_EMAIL || site.email,
    ...msg,
  });
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
