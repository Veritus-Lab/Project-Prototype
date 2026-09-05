"use client";

import { useActionState } from "react";

import { createInvitationAction } from "@/app/(dashboard)/treinador/convites/actions";
import { initialInvitationActionState } from "@/app/(dashboard)/treinador/convites/state";
import { Button } from "@/components/ui/button";

export function InvitationLinkButton({ email }: { email: string }) {
  const [state, action, pending] = useActionState(createInvitationAction, initialInvitationActionState);

  return (
    <div className="invitation-link-actions">
      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Enviando…" : "Reenviar e-mail"}
        </Button>
      </form>
      {state.createdEmail ? <p className="field-hint" role="status">E-mail reenviado.</p> : null}
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    </div>
  );
}
