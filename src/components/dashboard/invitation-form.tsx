"use client";

import { useActionState, useState } from "react";

import {
  createInvitationAction,
} from "@/app/(dashboard)/treinador/convites/actions";
import {
  initialInvitationActionState,
  type InvitationActionState,
} from "@/app/(dashboard)/treinador/convites/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) {
    return null;
  }

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function InvitationForm({
  initialState = initialInvitationActionState,
}: {
  initialState?: InvitationActionState;
}) {
  const [state, formAction, isPending] = useActionState(
    createInvitationAction,
    initialState,
  );
  const [copyFeedback, setCopyFeedback] = useState("");

  async function copyLink() {
    if (!state.createdLink) {
      return;
    }

    await navigator.clipboard?.writeText(state.createdLink);
    setCopyFeedback("Link copiado");
  }

  return (
    <form className="invitation-form" action={formAction} noValidate>
      <div className="form-field">
        <label htmlFor="email">E-mail do atleta</label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          required
        />
        <div id="email-error"><FieldError errors={state.fieldErrors?.email} /></div>
      </div>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Gerando…" : "Gerar convite"}
      </Button>

      {state.createdLink ? (
        <section className="invitation-created" aria-live="polite">
          <p>Link criado para {state.createdEmail}</p>
          <label htmlFor="created-link">Link do convite</label>
          <div className="invitation-copy">
            <Input id="created-link" readOnly value={state.createdLink} />
            <Button type="button" variant="secondary" onClick={copyLink}>
              Copiar link
            </Button>
          </div>
          {copyFeedback ? <p className="field-hint">{copyFeedback}</p> : null}
        </section>
      ) : null}
    </form>
  );
}
