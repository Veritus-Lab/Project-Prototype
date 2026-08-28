import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { ScheduleTrainingInput } from "@/lib/validators/training-schedule";

export type ScheduleTrainingResult = { data: { createdCount: number } } | { error: string };

function localDateTimeToIso(value: string, timeZone: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const estimatedUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsetPart = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(new Date(estimatedUtc)).find((part) => part.type === "timeZoneName")?.value;
  const match = offsetPart?.match(/^GMT([+-])(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const offsetMinutes = (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "+" ? 1 : -1);
  const result = new Date(estimatedUtc - offsetMinutes * 60_000);

  return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

export async function scheduleTraining(
  user: SessionUser,
  input: ScheduleTrainingInput,
): Promise<ScheduleTrainingResult> {
  const supabase = await createServerClient();
  const { data: assessoria, error: assessoriaError } = await supabase
    .from("assessorias")
    .select("timezone")
    .eq("id", user.assessoriaId)
    .maybeSingle();

  if (assessoriaError || !assessoria) {
    return { error: "Não foi possível carregar o timezone da assessoria." };
  }

  const scheduledFor = localDateTimeToIso(input.scheduledFor, assessoria.timezone);
  if (!scheduledFor || new Date(scheduledFor).getTime() < Date.now() - 60_000) {
    return { error: "Escolha uma data futura para o agendamento." };
  }

  const [{ data: training, error: trainingError }, { data: athletes, error: athletesError }] = await Promise.all([
    supabase
      .from("treinos")
      .select("id")
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .eq("id", input.trainingId)
      .maybeSingle(),
    supabase
      .from("atletas")
      .select("id")
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .in("id", input.athleteIds),
  ]);

  if (trainingError || !training || athletesError || !athletes || athletes.length !== input.athleteIds.length) {
    return { error: "Treino ou atletas não estão disponíveis para agendamento." };
  }

  const { error } = await supabase.from("treinos_atletas").insert(
    input.athleteIds.map((athleteId) => ({
      assessoria_id: user.assessoriaId,
      treino_id: input.trainingId,
      atleta_id: athleteId,
      agendado_para: scheduledFor,
      timezone: assessoria.timezone,
      observacao_treinador: input.note || null,
    })),
  );

  if (error) {
    return { error: "Não foi possível agendar o treino agora." };
  }

  return { data: { createdCount: input.athleteIds.length } };
}
