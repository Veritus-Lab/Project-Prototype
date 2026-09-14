"use client";

import { useActionState } from "react";
import { createStudentAccountAction, type StudentInvitationActionState } from "@/app/(auth)/convite/aluno/[token]/actions";

const initialState: StudentInvitationActionState = {};

export function StudentInvitationSignupForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(createStudentAccountAction, initialState);
  return <form action={action} className="signup-form" noValidate><input type="hidden" name="token" value={token} /><label htmlFor="email">E-mail do convite</label><input id="email" name="email" type="email" className="input" autoComplete="email" required /><label htmlFor="senha">Senha</label><input id="senha" name="senha" type="password" className="input" autoComplete="new-password" required /><p className="field-hint">Use pelo menos 8 caracteres, incluindo uma letra e um número.</p>{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}{state.confirmationRequired ? <p className="field-hint" role="status">Enviamos um link de confirmação. Abra-o para ativar seu acesso.</p> : null}<button className="button button-primary" type="submit" disabled={pending}>{pending ? "Criando acesso…" : "Criar acesso"}</button></form>;
}
