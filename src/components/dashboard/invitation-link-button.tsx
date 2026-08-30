"use client";

import { useActionState, useState } from "react";

import { createInvitationAction } from "@/app/(dashboard)/treinador/convites/actions";
import { initialInvitationActionState } from "@/app/(dashboard)/treinador/convites/state";
import { Button } from "@/components/ui/button";

export function InvitationLinkButton({ email }: { email: string }) {
  const [state, action, pending] = useActionState(createInvitationAction, initialInvitationActionState);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!state.createdLink) return;
    await navigator.clipboard?.writeText(state.createdLink);
    setCopied(true);
  }

  return <div className="invitation-link-actions"><form action={action}><input type="hidden" name="email" value={email} /><Button type="submit" variant="secondary" disabled={pending}>{pending ? "Gerando..." : "Gerar link"}</Button></form>{state.createdLink ? <><a className="dashboard-link" href={state.createdLink} target="_blank" rel="noreferrer">Abrir convite</a><Button type="button" variant="ghost" onClick={copyLink}>{copied ? "Copiado" : "Copiar"}</Button></> : null}{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}</div>;
}
