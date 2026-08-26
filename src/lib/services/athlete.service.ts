import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { AthleteOperationalProfileInput } from "@/lib/validators/athlete-operational";
import type { Database } from "@/types/database";

export interface TrainerAthleteSummary {
  id: string;
  nome: string;
  vinculo: string;
  criadoEm: string;
}

export interface TrainerAthleteTraining {
  id: string;
  titulo: string;
  quando: string;
  detalhe: string;
  status: string;
}

export interface TrainerAthleteOperationalProfile {
  telefone: string | null;
  observacoesInternas: string | null;
  objetivo: string | null;
  nivel: string | null;
  dataNascimento: string | null;
  contatoEmergenciaNome: string | null;
  contatoEmergenciaTelefone: string | null;
  atualizadoEm: string;
}

export interface TrainerAthleteDetail extends TrainerAthleteSummary {
  perfilOperacional: TrainerAthleteOperationalProfile | null;
  treinosRecentes: TrainerAthleteTraining[];
}

export type AthleteResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

type AthleteRow = Pick<
  Database["public"]["Tables"]["atletas"]["Row"],
  "id" | "treinador_id" | "created_at"
> & {
  profiles:
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome" | "created_at">
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome" | "created_at">[]
    | null;
};

type AthleteAssignmentRow = Pick<
  Database["public"]["Tables"]["treinos_atletas"]["Row"],
  "id" | "status" | "atribuido_em"
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

type AthleteDetailRow = AthleteRow & {
  treinos_atletas: AthleteAssignmentRow[] | null;
};

type AthleteOperationalRow = Pick<
  Database["public"]["Tables"]["atletas_operacionais"]["Row"],
  | "telefone"
  | "observacoes_internas"
  | "objetivo"
  | "nivel"
  | "data_nascimento"
  | "contato_emergencia_nome"
  | "contato_emergencia_telefone"
  | "updated_at"
>;

const assignmentStatusLabels: Record<AthleteAssignmentRow["status"], string> = {
  atribuido: "Atribuído",
  cancelado: "Cancelado",
  concluido: "Concluído",
  em_andamento: "Em andamento",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function formatDateLabel(prefix: string, value: string) {
  const formattedDate = formatDate(value);

  return formattedDate ? `${prefix} ${formattedDate}` : prefix;
}

function normalizeProfile(row: AthleteRow) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
}

function normalizeTraining(row: AthleteAssignmentRow) {
  return Array.isArray(row.treinos) ? row.treinos[0] : row.treinos;
}

function summarizeAthlete(
  row: AthleteRow,
  user: SessionUser,
): TrainerAthleteSummary {
  const profile = normalizeProfile(row);

  return {
    id: row.id,
    nome: profile?.nome ?? "Atleta sem nome",
    vinculo:
      row.treinador_id === user.id
        ? "Vinculado a você"
        : "Sem treinador definido",
    criadoEm: formatDate(row.created_at || profile?.created_at || ""),
  };
}

function mapOperationalProfile(
  row: AthleteOperationalRow,
): TrainerAthleteOperationalProfile {
  return {
    telefone: row.telefone,
    observacoesInternas: row.observacoes_internas,
    objetivo: row.objetivo,
    nivel: row.nivel,
    dataNascimento: row.data_nascimento,
    contatoEmergenciaNome: row.contato_emergencia_nome,
    contatoEmergenciaTelefone: row.contato_emergencia_telefone,
    atualizadoEm: formatDate(row.updated_at),
  };
}

async function getTrainerOperationalProfile(
  user: SessionUser,
  athleteId: string,
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("atletas_operacionais")
    .select(
      "telefone, observacoes_internas, objetivo, nivel, data_nascimento, contato_emergencia_nome, contato_emergencia_telefone, updated_at",
    )
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", athleteId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapOperationalProfile(data as AthleteOperationalRow);
}

export async function listTrainerAthletes(
  user: SessionUser,
): Promise<AthleteResult<TrainerAthleteSummary[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("atletas")
    .select(
      "id, treinador_id, created_at, profiles!atletas_profile_fkey(nome, created_at)",
    )
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { error: "Não foi possível carregar os atletas agora." };
  }

  return {
    data: (data as AthleteRow[]).map((row) => summarizeAthlete(row, user)),
  };
}

export async function getTrainerAthleteDetail(
  user: SessionUser,
  athleteId: string,
): Promise<AthleteResult<TrainerAthleteDetail>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("atletas")
    .select(
      "id, treinador_id, created_at, profiles!atletas_profile_fkey(nome, created_at), treinos_atletas(id, status, atribuido_em, treinos(titulo, descricao, origem))",
    )
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id)
    .eq("id", athleteId)
    .order("atribuido_em", {
      ascending: false,
      foreignTable: "treinos_atletas",
    })
    .limit(3, { foreignTable: "treinos_atletas" })
    .maybeSingle();

  if (error || !data) {
    return { error: "Atleta não encontrado." };
  }

  const row = data as AthleteDetailRow;

  return {
    data: {
      ...summarizeAthlete(row, user),
      perfilOperacional: await getTrainerOperationalProfile(user, athleteId),
      treinosRecentes: (row.treinos_atletas ?? []).map((assignment) => {
        const training = normalizeTraining(assignment);

        return {
          id: assignment.id,
          titulo: training?.titulo ?? "Treino sem título",
          quando: formatDateLabel("Atribuído em", assignment.atribuido_em),
          detalhe:
            training?.descricao?.trim() ||
            assignmentStatusLabels[assignment.status],
          status: assignmentStatusLabels[assignment.status],
        };
      }),
    },
  };
}

export async function updateTrainerAthleteOperationalProfile(
  user: SessionUser,
  athleteId: string,
  input: AthleteOperationalProfileInput,
): Promise<AthleteResult<TrainerAthleteOperationalProfile>> {
  const supabase = await createServerClient();
  const { data: athlete, error: athleteError } = await supabase
    .from("atletas")
    .select("id")
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id)
    .eq("id", athleteId)
    .maybeSingle();

  if (athleteError || !athlete) {
    return { error: "Atleta não encontrado." };
  }

  const { data, error } = await supabase
    .from("atletas_operacionais")
    .upsert(
      {
        assessoria_id: user.assessoriaId,
        atleta_id: athleteId,
        telefone: input.telefone,
        observacoes_internas: input.observacoesInternas,
        objetivo: input.objetivo,
        nivel: input.nivel,
        data_nascimento: input.dataNascimento,
        contato_emergencia_nome: input.contatoEmergenciaNome,
        contato_emergencia_telefone: input.contatoEmergenciaTelefone,
      },
      { onConflict: "atleta_id" },
    )
    .select(
      "telefone, observacoes_internas, objetivo, nivel, data_nascimento, contato_emergencia_nome, contato_emergencia_telefone, updated_at",
    )
    .single();

  if (error || !data) {
    return { error: "Não foi possível atualizar os dados operacionais agora." };
  }

  return { data: mapOperationalProfile(data as AthleteOperationalRow) };
}
