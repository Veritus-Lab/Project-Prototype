"use client";

import { useActionState } from "react";

import { acceptInvitationAction } from "@/app/(auth)/convite/[token]/actions";
import {
  initialAcceptInvitationActionState,
  type AcceptInvitationActionState,
} from "@/app/(auth)/convite/[token]/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) {
    return null;
  }

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function InvitationSignupForm({
  token,
  maskedEmail,
  initialState = initialAcceptInvitationActionState,
}: {
  token: string;
  maskedEmail: string;
  initialState?: AcceptInvitationActionState;
}) {
  const [state, formAction, isPending] = useActionState(
    acceptInvitationAction,
    initialState,
  );

  return (
    <form className="signup-form" action={formAction} noValidate>
      <p className="field-hint">Convite para {maskedEmail}</p>
      <input type="hidden" name="token" value={token} />

      <div className="form-field">
        <label htmlFor="nome">Seu nome</label>
        <Input
          id="nome"
          name="nome"
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors?.nome) || undefined}
          aria-describedby={state.fieldErrors?.nome ? "nome-error" : undefined}
          required
        />
        <div id="nome-error"><FieldError errors={state.fieldErrors?.nome} /></div>
      </div>

      <div className="form-field">
        <label htmlFor="email">E-mail do convite</label>
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

      <div className="form-field">
        <label htmlFor="senha">Senha</label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          aria-describedby={
            state.fieldErrors?.senha ? "senha-ajuda senha-error" : "senha-ajuda"
          }
          aria-invalid={Boolean(state.fieldErrors?.senha) || undefined}
          required
        />
        <p id="senha-ajuda" className="field-hint">
          Use pelo menos 8 caracteres, incluindo uma letra e um número.
        </p>
        <div id="senha-error"><FieldError errors={state.fieldErrors?.senha} /></div>
      </div>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      {state.confirmationRequired ? (
        <p className="field-hint" role="status">
          Enviamos um link de confirmação para seu e-mail. Abra-o para concluir
          seu acesso de atleta.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando acesso…" : "Criar acesso"}
      </Button>
    </form>
  );
}
