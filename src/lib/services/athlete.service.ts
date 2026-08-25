import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface TrainerAthleteSummary {
  id: string;
  nome: string;
  vinculo: string;
  criadoEm: string;
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function normalizeProfile(row: AthleteRow) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
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
    data: (data as AthleteRow[]).map((row) => {
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
    }),
  };
}
