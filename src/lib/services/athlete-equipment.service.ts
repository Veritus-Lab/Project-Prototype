import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { EquipmentFormInput } from "@/lib/validators/athlete-equipment";
import type { Database } from "@/types/database";

export type EquipmentAlert = "acompanhar" | "limite_atingido" | null;

export interface AthleteEquipment {
  id: string;
  name: string;
  active: boolean;
  startedOn: string | null;
  mileageMeters: number;
  mileageLimitMeters: number | null;
  progressPercent: number | null;
  alert: EquipmentAlert;
}

export interface AvailableExecution {
  id: string;
  recordedAt: string;
  distanceMeters: number | null;
}

export interface AthleteEquipmentData {
  equipment: AthleteEquipment[];
  availableExecutions: AvailableExecution[];
}

type ShoeRow = Database["public"]["Tables"]["tenis_atletas"]["Row"];
type ExecutionJoin = Pick<
  Database["public"]["Tables"]["execucoes_treino"]["Row"],
  "id" | "registrado_em" | "distancia_real_metros"
>;
type EquipmentExecutionRow = {
  tenis_id: string;
  execucoes_treino: ExecutionJoin | ExecutionJoin[] | null;
};

export function getEquipmentProgress(
  initialMileageMeters: number,
  linkedDistanceMeters: number,
  mileageLimitMeters: number | null,
) {
  const mileageMeters = initialMileageMeters + linkedDistanceMeters;
  const progressPercent = mileageLimitMeters
    ? Math.round((mileageMeters / mileageLimitMeters) * 100)
    : null;
  const alert: EquipmentAlert =
    progressPercent === null
      ? null
      : progressPercent >= 100
        ? "limite_atingido"
        : progressPercent >= 80
          ? "acompanhar"
          : null;

  return { mileageMeters, progressPercent, alert };
}

export async function getAthleteEquipment(
  user: SessionUser,
): Promise<{ data: AthleteEquipmentData } | { error: string }> {
  const supabase = await createServerClient();
  const [{ data: shoes, error: shoesError }, { data: links, error: linksError }, { data: executions, error: executionsError }] = await Promise.all([
    supabase.from("tenis_atletas").select("id, nome, ativo, inicio_em, quilometragem_inicial_metros, limite_rodagem_metros").eq("assessoria_id", user.assessoriaId).eq("atleta_id", user.id).order("ativo", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("tenis_execucoes").select("tenis_id, execucoes_treino(id, registrado_em, distancia_real_metros)").eq("assessoria_id", user.assessoriaId),
    supabase.from("execucoes_treino").select("id, registrado_em, distancia_real_metros, tenis_execucoes(execucao_treino_id)").eq("assessoria_id", user.assessoriaId).eq("atleta_id", user.id).eq("status", "concluido").order("registrado_em", { ascending: false }),
  ]);

  if (shoesError || linksError || executionsError) return { error: "Não foi possível carregar seus equipamentos agora." };

  const linkedDistanceByShoe = new Map<string, number>();
  for (const link of (links ?? []) as EquipmentExecutionRow[]) {
    const execution = Array.isArray(link.execucoes_treino) ? link.execucoes_treino[0] : link.execucoes_treino;
    linkedDistanceByShoe.set(link.tenis_id, (linkedDistanceByShoe.get(link.tenis_id) ?? 0) + (execution?.distancia_real_metros ?? 0));
  }

  return {
    data: {
      equipment: ((shoes ?? []) as Pick<ShoeRow, "id" | "nome" | "ativo" | "inicio_em" | "quilometragem_inicial_metros" | "limite_rodagem_metros">[]).map((shoe) => ({
        id: shoe.id,
        name: shoe.nome,
        active: shoe.ativo,
        startedOn: shoe.inicio_em,
        mileageLimitMeters: shoe.limite_rodagem_metros,
        ...getEquipmentProgress(shoe.quilometragem_inicial_metros, linkedDistanceByShoe.get(shoe.id) ?? 0, shoe.limite_rodagem_metros),
      })),
      availableExecutions: ((executions ?? []) as Array<ExecutionJoin & { tenis_execucoes: { execucao_treino_id: string }[] | null }>).filter((execution) => !execution.tenis_execucoes?.length).map((execution) => ({ id: execution.id, recordedAt: execution.registrado_em, distanceMeters: execution.distancia_real_metros })),
    },
  };
}

export async function createAthleteEquipment(user: SessionUser, input: EquipmentFormInput) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("tenis_atletas").insert({ assessoria_id: user.assessoriaId, atleta_id: user.id, nome: input.name, inicio_em: input.startedOn, quilometragem_inicial_metros: input.initialMileageMeters, limite_rodagem_metros: input.mileageLimitMeters ?? null });
  return error ? { error: "Não foi possível cadastrar o equipamento." } : { data: true as const };
}

export async function deactivateAthleteEquipment(user: SessionUser, equipmentId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("tenis_atletas").update({ ativo: false }).eq("assessoria_id", user.assessoriaId).eq("atleta_id", user.id).eq("id", equipmentId).eq("ativo", true).select("id").maybeSingle();
  return error || !data ? { error: "Não foi possível desativar o equipamento." } : { data: true as const };
}

export async function linkAthleteEquipmentExecution(user: SessionUser, equipmentId: string, executionId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from("tenis_execucoes").insert({ assessoria_id: user.assessoriaId, tenis_id: equipmentId, execucao_treino_id: executionId });
  return error ? { error: "Não foi possível vincular esta execução. Verifique se ela já não está associada." } : { data: true as const };
}
