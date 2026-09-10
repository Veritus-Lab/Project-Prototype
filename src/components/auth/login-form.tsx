"use client";

import { useActionState } from "react";

import { signInAction } from "@/app/(auth)/login/actions";
import { initialLoginActionState } from "@/app/(auth)/login/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialLoginActionState,
  );

  return (
    <form className="login-form" action={formAction} noValidate>
      <p className="field-hint">Acesse a gestão da FLERNK com seus dados cadastrados.</p>

      <div className="form-field">
        <label htmlFor="email">E-mail</label>
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
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.senha) || undefined}
          aria-describedby={state.fieldErrors?.senha ? "senha-error" : undefined}
          required
        />
        <div id="senha-error"><FieldError errors={state.fieldErrors?.senha} /></div>
      </div>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
