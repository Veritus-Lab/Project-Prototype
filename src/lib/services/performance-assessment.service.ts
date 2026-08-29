import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { PerformanceAssessmentInput } from "@/lib/validators/performance-assessment";
import type { Database } from "@/types/database";

export interface PaceZone { label: string; minimum: number; maximum: number; unit: "pace" | "vam"; }
export interface PerformanceAssessment { id: string; assessedOn: string; protocol: string; thresholdPaceSecondsPerKm: number | null; vamMetersPerMinute: number | null; note: string | null; zones: PaceZone[]; }

type AssessmentRow = Database["public"]["Tables"]["testes_desempenho"]["Row"];

const zoneLabels = ["Leve", "Moderado", "Limiar", "Intenso"];

export function getPerformanceZones(
  thresholdPaceSecondsPerKm: number | null,
  vamMetersPerMinute: number | null,
): PaceZone[] {
  const zones: PaceZone[] = [];
  if (thresholdPaceSecondsPerKm) {
    [[30, 60], [10, 30], [-10, 10], [-30, -10]].forEach(([minimum, maximum], index) => zones.push({ label: zoneLabels[index], minimum: thresholdPaceSecondsPerKm + minimum, maximum: thresholdPaceSecondsPerKm + maximum, unit: "pace" }));
  }
  if (vamMetersPerMinute) {
    [[0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1]].forEach(([minimum, maximum], index) => zones.push({ label: zoneLabels[index], minimum: Math.round(vamMetersPerMinute * minimum), maximum: Math.round(vamMetersPerMinute * maximum), unit: "vam" }));
  }
  return zones;
}

function mapAssessment(row: AssessmentRow): PerformanceAssessment {
  return { id: row.id, assessedOn: row.avaliado_em, protocol: row.protocolo, thresholdPaceSecondsPerKm: row.ritmo_limiar_segundos_por_km, vamMetersPerMinute: row.vam_metros_por_min, note: row.observacao, zones: getPerformanceZones(row.ritmo_limiar_segundos_por_km, row.vam_metros_por_min) };
}

export async function getTrainerAthletePerformanceAssessments(user: SessionUser, athleteId: string): Promise<{ data: PerformanceAssessment[] } | { error: string }> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("testes_desempenho").select("id, avaliado_em, protocolo, ritmo_limiar_segundos_por_km, vam_metros_por_min, observacao, assessoria_id, atleta_id, treinador_id, created_at").eq("assessoria_id", user.assessoriaId).eq("atleta_id", athleteId).order("avaliado_em", { ascending: false }).order("created_at", { ascending: false });
  return error || !data ? { error: "Não foi possível carregar as avaliações de desempenho." } : { data: (data as AssessmentRow[]).map(mapAssessment) };
}

export async function createTrainerAthletePerformanceAssessment(user: SessionUser, input: PerformanceAssessmentInput) {
  const supabase = await createServerClient();
  const { data: athlete, error: athleteError } = await supabase.from("atletas").select("id").eq("assessoria_id", user.assessoriaId).eq("id", input.athleteId).eq("treinador_id", user.id).maybeSingle();
  if (athleteError || !athlete) return { error: "Atleta não encontrado." };
  const { error } = await supabase.from("testes_desempenho").insert({ assessoria_id: user.assessoriaId, atleta_id: input.athleteId, treinador_id: user.id, avaliado_em: input.assessedOn, protocolo: input.protocol, ritmo_limiar_segundos_por_km: input.thresholdPaceSecondsPerKm ?? null, vam_metros_por_min: input.vamMetersPerMinute ?? null, observacao: input.note || null });
  return error ? { error: "Não foi possível registrar a avaliação." } : { data: true as const };
}
