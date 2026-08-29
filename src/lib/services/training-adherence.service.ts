import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { TrainingBlockInput } from "@/lib/validators/training-template";
import type { Database, Json } from "@/types/database";

export type AdherenceStatus = "abaixo" | "proximo" | "acima" | "nao_informado";

export interface AdherenceMetric {
  planned: number | null;
  actual: number | null;
  status: AdherenceStatus;
}

export interface TrainingAdherenceItem {
  assignmentId: string;
  executionId: string;
  title: string;
  recordedAt: string;
  distance: AdherenceMetric;
  duration: AdherenceMetric;
  rpe: number | null;
  note: string | null;
}

type TrainingJoin = Pick<
  Database["public"]["Tables"]["treinos"]["Row"],
  "titulo" | "estrutura"
>;
type ExecutionJoin = Pick<
  Database["public"]["Tables"]["execucoes_treino"]["Row"],
  | "id"
  | "distancia_real_metros"
  | "duracao_real_minutos"
  | "observacao_atleta"
  | "registrado_em"
  | "rpe"
>;
type AssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "id"
> & {
  treinos: TrainingJoin | TrainingJoin[] | null;
  execucoes_treino: ExecutionJoin | ExecutionJoin[] | null;
};

function first<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function extractBlocks(estrutura: Json): TrainingBlockInput[] | null {
  if (!estrutura || typeof estrutura !== "object" || Array.isArray(estrutura)) return null;
  const blocks = estrutura.blocos;
  return Array.isArray(blocks) ? (blocks as TrainingBlockInput[]) : null;
}

export function compareMetric(planned: number | null, actual: number | null): AdherenceMetric {
  if (planned === null || actual === null || planned <= 0) {
    return { planned, actual, status: "nao_informado" };
  }

  const ratio = actual / planned;
  return {
    planned,
    actual,
    status: ratio < 0.85 ? "abaixo" : ratio > 1.15 ? "acima" : "proximo",
  };
}

export function getPlannedTotals(blocks: TrainingBlockInput[]) {
  const durationMinutes = blocks.reduce(
    (total, block) => total + (block.duracaoMinutos ?? 0),
    0,
  );
  const distanceMeters = blocks.reduce(
    (total, block) =>
      total + (block.distanciaMetros ?? 0) * (block.repeticoes ?? 1),
    0,
  );

  return {
    durationMinutes: durationMinutes || null,
    distanceMeters: distanceMeters || null,
  };
}

export async function getTrainerAthleteTrainingAdherence(
  user: SessionUser,
  athleteId: string,
): Promise<{ data: TrainingAdherenceItem[] } | { error: string }> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos_atletas")
    .select("id, treinos(titulo, estrutura), execucoes_treino(id, distancia_real_metros, duracao_real_minutos, observacao_atleta, registrado_em, rpe)")
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", athleteId)
    .eq("status", "concluido")
    .order("concluido_em", { ascending: false })
    .limit(8);

  if (error || !data) return { error: "Não foi possível carregar a aderência dos treinos." };

  const items = (data as AssignmentRow[]).flatMap((assignment) => {
    const training = first(assignment.treinos);
    const execution = first(assignment.execucoes_treino);
    const blocks = training ? extractBlocks(training.estrutura) : null;
    if (!training || !execution || !blocks) return [];

    const planned = getPlannedTotals(blocks);
    return [{
      assignmentId: assignment.id,
      executionId: execution.id,
      title: training.titulo,
      recordedAt: execution.registrado_em,
      distance: compareMetric(planned.distanceMeters, execution.distancia_real_metros),
      duration: compareMetric(planned.durationMinutes, execution.duracao_real_minutos),
      rpe: execution.rpe,
      note: execution.observacao_atleta,
    }];
  });

  return { data: items };
}
