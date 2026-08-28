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

export interface DashboardData {
  metrics: DashboardMetric[];
  trainings: DashboardTraining[];
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

function normalizeTrainingJoin(row: AssignmentRow) {
  return Array.isArray(row.treinos) ? row.treinos[0] : row.treinos;
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
  ]);

  const recentTrainings =
    recentTrainingsResult.error || !recentTrainingsResult.data
      ? []
      : (recentTrainingsResult.data as TrainingRow[]);

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
    trainings: recentTrainings.map((training) => ({
      id: training.id,
      titulo: training.titulo,
      quando: formatDateLabel("Criado em", training.created_at),
      detalhe: trainingDetail(training.descricao, training.origem),
    })),
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
  };
}
