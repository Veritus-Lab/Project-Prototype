import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listClasses, listClassMeetings } from "@/lib/services/class.service";
import { listClassMemberships } from "@/lib/services/class.service";
import { listStudents } from "@/lib/services/student.service";
import { ClassManagement } from "@/components/dashboard/class-management";
import { AttendanceBatchForm } from "@/components/dashboard/attendance-batch-form";
import { listMeetingAttendance } from "@/lib/services/attendance.service";

export const metadata = { title: "Turmas — FLERNK" };

export default async function ClassesPage({ searchParams }: { searchParams?: Promise<{ chamada?: string }> } = {}) {
  await requireRole("socio", "professor");
  const [classesResult, meetingsResult, membershipsResult, studentsResult] = await Promise.all([listClasses(), listClassMeetings(), listClassMemberships(), listStudents()]);
  const classes = "data" in classesResult ? classesResult.data ?? [] : [];
  const meetings = "data" in meetingsResult ? meetingsResult.data ?? [] : [];
  const memberships = "data" in membershipsResult ? membershipsResult.data ?? [] : [];
  const students = "data" in studentsResult ? studentsResult.data ?? [] : [];
  const query = await searchParams;
  const selectedMeetingId = query?.chamada ?? meetings.find((meeting) => !meeting.canceled_at)?.id;
  const attendanceResult = selectedMeetingId ? await listMeetingAttendance(selectedMeetingId) : null;
  const attendance = attendanceResult && "data" in attendanceResult ? attendanceResult.data : null;

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Gestão operacional</p>
      <h1 className="dashboard-title">Turmas</h1>
      <p className="dashboard-subtitle">
        Acompanhe a organização das turmas e a presença dos alunos.
      </p>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Agenda de turmas</h2>
          {"error" in classesResult ? <p className="form-error" role="alert">{classesResult.error}</p> : <ClassManagement classes={classes} meetings={meetings} students={students} memberships={memberships} />}
        </Card>
      </section>
      <section className="dashboard-section"><Card elevated><h2>Chamada</h2>{meetings.length ? <form method="get" className="dashboard-filter-form"><label htmlFor="chamada">Encontro</label><div><select id="chamada" name="chamada" className="input" defaultValue={selectedMeetingId}>{meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{classes.find((item) => item.id === meeting.class_id)?.name ?? "Turma"} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(meeting.starts_at))}{meeting.canceled_at ? " · cancelado" : ""}</option>)}</select><button className="button button-secondary" type="submit">Abrir</button></div></form> : null}{attendance ? <AttendanceBatchForm meetingId={attendance.meeting.id} disabled={Boolean(attendance.meeting.canceled_at)} students={attendance.students} /> : <p className="dashboard-empty-state">Agende um encontro para realizar a chamada.</p>}</Card></section>
    </div>
  );
}
