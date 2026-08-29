import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface AthleteFeedAssignment {
  id: string;
  title: string;
  detail: string;
  when: string;
  status: TrainingAssignmentStatus;
  isToday: boolean;
  scheduledAt: string;
}

export type TrainingAssignmentStatus =
  | "atribuido"
  | "em_andamento"
  | "concluido"
  | "cancelado";

export interface AthleteDailyFeedData {
  priority: AthleteFeedAssignment | null;
  recent: AthleteFeedAssignment[];
}

type TrainingJoin = Pick<
  Database["public"]["Tables"]["treinos"]["Row"],
  "titulo" | "descricao" | "origem"
>;

type AssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  | "id"
  | "status"
  | "atribuido_em"
  | "agendado_para"
  | "timezone"
  | "observacao_treinador"
> & {
  treinos: TrainingJoin | TrainingJoin[] | null;
};

const feedError = "Nao foi possivel carregar seu treino de hoje.";
const trainingAssignmentStatuses = new Set<TrainingAssignmentStatus>([
  "atribuido",
  "em_andamento",
  "concluido",
  "cancelado",
]);

function isTrainingAssignmentStatus(value: string): value is TrainingAssignmentStatus {
  return trainingAssignmentStatuses.has(value as TrainingAssignmentStatus);
}

function normalizeTrainingJoin(row: AssignmentRow) {
  return Array.isArray(row.treinos) ? row.treinos[0] : row.treinos;
}

function dateKey(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(value);
}

function formatWhen(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function mapAssignment(
  row: AssignmentRow,
  now: Date,
): AthleteFeedAssignment | null {
  if (!row.agendado_para) return null;
  if (!isTrainingAssignmentStatus(row.status)) return null;

  const timeZone = row.timezone ?? "UTC";
  const training = normalizeTrainingJoin(row);

  return {
    id: row.id,
    title: training?.titulo ?? "Treino sem título",
    detail:
      row.observacao_treinador?.trim() ||
      training?.descricao?.trim() ||
      "Treino agendado",
    when: formatWhen(row.agendado_para, timeZone),
    status: row.status,
    isToday: dateKey(new Date(row.agendado_para), timeZone) === dateKey(now, timeZone),
    scheduledAt: row.agendado_para,
  };
}

export async function getAthleteDailyFeed(
  user: SessionUser,
  now = new Date(),
): Promise<{ data: AthleteDailyFeedData } | { error: string }> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos_atletas")
    .select(
      "id, status, atribuido_em, agendado_para, timezone, observacao_treinador, treinos(titulo, descricao, origem)",
    )
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .not("agendado_para", "is", null)
    .order("agendado_para", { ascending: true });

  if (error) return { error: feedError };

  const assignments = (data as AssignmentRow[] | null | undefined ?? [])
    .map((row) => mapAssignment(row, now))
    .filter((assignment): assignment is AthleteFeedAssignment => assignment !== null);
  const priority =
    assignments.find((assignment) => assignment.isToday) ??
    assignments.find((assignment) => new Date(assignment.scheduledAt).getTime() >= now.getTime()) ??
    null;

  return {
    data: {
      priority,
      recent: assignments
        .filter((assignment) => assignment.id !== priority?.id)
        .sort(
          (left, right) =>
            new Date(right.scheduledAt).getTime() -
            new Date(left.scheduledAt).getTime(),
        )
        .slice(0, 3),
    },
  };
}
