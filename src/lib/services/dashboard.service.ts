import { createServerClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/auth/session";
import type { Database } from "@/types/database";

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface DashboardTraining {
  id: string;
  titulo: string;
  quando: string;
  detalhe: string;
}

export interface TrainerAttentionItem {
  athleteId: string;
  athleteName: string;
  reasons: string[];
}

export interface TrainerScheduledTraining {
  id: string;
  athleteName: string;
  title: string;
  when: string;
  status: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  trainings: DashboardTraining[];
  attention: TrainerAttentionItem[];
  scheduledTrainings: TrainerScheduledTraining[];
}

type TrainingRow = Pick<
  Database["public"]["Tables"]["treinos"]["Row"],
  "id" | "titulo" | "descricao" | "origem" | "created_at"
>;

type AssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "id" | "status" | "atribuido_em" | "agendado_para" | "timezone" | "observacao_treinador"
> & {
  treinos:
    | Pick<
        Database["public"]["Tables"]["treinos"]["Row"],
        "titulo" | "descricao" | "origem"
      >
    | Pick<
        Database["public"]["Tables"]["treinos"]["Row"],
        "titulo" | "descricao" | "origem"
      >[]
    | null;
};

type TrainerScheduledAssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "id" | "atleta_id" | "status" | "agendado_para" | "timezone" | "observacao_treinador"
> & {
  treinos:
    | Pick<Database["public"]["Tables"]["treinos"]["Row"], "titulo" | "descricao" | "origem">
    | Pick<Database["public"]["Tables"]["treinos"]["Row"], "titulo" | "descricao" | "origem">[]
    | null;
};

type TrainerAthleteNameRow = Pick<
  Database["public"]["Tables"]["atletas"]["Row"],
  "id"
> & {
  profiles:
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">[]
    | null;
};

type PastAssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "atleta_id" | "agendado_para"
>;

type OverdueChargeRow = Pick<
  Database["public"]["Tables"]["cobrancas"]["Row"],
  "atleta_id"
>;

const originLabels = {
  ia: "IA",
  importado: "importado",
  manual: "manual",
} satisfies Record<Database["public"]["Enums"]["origem_treino"], string>;

const assignmentStatusLabels: Record<AssignmentRow["status"], string> = {
  atribuido: "Atribuído",
  cancelado: "Cancelado",
  concluido: "Concluído",
  em_andamento: "Em andamento",
};

function formatDateLabel(prefix: string, value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return prefix;
  }

  return `${prefix} ${new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(date)}`;
}

function countValue(count: number | null) {
  return String(count ?? 0);
}

function trainingDetail(
  descricao: string | null,
  origem: Database["public"]["Enums"]["origem_treino"],
) {
  return descricao?.trim() ? descricao : `Origem: ${originLabels[origem]}`;
}

function normalizeTrainingJoin(row: Pick<AssignmentRow, "treinos">) {
  return Array.isArray(row.treinos) ? row.treinos[0] : row.treinos;
}

function normalizeAthleteProfile(row: TrainerAthleteNameRow) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
}

