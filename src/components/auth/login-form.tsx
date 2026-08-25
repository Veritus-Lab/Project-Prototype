"use client";

import { useActionState, useState } from "react";

import { signInAction } from "@/app/(auth)/login/actions";
import { initialLoginActionState } from "@/app/(auth)/login/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PapelPreferencia = "atleta" | "treinador";

const preferenciaLead: Record<PapelPreferencia, string> = {
  atleta: "Acompanhe seus treinos e converse com o seu treinador.",
  treinador: "Organize os treinos e acompanhe os seus atletas.",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) {
    return null;
  }

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialLoginActionState,
  );
  const [preferencia, setPreferencia] =
    useState<PapelPreferencia>("treinador");

  function handlePreferenciaTeclas(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    setPreferencia((atual) =>
      atual === "treinador" ? "atleta" : "treinador",
    );
  }

  return (
    <form className="login-form" action={formAction} noValidate>
      <p className="field-hint" aria-live="polite">
        {preferenciaLead[preferencia]}
      </p>

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

      <div
        className="role-preference"
        role="radiogroup"
        aria-label="Como você acessa a plataforma?"
        onKeyDown={handlePreferenciaTeclas}
      >
        {/* Visual preference only: no `name`, so nothing is ever submitted
            and authorization always comes from the persisted profile. */}
        <label className={preferencia === "treinador" ? "is-active" : undefined}>
          <input
            type="radio"
            checked={preferencia === "treinador"}
            onChange={() => setPreferencia("treinador")}
          />
          Treinador
        </label>
        <label className={preferencia === "atleta" ? "is-active" : undefined}>
          <input
            type="radio"
            checked={preferencia === "atleta"}
            onChange={() => setPreferencia("atleta")}
          />
          Atleta
        </label>
      </div>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
