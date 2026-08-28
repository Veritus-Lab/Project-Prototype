import Link from "next/link";

import { AthleteOperationalForm } from "@/components/dashboard/athlete-operational-form";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getTrainerAthleteDetail } from "@/lib/services/athlete.service";
import { createServerClient } from "@/lib/supabase/server";

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
  const supabase = await createServerClient();
  const { data: executions } = await supabase
    .from("execucoes_treino")
    .select("id, rpe, duracao_real_minutos, distancia_real_metros, desconforto_regiao, desconforto_intensidade, registrado_em")
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", athlete.id)
    .order("registrado_em", { ascending: false })
    .limit(5);

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
          <h2>Dados operacionais</h2>
          <AthleteOperationalForm
            athleteId={athlete.id}
            profile={athlete.perfilOperacional}
          />
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

        <Card elevated>
          <h2>Histórico de execução</h2>
          {executions?.length ? <ul className="dashboard-list">{executions.map((execution) => <li key={execution.id}><span className="dashboard-list-title">RPE {execution.rpe ?? "não informado"}</span><span className="dashboard-list-when">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(execution.registrado_em))}</span><span className="dashboard-list-detail">{execution.duracao_real_minutos ? `${execution.duracao_real_minutos} min` : "Duração não informada"}{execution.distancia_real_metros ? ` · ${execution.distancia_real_metros} m` : ""}</span>{execution.desconforto_regiao ? <span className="dashboard-list-detail">Desconforto: {execution.desconforto_regiao} ({execution.desconforto_intensidade}/10)</span> : null}</li>)}</ul> : <p className="dashboard-empty-state">Nenhuma execução registrada.</p>}
        </Card>
      </section>
    </div>
  );
}