export async function getTrainerDashboardData(
  user: SessionUser,
): Promise<DashboardData> {
  const supabase = await createServerClient();
  const now = new Date();

  const [
    athletesResult,
    trainingsResult,
    invitationsResult,
    recentTrainingsResult,
    nextAssignmentsResult,
    athleteNamesResult,
    overdueChargesResult,
    pastAssignmentsResult,
  ] = await Promise.all([
    supabase
      .from("atletas")
      .select("*", { count: "exact", head: true })
      .eq("assessoria_id", user.assessoriaId),
    supabase
      .from("treinos")
      .select("*", { count: "exact", head: true })
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id),
    supabase
      .from("convites_atletas")
      .select("*", { count: "exact", head: true })
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .eq("status", "pendente")
      .is("usado_em", null)
      .is("revogado_em", null)
      .gt("expira_em", now.toISOString()),
    supabase
      .from("treinos")
      .select("id, titulo, descricao, origem, created_at")
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("treinos_atletas")
      .select("id, atleta_id, status, agendado_para, timezone, observacao_treinador, treinos(titulo, descricao, origem)")
      .eq("assessoria_id", user.assessoriaId)
      .eq("status", "atribuido")
      .gte("agendado_para", now.toISOString())
      .order("agendado_para", { ascending: true })
      .limit(3),
    supabase
      .from("atletas")
      .select("id, profiles!atletas_profile_fkey(nome)")
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id),
    supabase
      .from("cobrancas")
      .select("atleta_id")
      .eq("assessoria_id", user.assessoriaId)
      .in("status", ["aberta", "vencida"])
      .lt("vencimento_em", now.toISOString().slice(0, 10)),
    supabase
      .from("treinos_atletas")
      .select("atleta_id, agendado_para")
      .eq("assessoria_id", user.assessoriaId)
      .in("status", ["atribuido", "em_andamento"])
      .not("agendado_para", "is", null)
      .lt("agendado_para", now.toISOString()),
  ]);

  const recentTrainings =
    recentTrainingsResult.error || !recentTrainingsResult.data
      ? []
      : (recentTrainingsResult.data as TrainingRow[]);
  const nextAssignments =
    nextAssignmentsResult.error || !nextAssignmentsResult.data
      ? []
      : (nextAssignmentsResult.data as TrainerScheduledAssignmentRow[]);
  const athleteNames = new Map(
    athleteNamesResult.error || !athleteNamesResult.data
      ? []
      : (athleteNamesResult.data as TrainerAthleteNameRow[]).map((athlete) => [
          athlete.id,
          normalizeAthleteProfile(athlete)?.nome ?? "Atleta sem nome",
        ]),
  );
  const attentionReasons = new Map<string, Set<string>>();

  if (!overdueChargesResult.error && overdueChargesResult.data) {
    for (const charge of overdueChargesResult.data as OverdueChargeRow[]) {
      attentionReasons.set(
        charge.atleta_id,
        new Set([...(attentionReasons.get(charge.atleta_id) ?? []), "Cobrança vencida"]),
      );
    }
  }

  if (!pastAssignmentsResult.error && pastAssignmentsResult.data) {
    for (const assignment of pastAssignmentsResult.data as PastAssignmentRow[]) {
      attentionReasons.set(
        assignment.atleta_id,
        new Set([...(attentionReasons.get(assignment.atleta_id) ?? []), "Treino agendado não concluído"]),
      );
    }
  }

  return {
    metrics: [
      {
        label: "Atletas ativos",
        value: countValue(athletesResult.error ? 0 : athletesResult.count),
        hint: "Atletas vinculados à sua assessoria.",
      },
      {
        label: "Treinos criados",
        value: countValue(trainingsResult.error ? 0 : trainingsResult.count),
        hint: "Treinos reais cadastrados por você.",
      },
      {
        label: "Convites pendentes",
        value: countValue(invitationsResult.error ? 0 : invitationsResult.count),
        hint: "Convites ativos aguardando aceite.",
      },
    ],
    trainings: nextAssignments.length
      ? nextAssignments.map((assignment) => {
          const training = normalizeTrainingJoin(assignment);

          return {
            id: assignment.id,
            titulo: training?.titulo ?? "Treino sem título",
            quando: assignment.agendado_para
              ? new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: assignment.timezone ?? "UTC",
                }).format(new Date(assignment.agendado_para))
              : "Sem horário",
            detalhe:
              assignment.observacao_treinador?.trim() ??
              training?.descricao?.trim() ??
              "Treino agendado",
          };
        })
      : recentTrainings.map((training) => ({
          id: training.id,
          titulo: training.titulo,
          quando: formatDateLabel("Criado em", training.created_at),
          detalhe: trainingDetail(training.descricao, training.origem),
        })),
    attention: [...attentionReasons.entries()]
      .filter(([athleteId]) => athleteNames.has(athleteId))
      .map(([athleteId, reasons]) => ({
        athleteId,
        athleteName: athleteNames.get(athleteId) ?? "Atleta",
        reasons: [...reasons],
      })),
    scheduledTrainings: nextAssignments
      .filter((assignment) => athleteNames.has(assignment.atleta_id))
      .map((assignment) => {
      const training = normalizeTrainingJoin(assignment);

      return {
        id: assignment.id,
        athleteName: athleteNames.get(assignment.atleta_id) ?? "Atleta",
        title: training?.titulo ?? "Treino sem título",
        when: assignment.agendado_para
          ? new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: assignment.timezone ?? "UTC",
            }).format(new Date(assignment.agendado_para))
          : "Sem horário",
        status: assignmentStatusLabels[assignment.status as AssignmentRow["status"]],
      };
      }),
  };
}

export async function getAthleteDashboardData(
  user: SessionUser,
): Promise<DashboardData> {
  const supabase = await createServerClient();

  const [assignedResult, inProgressResult, doneResult, assignmentsResult] =
    await Promise.all([
      supabase
        .from("treinos_atletas")
        .select("*", { count: "exact", head: true })
        .eq("assessoria_id", user.assessoriaId)
        .eq("atleta_id", user.id),
      supabase
        .from("treinos_atletas")
        .select("*", { count: "exact", head: true })
        .eq("assessoria_id", user.assessoriaId)
        .eq("atleta_id", user.id)
        .eq("status", "em_andamento"),
      supabase
        .from("treinos_atletas")
        .select("*", { count: "exact", head: true })
        .eq("assessoria_id", user.assessoriaId)
        .eq("atleta_id", user.id)
        .eq("status", "concluido"),
      supabase
        .from("treinos_atletas")
        .select(
          "id, status, atribuido_em, agendado_para, timezone, observacao_treinador, treinos(titulo, descricao, origem)",
        )
        .eq("assessoria_id", user.assessoriaId)
        .eq("atleta_id", user.id)
        .order("agendado_para", { ascending: true, nullsFirst: false })
        .limit(3),
    ]);

  const assignments =
    assignmentsResult.error || !assignmentsResult.data
      ? []
      : (assignmentsResult.data as AssignmentRow[]);

  return {
    metrics: [
      {
        label: "Treinos atribuídos",
        value: countValue(assignedResult.error ? 0 : assignedResult.count),
        hint: "Treinos vinculados ao seu perfil.",
      },
      {
        label: "Em andamento",
        value: countValue(inProgressResult.error ? 0 : inProgressResult.count),
        hint: "Treinos iniciados e ainda não concluídos.",
      },
      {
        label: "Concluídos",
        value: countValue(doneResult.error ? 0 : doneResult.count),
        hint: "Treinos finalizados por você.",
      },
    ],
    trainings: assignments.map((assignment) => {
      const training = normalizeTrainingJoin(assignment);

      return {
        id: assignment.id,
        titulo: training?.titulo ?? "Treino sem título",
        quando: assignment.agendado_para
          ? new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: assignment.timezone ?? "UTC",
            }).format(new Date(assignment.agendado_para))
          : formatDateLabel("Atribuído em", assignment.atribuido_em),
        detalhe:
          assignment.observacao_treinador?.trim() ??
          training?.descricao?.trim() ??
          assignmentStatusLabels[assignment.status],
      };
    }),
    attention: [],
    scheduledTrainings: [],
  };
}
