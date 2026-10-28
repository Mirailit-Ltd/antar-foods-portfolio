"use client";
import { useFormStatus } from "react-dom";

export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} onClick={(e) => !confirm(message) && e.preventDefault()}>
      {pending ? "…" : children}
    </button>
  );
}
