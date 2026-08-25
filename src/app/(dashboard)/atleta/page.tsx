import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getAthleteDashboardData } from "@/lib/services/dashboard.service";

export const metadata = {
  title: "Painel do atleta — FLERNK",
};

export default async function AtletaDashboard() {
  const user = await requireRole("atleta");
  const { metrics, trainings } = await getAthleteDashboardData(user);

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do atleta</p>
      <h1 className="dashboard-title">Olá, {user.nome}</h1>
      <p className="dashboard-subtitle">
        Acompanhe seus treinos e a sua evolução da semana.
      </p>

      <div className="dashboard-cards">
        {metrics.map((metric) => (
          <Card key={metric.label} elevated>
            <h3>{metric.label}</h3>
            <p className="dashboard-card-value">{metric.value}</p>
            <p className="dashboard-card-hint">{metric.hint}</p>
          </Card>
        ))}
      </div>

      <section className="dashboard-section">
        <h2>Treinos atribuídos</h2>
        {trainings.length > 0 ? (
          <ul className="dashboard-list">
            {trainings.map((treino) => (
              <li key={treino.id}>
                <span className="dashboard-list-title">{treino.titulo}</span>
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
