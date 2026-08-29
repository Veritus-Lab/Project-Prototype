import Link from "next/link";

import { TrainingExecutionForm } from "@/components/dashboard/training-execution-form";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Treino - FLERNK" };

export default async function AthleteTrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("atleta");
  const { id } = await params;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos_atletas")
    .select("id, status, agendado_para, timezone, observacao_treinador, treinos(titulo, descricao)")
    .eq("id", id)
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return <div className="dashboard-page"><p className="eyebrow">Meus treinos</p><h1 className="dashboard-title">Treino não encontrado</h1><p className="dashboard-subtitle">Este treino não está disponível para sua conta.</p><Link className="dashboard-link" href="/atleta/treinos">Voltar para meus treinos</Link></div>;
  }

  const training = Array.isArray(data.treinos) ? data.treinos[0] : data.treinos;
  const scheduledAt = data.agendado_para
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short", timeZone: data.timezone ?? "UTC" }).format(new Date(data.agendado_para))
    : "Sem data programada";

  return <div className="dashboard-page athlete-training-detail"><p className="eyebrow">Meus treinos</p><h1 className="dashboard-title">{training?.titulo ?? "Treino"}</h1><p className="dashboard-subtitle">{scheduledAt}</p><section className="athlete-training-detail-grid"><Card elevated><h2>Prescrição</h2><p>{data.observacao_treinador ?? training?.descricao ?? "Seu treinador não adicionou observações para este treino."}</p></Card><Card elevated><h2>Status</h2><p className="athlete-training-status">{data.status.replaceAll("_", " ")}</p><TrainingExecutionForm assignmentId={data.id} status={data.status as "atribuido" | "em_andamento" | "concluido" | "cancelado"} /></Card></section><Link className="dashboard-link" href="/atleta/treinos">Voltar para meus treinos</Link></div>;
}
