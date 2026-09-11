import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Minha turma — FLERNK" };

export default async function StudentClassPage() {
  await requireRole("aluno");

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Minha organização</p>
      <h1 className="dashboard-title">Minha turma</h1>
      <p className="dashboard-subtitle">
        Consulte os encontros da sua turma e seu histórico de presença.
      </p>
      <section className="dashboard-section">
        <Card elevated>
          <h2>Encontros e presença</h2>
          <p className="dashboard-empty-state">
            Os encontros e a presença serão exibidos aqui quando a gestão de turmas for liberada.
          </p>
        </Card>
      </section>
    </div>
  );
}
