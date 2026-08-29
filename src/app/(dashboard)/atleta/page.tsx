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
    <div className="dashboard-page">
      <p className="eyebrow">Painel do atleta</p>
      <h1 className="dashboard-title">Olá, {user.nome}</h1>
      <p className="dashboard-subtitle">
        Acompanhe seus treinos e a sua evolução da semana.
      </p>
      <InstallAppButton />

      <div className="dashboard-cards">
        {metrics.map((metric) => (
          <Card key={metric.label} elevated>
            <h3>{metric.label}</h3>
            <p className="dashboard-card-value">{metric.value}</p>
            <p className="dashboard-card-hint">{metric.hint}</p>
          </Card>
        ))}
      </div>

      {"error" in feedResult ? (
        <p className="form-error athlete-daily-feed-error" role="alert">
          {feedResult.error}
        </p>
      ) : (
        <AthleteDailyFeed feed={feedResult.data} />
      )}

      {"error" in equipmentResult ? (
        <p className="form-error athlete-daily-feed-error" role="alert">
          {equipmentResult.error}
        </p>
      ) : (
        <AthleteEquipmentPanel data={equipmentResult.data} />
      )}

      <section className="dashboard-section">
        <h2>Treinos atribuídos</h2>
        {trainings.length > 0 ? (
          <ul className="dashboard-list">
            {trainings.map((treino) => (
              <li key={treino.id}>
                <Link className="dashboard-list-title" href="/atleta/treinos">
                  {treino.titulo}
                </Link>
                <span className="dashboard-list-when">{treino.quando}</span>
                <span className="dashboard-list-detail">{treino.detalhe}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-empty-state">
            Nenhum treino atribuído ainda.
          </p>
        )}
      </section>
    </div>
  );
}
