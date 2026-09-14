"use client";

import { useActionState } from "react";
import { createStudentAccessInvitationAction, type StudentAccessInvitationActionState } from "@/app/(dashboard)/treinador/atletas/student-invitation-actions";

const initialState: StudentAccessInvitationActionState = {};

export function StudentAccessInvitation({ studentId, hasEmail }: { studentId: string; hasEmail: boolean }) {
  const [state, action, pending] = useActionState(createStudentAccessInvitationAction, initialState);
  if (!hasEmail) return <span className="dashboard-list-detail">Inclua um e-mail para gerar o acesso.</span>;
  return <div className="invitation-link-actions"><form action={action}><input type="hidden" name="studentId" value={studentId} /><button className="button button-secondary" type="submit" disabled={pending}>{pending ? "Gerando…" : "Gerar acesso"}</button></form>{state.invitationUrl ? <a className="button button-ghost" href={state.invitationUrl}>Abrir convite</a> : null}{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}</div>;
}
