import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Turmas — FLERNK" };

export default async function ClassesPage() {
  await requireRole("socio", "professor");

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
          <p className="dashboard-empty-state">
            O cadastro de turmas e o registro de faltas serão disponibilizados nesta área na próxima etapa.
          </p>
        </Card>
      </section>
    </div>
  );
}
