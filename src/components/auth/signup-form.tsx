"use client";

import { useActionState } from "react";

import {
  initialSignupActionState,
  signUpTrainerAction,
} from "@/app/(auth)/cadastro/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) {
    return null;
  }

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signUpTrainerAction,
    initialSignupActionState,
  );

  return (
    <form className="signup-form" action={formAction} noValidate>
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
        <label htmlFor="assessoria">Nome da assessoria</label>
        <Input
          id="assessoria"
          name="assessoria"
          autoComplete="organization"
          aria-invalid={Boolean(state.fieldErrors?.assessoria) || undefined}
          aria-describedby={state.fieldErrors?.assessoria ? "assessoria-error" : undefined}
          required
        />
        <div id="assessoria-error"><FieldError errors={state.fieldErrors?.assessoria} /></div>
      </div>

      <div className="form-field">
        <label htmlFor="email">E-mail profissional</label>
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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando conta…" : "Criar minha conta"}
      </Button>
    </form>
  );
}
