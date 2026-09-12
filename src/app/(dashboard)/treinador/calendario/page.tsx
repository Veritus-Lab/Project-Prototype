import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listClasses, listClassMeetings } from "@/lib/services/class.service";
import { ClassManagement } from "@/components/dashboard/class-management";

export const metadata = { title: "Turmas — FLERNK" };

export default async function ClassesPage() {
  await requireRole("socio", "professor");
  const [classesResult, meetingsResult] = await Promise.all([listClasses(), listClassMeetings()]);
  const classes = "data" in classesResult ? classesResult.data ?? [] : [];
  const meetings = "data" in meetingsResult ? meetingsResult.data ?? [] : [];

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
          {"error" in classesResult ? <p className="form-error" role="alert">{classesResult.error}</p> : <ClassManagement classes={classes} meetings={meetings} />}
        </Card>
      </section>
    </div>
  );
}
