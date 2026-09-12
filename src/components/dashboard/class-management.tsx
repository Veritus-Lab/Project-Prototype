"use client";

import { useActionState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  addClassMemberAction,
  cancelClassMeetingAction,
  createClassAction,
  createClassMeetingAction,
} from "@/app/(dashboard)/treinador/calendario/actions";

type ClassRow = { id: string; name: string; description?: string | null };
type Meeting = { id: string; class_id: string; starts_at: string; ends_at: string; canceled_at: string | null; cancellation_reason: string | null };
type Student = { id: string; name: string; enrollment: { id: string; status: "active" | "suspended" | "ended" } | null };
type Membership = { id: string; class_id: string; student_id: string; enrollment_id: string; student_name: string };
type State = { error?: string; success?: boolean };

const initial: State = {};
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function meetingStatus(meeting: Meeting) {
  return meeting.canceled_at ? `Cancelado: ${meeting.cancellation_reason ?? "sem motivo informado"}` : "Agendado";
}

export function ClassManagement({ classes, meetings, students, memberships }: { classes: ReadonlyArray<ClassRow>; meetings: ReadonlyArray<Meeting>; students: ReadonlyArray<Student>; memberships: ReadonlyArray<Membership> }) {
  const [classState, classAction, creatingClass] = useActionState(createClassAction, initial);
  const [meetingState, meetingAction, creatingMeeting] = useActionState(createClassMeetingAction, initial);
  const [memberState, memberAction, addingMember] = useActionState(addClassMemberAction, initial);
  const availableStudents = students.filter((student) => student.enrollment && student.enrollment.status !== "ended");

  const membershipsByClass = useMemo(() => {
    const grouped = new Map<string, Membership[]>();
    memberships.forEach((membership) => grouped.set(membership.class_id, [...(grouped.get(membership.class_id) ?? []), membership]));
    return grouped;
  }, [memberships]);

  const meetingsByClass = useMemo(() => {
    const grouped = new Map<string, Meeting[]>();
    meetings.forEach((meeting) => grouped.set(meeting.class_id, [...(grouped.get(meeting.class_id) ?? []), meeting]));
    return grouped;
  }, [meetings]);

  const classNames = new Map(classes.map((item) => [item.id, item.name]));
  const scheduledMeetings = meetings.filter((meeting) => !meeting.canceled_at).length;

  return (
    <div className="class-management">
      <div className="class-management-summary" aria-label="Resumo das turmas">
        <div className="class-summary-item"><span className="class-summary-value">{classes.length}</span><span className="class-summary-label">turmas</span></div>
        <div className="class-summary-item"><span className="class-summary-value">{memberships.length}</span><span className="class-summary-label">alunos vinculados</span></div>
        <div className="class-summary-item"><span className="class-summary-value">{scheduledMeetings}</span><span className="class-summary-label">encontros agendados</span></div>
      </div>

      <section className="class-overview" aria-labelledby="class-overview-title">
        <div className="class-section-heading"><div><h3 id="class-overview-title">Suas turmas</h3><p className="field-hint">Abra uma turma para consultar os alunos e os próximos encontros.</p></div><span className="class-section-count">{classes.length} {classes.length === 1 ? "turma" : "turmas"}</span></div>
        {classes.length ? <div className="class-overview-grid">{classes.map((item) => {
          const classMemberships = membershipsByClass.get(item.id) ?? [];
          const classMeetings = meetingsByClass.get(item.id) ?? [];
          const nextMeeting = classMeetings.find((meeting) => !meeting.canceled_at);
          return <details className="class-overview-card" key={item.id}>
            <summary><span className="class-overview-card-heading"><span className="class-overview-card-title">{item.name}</span><span className="class-overview-card-meta">{classMemberships.length} {classMemberships.length === 1 ? "aluno" : "alunos"}</span></span><span className="class-overview-card-chevron" aria-hidden="true">⌄</span></summary>
            {item.description ? <p className="class-overview-description">{item.description}</p> : null}
            <div className="class-overview-card-body"><div><p className="class-overview-label">Próximo encontro</p><p className="class-overview-value">{nextMeeting ? dateTime.format(new Date(nextMeeting.starts_at)) : "Ainda não agendado"}</p></div><div><p className="class-overview-label">Alunos vinculados</p>{classMemberships.length ? <ul className="class-member-list">{classMemberships.map((membership) => <li key={membership.id}>{membership.student_name}</li>)}</ul> : <p className="class-overview-value class-overview-muted">Nenhum aluno vinculado</p>}</div></div>
          </details>;
        })}</div> : <p className="dashboard-empty-state">Nenhuma turma cadastrada.</p>}
      </section>

      <section className="class-management-actions" aria-labelledby="class-actions-title">
        <div className="class-section-heading"><div><h3 id="class-actions-title">Ações rápidas</h3><p className="field-hint">Use quando precisar atualizar a estrutura das turmas.</p></div></div>
        <div className="class-actions-grid">
          <details className="class-action-panel"><summary>Nova turma</summary><form action={classAction} className="invitation-form"><label className="form-field"><span>Nome</span><input className="input" name="name" placeholder="Ex.: Adultos manhã" required /></label><label className="form-field"><span>Descrição <small>(opcional)</small></span><textarea className="input" name="description" placeholder="Informações para a equipe" rows={2} /></label><Button type="submit" disabled={creatingClass}>{creatingClass ? "Criando..." : "Criar turma"}</Button>{classState.error ? <p className="form-error" role="alert">{classState.error}</p> : null}</form></details>
          {classes.length ? <details className="class-action-panel"><summary>Agendar encontros</summary><form action={meetingAction} className="invitation-form"><label className="form-field"><span>Turma</span><select className="input" name="classId" required>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className="class-action-fields"><label className="form-field"><span>Início</span><input className="input" name="startsAt" type="datetime-local" required /></label><label className="form-field"><span>Fim</span><input className="input" name="endsAt" type="datetime-local" required /></label></div><label className="form-field"><span>Ocorrências semanais</span><input className="input" name="occurrences" type="number" min={1} max={52} defaultValue={1} required /></label><Button type="submit" disabled={creatingMeeting}>{creatingMeeting ? "Agendando..." : "Agendar"}</Button>{meetingState.error ? <p className="form-error" role="alert">{meetingState.error}</p> : null}</form></details> : null}
          {classes.length && availableStudents.length ? <details className="class-action-panel"><summary>Vincular aluno</summary><form action={memberAction} className="invitation-form"><label className="form-field"><span>Turma</span><select className="input" name="classId" required>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="form-field"><span>Aluno</span><select className="input" name="studentId" required>{availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label><label className="form-field"><span>Matrícula</span><select className="input" name="enrollmentId" required>{availableStudents.map((student) => student.enrollment ? <option key={student.enrollment.id} value={student.enrollment.id}>{student.name}</option> : null)}</select></label><Button type="submit" disabled={addingMember}>{addingMember ? "Vinculando..." : "Vincular aluno"}</Button>{memberState.error ? <p className="form-error" role="alert">{memberState.error}</p> : null}</form></details> : null}
        </div>
      </section>

      <section className="class-meetings" aria-labelledby="class-meetings-title">
        <div className="class-section-heading"><div><h3 id="class-meetings-title">Agenda recente</h3><p className="field-hint">Os últimos encontros aparecem aqui para facilitar ajustes e cancelamentos.</p></div><span className="class-section-count">{meetings.length}</span></div>
        {meetings.length ? <ul className="class-meeting-list">{meetings.map((meeting) => <li key={meeting.id} className={meeting.canceled_at ? "is-canceled" : undefined}><div><span className="class-meeting-title">{classNames.get(meeting.class_id) ?? "Turma"}</span><span className="class-meeting-detail">{dateTime.format(new Date(meeting.starts_at))} · {meetingStatus(meeting)}</span></div>{!meeting.canceled_at ? <form action={cancelClassMeetingAction} className="class-meeting-cancel-form"><input type="hidden" name="meetingId" value={meeting.id} /><input className="input" name="reason" placeholder="Motivo do cancelamento" required /><Button type="submit" variant="secondary">Cancelar</Button></form> : null}</li>)}</ul> : <p className="dashboard-empty-state">Nenhum encontro agendado.</p>}
      </section>
    </div>
  );
}
