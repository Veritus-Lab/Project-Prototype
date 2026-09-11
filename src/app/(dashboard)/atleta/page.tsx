import Link from "next/link";
import { CalendarDays, CircleDollarSign } from "lucide-react";

import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Meu painel — FLERNK" };

export default async function StudentDashboard() {
  const user = await requireRole("aluno");

  return (
    <div className="dashboard-page">
      <header className="athlete-dashboard-heading">
        <div>
          <p className="eyebrow">Meu acesso</p>
          <h1 className="dashboard-title">Olá, {user.nome}</h1>
          <p className="dashboard-subtitle">
            Consulte suas informações administrativas na FLERNK.
          </p>
        </div>
        <InstallAppButton />
      </header>

      <section className="dashboard-section" aria-label="Áreas do aluno">
        <div className="trainer-quick-actions">
          <Link href="/atleta/calendario">
            <CalendarDays aria-hidden="true" />
            <span>
              <strong>Minha turma</strong>
              <small>Consulte os encontros e sua presença.</small>
            </span>
          </Link>
          <Link href="/atleta/financeiro">
            <CircleDollarSign aria-hidden="true" />
            <span>
              <strong>Meu financeiro</strong>
              <small>Acompanhe cobranças e pagamentos.</small>
            </span>
          </Link>
        </div>
      </section>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Informações da sua assessoria</h2>
          <p className="dashboard-empty-state">
            Esta área reúne sua turma, presença e informações financeiras pessoais.
          </p>
        </Card>
      </section>
    </div>
  );
}
