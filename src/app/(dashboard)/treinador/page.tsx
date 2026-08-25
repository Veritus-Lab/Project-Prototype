import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { trainerDashboardDemo } from "@/lib/demo/dashboard";

export const metadata = {
  title: "Painel do treinador — FLERNK",
};

export default async function TreinadorDashboard() {
  const user = await requireRole("treinador");
  const { metrics, proximosTreinos } = trainerDashboardDemo;

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">Olá, {user.nome}</h1>
      <p className="dashboard-subtitle">
        Acompanhe a sua assessoria e organize os treinos da semana.
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
        <h2>Próximos treinos</h2>
        <ul className="dashboard-list">
          {proximosTreinos.map((treino) => (
            <li key={treino.titulo}>
              <span className="dashboard-list-title">{treino.titulo}</span>
              <span className="dashboard-list-when">{treino.quando}</span>
              <span className="dashboard-list-detail">{treino.detalhe}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="dashboard-demo-note">
        Dados de demonstração — a integração real chega na Etapa 2.
      </p>
    </div>
  );
}
