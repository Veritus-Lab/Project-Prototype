import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { CompleteTrainingInput } from "@/lib/validators/training-execution";

type Result = { data: true } | { error: string };

export async function startTraining(user: SessionUser, assignmentId: string): Promise<Result> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos_atletas")
    .update({ status: "em_andamento", iniciado_em: new Date().toISOString() })
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .eq("id", assignmentId)
    .eq("status", "atribuido")
    .select("id")
    .maybeSingle();

  return error || !data ? { error: "Não foi possível iniciar este treino." } : { data: true };
}

export async function completeTraining(user: SessionUser, input: CompleteTrainingInput): Promise<Result> {
  const supabase = await createServerClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("treinos_atletas")
    .select("id")
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .eq("id", input.assignmentId)
    .eq("status", "em_andamento")
    .maybeSingle();

  if (assignmentError || !assignment) return { error: "Este treino não está disponível para conclusão." };

  const { error: executionError } = await supabase.from("execucoes_treino").insert({
    assessoria_id: user.assessoriaId,
    treino_atleta_id: input.assignmentId,
    atleta_id: user.id,
    status: "concluido",
    rpe: input.rpe ?? null,
    duracao_real_minutos: input.durationMinutes ?? null,
    distancia_real_metros: input.distanceMeters ?? null,
    observacao_atleta: input.note || null,
    desconforto_regiao: input.discomfortRegion ?? null,
    desconforto_intensidade: input.discomfortIntensity ?? null,
  });
  if (executionError) return { error: "Não foi possível registrar a execução." };

  const { error: updateError } = await supabase
    .from("treinos_atletas")
    .update({ status: "concluido", concluido_em: new Date().toISOString() })
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .eq("id", input.assignmentId);

  return updateError ? { error: "Execução registrada, mas não foi possível concluir o treino." } : { data: true };
}
