import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface TrainerWeeklyScheduleEvent {
  id: string;
  athleteId: string;
  athleteName: string;
  status: string;
  time: string;
  trainingTitle: string;
}

export interface TrainerWeeklyScheduleDay {
  dateKey: string;
  dayNumber: string;
  events: TrainerWeeklyScheduleEvent[];
  isToday: boolean;
  weekday: string;
}

export interface TrainerWeeklySchedule {
  days: TrainerWeeklyScheduleDay[];
  timezone: string;
}

export type TrainerWeeklyScheduleResult =
  | { data: TrainerWeeklySchedule }
  | { error: string };

type CalendarAthleteRow = Pick<
  Database["public"]["Tables"]["atletas"]["Row"],
  "id"
> & {
  profiles:
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">[]
    | null;
};

type CalendarAssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "id" | "atleta_id" | "agendado_para" | "status"
> & {
  treinos:
    | Pick<Database["public"]["Tables"]["treinos"]["Row"], "titulo">
    | Pick<Database["public"]["Tables"]["treinos"]["Row"], "titulo">[]
    | null;
};

const assignmentStatusLabels: Record<
  Database["public"]["Tables"]["treinos_atletas"]["Row"]["status"],
  string
> = {
  atribuido: "Atribuído",
  cancelado: "Cancelado",
  concluido: "Concluído",
  em_andamento: "Em andamento",
};

function getProfileName(row: CalendarAthleteRow) {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return profile?.nome ?? "Atleta sem nome";
}

function getTrainingTitle(row: CalendarAssignmentRow) {
  const training = Array.isArray(row.treinos) ? row.treinos[0] : row.treinos;

  return training?.titulo ?? "Treino sem título";
}

function dateKey(date: Date) {
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}

function zonedCalendarDate(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(value);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
}

function localDateTimeToIso(date: Date, timeZone: string) {
  const localDateTime = `${dateKey(date)}T00:00`;
  const [calendarDate, time] = localDateTime.split("T");
  const [year, month, day] = calendarDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const estimatedUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(estimatedUtc))
    .find((part) => part.type === "timeZoneName")?.value;
  const offsetMatch = offsetName?.match(/^GMT([+-])(\d{2}):(\d{2})$/);

  if (offsetName === "GMT") {
    return new Date(estimatedUtc).toISOString();
  }

  if (!offsetMatch) {
    return null;
  }

  const offsetMinutes =
    (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3])) *
    (offsetMatch[1] === "+" ? 1 : -1);

  return new Date(estimatedUtc - offsetMinutes * 60_000).toISOString();
}

export function getTimeZoneDateKey(value: Date, timeZone: string) {
  return dateKey(zonedCalendarDate(value, timeZone));
}

function buildWeekDays(
  referenceDate: Date,
  timeZone: string,
): TrainerWeeklyScheduleDay[] {
  const today = zonedCalendarDate(referenceDate, timeZone);
  const weekStart = new Date(today);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(today.getUTCDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);

    return {
      dateKey: dateKey(date),
      dayNumber: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        timeZone: "UTC",
      }).format(date),
      events: [],
      isToday: dateKey(date) === dateKey(today),
      weekday: new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
        weekday: "short",
      })
        .format(date)
        .replace(".", ""),
    } satisfies TrainerWeeklyScheduleDay;
  });
}

export function getTrainerWeekRange(referenceDate: Date, timeZone: string) {
  const days = buildWeekDays(referenceDate, timeZone);
  const weekStart = localDateTimeToIso(
    new Date(`${days[0].dateKey}T00:00:00.000Z`),
    timeZone,
  );
  const nextWeekDate = new Date(`${days[6].dateKey}T00:00:00.000Z`);
  nextWeekDate.setUTCDate(nextWeekDate.getUTCDate() + 1);

  return {
    days,
    nextWeekStart: localDateTimeToIso(nextWeekDate, timeZone),
    weekStart,
  };
}

export async function getTrainerWeeklySchedule(
  user: SessionUser,
  referenceDate = new Date(),
): Promise<TrainerWeeklyScheduleResult> {
  const supabase = await createServerClient();
  const { data: assessoria, error: assessoriaError } = await supabase
    .from("assessorias")
    .select("timezone")
    .eq("id", user.assessoriaId)
    .maybeSingle();

  if (assessoriaError || !assessoria) {
    return { error: "Não foi possível carregar a agenda da assessoria." };
  }

  const timezone = assessoria.timezone;
  const { days, nextWeekStart, weekStart } = getTrainerWeekRange(referenceDate, timezone);

  if (!weekStart || !nextWeekStart) {
    return { error: "Não foi possível calcular a semana da agenda." };
  }

  const { data: athletes, error: athletesError } = await supabase
    .from("atletas")
    .select("id, profiles!atletas_profile_fkey(nome)")
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id);

  if (athletesError || !athletes) {
    return { error: "Não foi possível carregar os atletas da agenda." };
  }

  const athleteNames = new Map(
    (athletes as CalendarAthleteRow[]).map((athlete) => [athlete.id, getProfileName(athlete)]),
  );

  if (!athleteNames.size) {
    return { data: { days, timezone } };
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("treinos_atletas")
    .select("id, atleta_id, agendado_para, status, treinos(titulo)")
    .eq("assessoria_id", user.assessoriaId)
    .in("atleta_id", [...athleteNames.keys()])
    .gte("agendado_para", weekStart)
    .lt("agendado_para", nextWeekStart)
    .order("agendado_para", { ascending: true });

  if (assignmentsError || !assignments) {
    return { error: "Não foi possível carregar os treinos agendados." };
  }

  const daysByKey = new Map(days.map((day) => [day.dateKey, day]));

  for (const assignment of assignments as CalendarAssignmentRow[]) {
    if (!assignment.agendado_para || !athleteNames.has(assignment.atleta_id)) {
      continue;
    }

    const scheduledAt = new Date(assignment.agendado_para);
    const scheduledDay = daysByKey.get(getTimeZoneDateKey(scheduledAt, timezone));

    if (!scheduledDay) {
      continue;
    }

    scheduledDay.events.push({
      athleteId: assignment.atleta_id,
      athleteName: athleteNames.get(assignment.atleta_id) ?? "Atleta",
      id: assignment.id,
      status: assignmentStatusLabels[assignment.status],
      time: new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      }).format(scheduledAt),
      trainingTitle: getTrainingTitle(assignment),
    });
  }

  return { data: { days, timezone } };
}
