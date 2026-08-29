import type { SessionUser } from "@/lib/auth/session";
import {
  getTimeZoneDateKey,
  getTrainerWeekRange,
} from "@/lib/services/trainer-calendar.service";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface TrainerPerformanceMetric {
  hint: string;
  label: string;
  value: string;
}

export interface TrainerPerformanceDay {
  dateKey: string;
  executions: number;
  isToday: boolean;
  weekday: string;
}

export interface TrainerPerformanceData {
  days: TrainerPerformanceDay[];
  metrics: TrainerPerformanceMetric[];
  rpeAverage: string | null;
}

export type TrainerPerformanceResult =
  | { data: TrainerPerformanceData }
  | { error: string };

type ScheduledAssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "agendado_para" | "id" | "status"
>;

type ExecutionRow = Pick<
  Database["public"]["Tables"]["execucoes_treino"]["Row"],
  | "distancia_real_metros"
  | "duracao_real_minutos"
  | "registrado_em"
  | "rpe"
  | "treino_atleta_id"
>;

function formatDistance(meters: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(meters / 1000)} km`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}min`;
}

function emptyData(referenceDate: Date, timezone: string): TrainerPerformanceData {
  const { days } = getTrainerWeekRange(referenceDate, timezone);

  return {
    days: days.map((day) => ({
      dateKey: day.dateKey,
      executions: 0,
      isToday: day.isToday,
      weekday: day.weekday,
    })),
    metrics: [
      { label: "Execuções concluídas", value: "0", hint: "Nenhuma execução registrada nesta semana." },
      { label: "Adesão semanal", value: "—", hint: "Sem treinos programados até agora." },
      { label: "Distância registrada", value: "0 km", hint: "Somente distância informada pelos atletas." },
      { label: "Tempo registrado", value: "0 min", hint: "Somente duração informada pelos atletas." },
    ],
    rpeAverage: null,
  };
}

export async function getTrainerPerformanceData(
  user: SessionUser,
  referenceDate = new Date(),
): Promise<TrainerPerformanceResult> {
  const supabase = await createServerClient();
  const { data: assessoria, error: assessoriaError } = await supabase
    .from("assessorias")
    .select("timezone")
    .eq("id", user.assessoriaId)
    .maybeSingle();

  if (assessoriaError || !assessoria) {
    return { error: "Não foi possível carregar os indicadores de desempenho." };
  }

  const timezone = assessoria.timezone;
  const { days, nextWeekStart, weekStart } = getTrainerWeekRange(referenceDate, timezone);

  if (!weekStart || !nextWeekStart) {
    return { error: "Não foi possível calcular a semana de desempenho." };
  }

  const { data: athletes, error: athletesError } = await supabase
    .from("atletas")
    .select("id")
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id);

  if (athletesError || !athletes) {
    return { error: "Não foi possível carregar os atletas para os indicadores." };
  }

  const athleteIds = athletes.map((athlete) => athlete.id);

  if (!athleteIds.length) {
    return { data: emptyData(referenceDate, timezone) };
  }

  const [assignmentsResult, executionsResult] = await Promise.all([
    supabase
      .from("treinos_atletas")
      .select("id, agendado_para, status")
      .eq("assessoria_id", user.assessoriaId)
      .in("atleta_id", athleteIds)
      .gte("agendado_para", weekStart)
      .lt("agendado_para", nextWeekStart),
    supabase
      .from("execucoes_treino")
      .select("treino_atleta_id, rpe, duracao_real_minutos, distancia_real_metros, registrado_em")
      .eq("assessoria_id", user.assessoriaId)
      .in("atleta_id", athleteIds)
      .eq("status", "concluido")
      .gte("registrado_em", weekStart)
      .lt("registrado_em", nextWeekStart),
  ]);

  if (assignmentsResult.error || executionsResult.error) {
    return { error: "Não foi possível carregar os indicadores de desempenho." };
  }

  const assignments = (assignmentsResult.data ?? []) as ScheduledAssignmentRow[];
  const executions = (executionsResult.data ?? []) as ExecutionRow[];
  const now = referenceDate.getTime();
  const scheduledToDate = assignments.filter(
    (assignment) =>
      assignment.status !== "cancelado" &&
      assignment.agendado_para &&
      new Date(assignment.agendado_para).getTime() <= now,
  );
  const completedAssignmentIds = new Set(executions.map((execution) => execution.treino_atleta_id));
  const completedScheduled = scheduledToDate.filter((assignment) =>
    completedAssignmentIds.has(assignment.id),
  ).length;
  const adherence = scheduledToDate.length
    ? `${Math.round((completedScheduled / scheduledToDate.length) * 100)}%`
    : "—";
  const totalDistance = executions.reduce(
    (total, execution) => total + (execution.distancia_real_metros ?? 0),
    0,
  );
  const totalDuration = executions.reduce(
    (total, execution) => total + (execution.duracao_real_minutos ?? 0),
    0,
  );
  const rpeValues = executions
    .map((execution) => execution.rpe)
    .filter((rpe): rpe is number => rpe !== null);
  const executionsByDay = new Map<string, number>();

  for (const execution of executions) {
    const key = getTimeZoneDateKey(new Date(execution.registrado_em), timezone);
    executionsByDay.set(key, (executionsByDay.get(key) ?? 0) + 1);
  }

  return {
    data: {
      days: days.map((day) => ({
        dateKey: day.dateKey,
        executions: executionsByDay.get(day.dateKey) ?? 0,
        isToday: day.isToday,
        weekday: day.weekday,
      })),
      metrics: [
        {
          label: "Execuções concluídas",
          value: String(executions.length),
          hint: "Registros concluídos nesta semana.",
        },
        {
          label: "Adesão semanal",
          value: adherence,
          hint: scheduledToDate.length
            ? `${completedScheduled} de ${scheduledToDate.length} treinos previstos até agora.`
            : "Sem treinos programados até agora.",
        },
        {
          label: "Distância registrada",
          value: formatDistance(totalDistance),
          hint: "Somente distância informada pelos atletas.",
        },
        {
          label: "Tempo registrado",
          value: formatDuration(totalDuration),
          hint: "Somente duração informada pelos atletas.",
        },
      ],
      rpeAverage: rpeValues.length
        ? (rpeValues.reduce((total, rpe) => total + rpe, 0) / rpeValues.length).toFixed(1)
        : null,
    },
  };
}
