import { AthleteDailyFeed } from "@/components/dashboard/athlete-daily-feed";
import { AthleteEquipmentPanel } from "@/components/dashboard/athlete-equipment-panel";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getAthleteDashboardData } from "@/lib/services/dashboard.service";
import { getAthleteDailyFeed } from "@/lib/services/athlete-feed.service";
import { getAthleteEquipment } from "@/lib/services/athlete-equipment.service";

export const metadata = {
  title: "Painel do atleta — FLERNK",
};

export default async function AtletaDashboard() {
  const user = await requireRole("atleta");
  const [dashboard, feedResult, equipmentResult] = await Promise.all([
    getAthleteDashboardData(user),
    getAthleteDailyFeed(user),
    getAthleteEquipment(user),
  ]);
  const { metrics, trainings } = dashboard;

  return (
    <div className="dashboard-page athlete-dashboard-v2">
      <header className="athlete-dashboard-heading">
        <div>
          <p className="eyebrow">Painel do atleta</p>
          <h1 className="dashboard-title">Olá, {user.nome}</h1>
          <p className="dashboard-subtitle">
            Foco hoje, consistência amanhã.
          </p>
        </div>
        <InstallAppButton />
      </header>

      <section className="athlete-metric-strip" aria-label="Resumo dos seus treinos">
        {metrics.map((metric) => (
          <Card key={metric.label} elevated className="athlete-metric-card">
            <h2>{metric.label}</h2>
            <p className="athlete-metric-value">{metric.value}</p>
            <p>{metric.hint}</p>
          </Card>
        ))}
      </section>

      <div className="athlete-dashboard-layout">
        <div className="athlete-dashboard-primary">
          {"error" in feedResult ? (
            <p className="form-error athlete-daily-feed-error" role="alert">
              {feedResult.error}
            </p>
          ) : (
            <AthleteDailyFeed feed={feedResult.data} />
          )}
        </div>

        <aside className="athlete-dashboard-side" aria-label="Agenda de treinos">
          <section className="athlete-side-panel" aria-labelledby="athlete-upcoming-title">
            <div className="dashboard-section-heading">
              <h2 id="athlete-upcoming-title">Próximos treinos</h2>
              <Link href="/atleta/treinos">Ver todos</Link>
            </div>
            {trainings.length > 0 ? (
              <ul className="athlete-upcoming-list">
                {trainings.map((treino) => (
                  <li key={treino.id}>
                    <Link href="/atleta/treinos">
                      <strong>{treino.titulo}</strong>
                      <span>{treino.quando}</span>
                      <small>{treino.detalhe}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty-state">Nenhum treino atribuído ainda.</p>
            )}
          </section>

          <section className="athlete-side-panel athlete-calendar-shortcut" aria-labelledby="athlete-calendar-title">
            <div>
              <p className="eyebrow">Planejamento</p>
              <h2 id="athlete-calendar-title">Seu calendário</h2>
              <p>Consulte as datas dos treinos e registre sua execução.</p>
            </div>
            <Link className="button button-secondary" href="/atleta/calendario">
              Abrir calendário
            </Link>
          </section>
        </aside>
      </div>

      {"error" in equipmentResult ? (
        <p className="form-error athlete-daily-feed-error" role="alert">
          {equipmentResult.error}
        </p>
      ) : (
        <AthleteEquipmentPanel data={equipmentResult.data} />
      )}
    </div>
  );
}
