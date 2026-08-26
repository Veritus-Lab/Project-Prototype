"use client";

import { useActionState } from "react";

import {
  updateAthleteOperationalProfileAction,
} from "@/lib/actions/athlete.actions";
import {
  initialAthleteOperationalActionState,
  type AthleteOperationalActionState,
} from "@/lib/actions/athlete.state";
import type { TrainerAthleteOperationalProfile } from "@/lib/services/athlete.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) {
    return null;
  }

  return <p className="field-error" role="alert">{errors[0]}</p>;
}

export function AthleteOperationalForm({
  athleteId,
  initialState = initialAthleteOperationalActionState,
  profile,
}: {
  athleteId: string;
  initialState?: AthleteOperationalActionState;
  profile: TrainerAthleteOperationalProfile | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAthleteOperationalProfileAction,
    initialState,
  );

  return (
    <form className="athlete-operational-form" action={formAction} noValidate>
      <input type="hidden" name="athleteId" value={athleteId} />

      <div className="form-field">
        <label htmlFor="telefone">Telefone</label>
        <Input
          id="telefone"
          name="telefone"
          autoComplete="tel"
          defaultValue={profile?.telefone ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.telefone) || undefined}
          aria-describedby={
            state.fieldErrors?.telefone ? "telefone-error" : undefined
          }
        />
        <div id="telefone-error">
          <FieldError errors={state.fieldErrors?.telefone} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="objetivo">Objetivo</label>
        <Input
          id="objetivo"
          name="objetivo"
          defaultValue={profile?.objetivo ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.objetivo) || undefined}
          aria-describedby={
            state.fieldErrors?.objetivo ? "objetivo-error" : undefined
          }
        />
        <div id="objetivo-error">
          <FieldError errors={state.fieldErrors?.objetivo} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="nivel">Nível</label>
        <select
          id="nivel"
          name="nivel"
          className="input"
          defaultValue={profile?.nivel ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.nivel) || undefined}
          aria-describedby={state.fieldErrors?.nivel ? "nivel-error" : undefined}
        >
          <option value="">Não informado</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
        <div id="nivel-error">
          <FieldError errors={state.fieldErrors?.nivel} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="dataNascimento">Data de nascimento</label>
        <Input
          id="dataNascimento"
          name="dataNascimento"
          type="date"
          defaultValue={profile?.dataNascimento ?? ""}
          aria-invalid={
            Boolean(state.fieldErrors?.dataNascimento) || undefined
          }
          aria-describedby={
            state.fieldErrors?.dataNascimento
              ? "dataNascimento-error"
              : undefined
          }
        />
        <div id="dataNascimento-error">
          <FieldError errors={state.fieldErrors?.dataNascimento} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contatoEmergenciaNome">Contato de emergência</label>
        <Input
          id="contatoEmergenciaNome"
          name="contatoEmergenciaNome"
          defaultValue={profile?.contatoEmergenciaNome ?? ""}
          aria-invalid={
            Boolean(state.fieldErrors?.contatoEmergenciaNome) || undefined
          }
          aria-describedby={
            state.fieldErrors?.contatoEmergenciaNome
              ? "contatoEmergenciaNome-error"
              : undefined
          }
        />
        <div id="contatoEmergenciaNome-error">
          <FieldError errors={state.fieldErrors?.contatoEmergenciaNome} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contatoEmergenciaTelefone">
          Telefone de emergência
        </label>
        <Input
          id="contatoEmergenciaTelefone"
          name="contatoEmergenciaTelefone"
          autoComplete="tel"
          defaultValue={profile?.contatoEmergenciaTelefone ?? ""}
          aria-invalid={
            Boolean(state.fieldErrors?.contatoEmergenciaTelefone) || undefined
          }
          aria-describedby={
            state.fieldErrors?.contatoEmergenciaTelefone
              ? "contatoEmergenciaTelefone-error"
              : undefined
          }
        />
        <div id="contatoEmergenciaTelefone-error">
          <FieldError errors={state.fieldErrors?.contatoEmergenciaTelefone} />
        </div>
      </div>

      <div className="form-field athlete-operational-notes">
        <label htmlFor="observacoesInternas">Observações internas</label>
        <textarea
          id="observacoesInternas"
          name="observacoesInternas"
          className="input"
          defaultValue={profile?.observacoesInternas ?? ""}
          rows={5}
          aria-invalid={
            Boolean(state.fieldErrors?.observacoesInternas) || undefined
          }
          aria-describedby={
            state.fieldErrors?.observacoesInternas
              ? "observacoesInternas-error"
              : undefined
          }
        />
        <div id="observacoesInternas-error">
          <FieldError errors={state.fieldErrors?.observacoesInternas} />
        </div>
      </div>

      {state.fieldErrors?.athleteId ? (
        <p className="form-error" role="alert">
          {state.fieldErrors.athleteId[0]}
        </p>
      ) : null}
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? (
        <p className="form-success" role="status">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar dados"}
      </Button>
    </form>
  );
}
