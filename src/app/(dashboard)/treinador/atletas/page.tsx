import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerAthletes } from "@/lib/services/athlete.service";

export const metadata = {
  title: "Atletas — FLERNK",
};

export default async function TrainerAthletesPage() {
  const user = await requireRole("treinador");
  const result = await listTrainerAthletes(user);
  const athletes = "data" in result && result.data ? result.data : [];

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">Atletas</h1>
      <p className="dashboard-subtitle">
        Acompanhe os atletas vinculados à sua assessoria.
      </p>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Atletas ativos</h2>
          {"error" in result ? (
            <p className="form-error" role="alert">{result.error}</p>
          ) : athletes.length > 0 ? (
            <div className="athlete-list">
              {athletes.map((athlete) => (
                <article className="athlete-row" key={athlete.id}>
                  <div>
                    <p className="athlete-name">{athlete.nome}</p>
                    <p className="dashboard-list-detail">
                      Entrada em {athlete.criadoEm}
                    </p>
                  </div>
                  <div className="athlete-row-actions">
                    <span className="athlete-status">{athlete.vinculo}</span>
                    <Link
                      className="dashboard-link"
                      href={`/treinador/atletas/${athlete.id}`}
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="dashboard-empty-state">
              Nenhum atleta vinculado ainda.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
