import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getTrainerAthleteDetail } from "@/lib/services/athlete.service";

export const metadata = {
  title: "Detalhe do atleta — FLERNK",
};

export default async function TrainerAthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("treinador");
  const { id } = await params;
  const result = await getTrainerAthleteDetail(user, id);

  if ("error" in result) {
    return (
      <div className="dashboard-page">
        <p className="eyebrow">Painel do treinador</p>
        <h1 className="dashboard-title">Atleta não encontrado</h1>
        <p className="dashboard-subtitle">
          Verifique a lista de atletas e tente novamente.
        </p>
        <Link className="dashboard-link" href="/treinador/atletas">
          Voltar para atletas
        </Link>
      </div>
    );
  }

  const athlete = result.data;

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">{athlete.nome}</h1>
      <p className="dashboard-subtitle">Entrada em {athlete.criadoEm}</p>

      <section className="dashboard-section athlete-detail-grid">
        <Card elevated>
          <h2>Resumo</h2>
          <dl className="athlete-detail-list">
            <div>
              <dt>Vínculo</dt>
              <dd>{athlete.vinculo}</dd>
            </div>
            <div>
              <dt>Identificador</dt>
              <dd>{athlete.id}</dd>
            </div>
          </dl>
        </Card>

        <Card elevated>
          <h2>Treinos recentes</h2>
          {athlete.treinosRecentes.length > 0 ? (
            <ul className="dashboard-list">
              {athlete.treinosRecentes.map((training) => (
                <li key={training.id}>
                  <span className="dashboard-list-title">{training.titulo}</span>
                  <span className="dashboard-list-when">{training.status}</span>
                  <span className="dashboard-list-detail">{training.quando}</span>
                  <span className="dashboard-list-detail">{training.detalhe}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty-state">
              Nenhum treino atribuído recentemente.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
