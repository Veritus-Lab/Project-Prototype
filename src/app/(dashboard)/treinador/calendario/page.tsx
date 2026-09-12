import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listClasses, listClassMeetings } from "@/lib/services/class.service";
import { listClassMemberships } from "@/lib/services/class.service";
import { listStudents } from "@/lib/services/student.service";
import { ClassManagement } from "@/components/dashboard/class-management";

export const metadata = { title: "Turmas — FLERNK" };

export default async function ClassesPage() {
  await requireRole("socio", "professor");
  const [classesResult, meetingsResult, membershipsResult, studentsResult] = await Promise.all([listClasses(), listClassMeetings(), listClassMemberships(), listStudents()]);
  const classes = "data" in classesResult ? classesResult.data ?? [] : [];
  const meetings = "data" in meetingsResult ? meetingsResult.data ?? [] : [];
  const memberships = "data" in membershipsResult ? membershipsResult.data ?? [] : [];
  const students = "data" in studentsResult ? studentsResult.data ?? [] : [];

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
    </div>
  );
}
