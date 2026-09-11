"use client";

import { useActionState } from "react";
import { createStudentAction } from "@/app/(dashboard)/treinador/atletas/actions";

const initialState: { error?: string; success?: boolean } = {};

export function StudentForm() {
  const [state, action, pending] = useActionState(createStudentAction, initialState);
  return <form action={action} className="invitation-form">
    <label htmlFor="name">Nome</label><input id="name" name="name" className="input" required />
    <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" className="input" />
    <label htmlFor="phone">Telefone</label><input id="phone" name="phone" className="input" />
    <label htmlFor="birthDate">Data de nascimento</label><input id="birthDate" name="birthDate" type="date" className="input" />
    <label htmlFor="notes">Observações</label><textarea id="notes" name="notes" className="input" rows={3} />
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="field-hint" role="status">Aluno cadastrado.</p> : null}
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Cadastrando…" : "Cadastrar aluno"}</button>
  </form>;
}
