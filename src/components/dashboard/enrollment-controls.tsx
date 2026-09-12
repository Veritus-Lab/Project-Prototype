"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changeEnrollmentStatusAction, createEnrollmentAction } from "@/app/(dashboard)/treinador/atletas/enrollment-actions";
import type { StudentEnrollment } from "@/lib/services/student.service";

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = {};
const statusLabels = { active: "Ativa", suspended: "Suspensa", ended: "Encerrada" } as const;

export function EnrollmentControls({ studentId, enrollment }: { studentId: string; enrollment: StudentEnrollment | null }) {
  const [createState, createAction, creating] = useActionState(createEnrollmentAction, initialState);
  const [statusState, statusAction, changing] = useActionState(changeEnrollmentStatusAction, initialState);

  if (!enrollment) return <form action={createAction} className="enrollment-inline-form"><input type="hidden" name="studentId" value={studentId} /><label><span className="sr-only">Início da matrícula</span><input className="input" name="startsOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><Button type="submit" variant="secondary" disabled={creating}>{creating ? "Ativando..." : "Ativar matrícula"}</Button>{createState.error ? <span className="form-error" role="alert">{createState.error}</span> : null}</form>;

  return <div className="enrollment-inline-form"><span className={`status-badge status-${enrollment.status}`}>{statusLabels[enrollment.status]}</span>{enrollment.status !== "ended" ? <form action={statusAction}><input type="hidden" name="enrollmentId" value={enrollment.id} /><label><span className="sr-only">Nova situação</span><select className="input" name="status" defaultValue={enrollment.status}><option value="active">Ativa</option><option value="suspended">Suspensa</option><option value="ended">Encerrada</option></select></label><input className="input" name="reason" placeholder="Motivo (obrigatório ao suspender)" maxLength={500} /><Button type="submit" variant="secondary" disabled={changing}>{changing ? "Salvando..." : "Atualizar"}</Button>{statusState.error ? <span className="form-error" role="alert">{statusState.error}</span> : null}</form> : null}</div>;
}
