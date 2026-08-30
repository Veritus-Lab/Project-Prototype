"use client";

import { Button } from "@/components/ui/button";

export function DestructiveActionForm({ action, fieldName, value, label, confirmation }: { action: (formData: FormData) => void | Promise<void>; fieldName: string; value: string; label: string; confirmation: string }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm(confirmation)) event.preventDefault(); }}><input type="hidden" name={fieldName} value={value} /><Button type="submit" variant="ghost" className="button-danger" aria-label={label}>{label}</Button></form>;
}
