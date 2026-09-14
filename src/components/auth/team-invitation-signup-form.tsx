"use client";

import { useActionState } from "react";

import { createTeamAccountAction } from "@/app/(auth)/convite/equipe/[token]/actions";
import {
  initialAcceptTeamInvitationActionState,
  type AcceptTeamInvitationActionState,
} from "@/app/(auth)/convite/equipe/[token]/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="field-error" role="alert">{errors[0]}</p> : null;
}

export function TeamInvitationSignupForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<AcceptTeamInvitationActionState, FormData>(
    createTeamAccountAction,
    initialAcceptTeamInvitationActionState,
  );

  return (
    <form action={formAction} className="signup-form" noValidate>
      <input type="hidden" name="token" value={token} />
      <label htmlFor="nome">Seu nome</label>
      <Input id="nome" name="nome" autoComplete="name" required aria-invalid={Boolean(state.fieldErrors?.nome) || undefined} />
      <FieldError errors={state.fieldErrors?.nome} />
      <label htmlFor="email">E-mail do convite</label>
      <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email) || undefined} />
      <FieldError errors={state.fieldErrors?.email} />
      <label htmlFor="senha">Senha</label>
      <Input id="senha" name="senha" type="password" autoComplete="new-password" required aria-invalid={Boolean(state.fieldErrors?.senha) || undefined} />
      <p className="field-hint">Use pelo menos 8 caracteres, incluindo uma letra e um número.</p>
      <FieldError errors={state.fieldErrors?.senha} />
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.confirmationRequired ? <p className="field-hint" role="status">Enviamos um link de confirmação para seu e-mail. Abra-o para concluir o acesso à equipe.</p> : null}
      <Button type="submit" disabled={isPending}>{isPending ? "Criando acesso…" : "Criar acesso"}</Button>
    </form>
  );
}
