import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export interface BillingReminderSummary {
  athleteId: string;
  athleteName: string;
  id: string;
  scheduledFor: string;
  status: string;
  template: string;
}

export type BillingReminderResult =
  | { data: BillingReminderSummary[] }
  | { error: string };

type AthleteNameRow = Pick<
  Database["public"]["Tables"]["atletas"]["Row"],
  "id"
> & {
  profiles:
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">
    | Pick<Database["public"]["Tables"]["profiles"]["Row"], "nome">[]
    | null;
};

type ReminderRow = Pick<
  Database["public"]["Tables"]["lembretes_cobranca"]["Row"],
  "atleta_id" | "id" | "programado_para" | "status" | "template_codigo"
>;

const statusLabels: Record<ReminderRow["status"], string> = {
  bloqueado: "Bloqueado",
  cancelado: "Cancelado",
  enviado: "Enviado",
  falhou: "Falhou",
  pendente: "Pendente",
};

const templateLabels: Record<ReminderRow["template_codigo"], string> = {
  cobranca_proximo_vencimento: "Cobrança próxima do vencimento",
  cobranca_vencida: "Cobrança vencida",
};

function profileName(row: AthleteNameRow) {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return profile?.nome ?? "Atleta sem nome";
}

export async function listTrainerBillingReminders(
  user: SessionUser,
  limit = 6,
): Promise<BillingReminderResult> {
  const supabase = await createServerClient();
  const { data: assessoria, error: assessoriaError } = await supabase
    .from("assessorias")
    .select("timezone")
    .eq("id", user.assessoriaId)
    .maybeSingle();

  if (assessoriaError || !assessoria) {
    return { error: "Não foi possível carregar o timezone da comunicação." };
  }

  const { data: athletes, error: athletesError } = await supabase
    .from("atletas")
    .select("id, profiles!atletas_profile_fkey(nome)")
    .eq("assessoria_id", user.assessoriaId)
    .eq("treinador_id", user.id);

  if (athletesError || !athletes) {
    return { error: "Não foi possível carregar os atletas para a comunicação." };
  }

  const athleteNames = new Map(
    (athletes as AthleteNameRow[]).map((athlete) => [athlete.id, profileName(athlete)]),
  );

  if (!athleteNames.size) {
    return { data: [] };
  }

  const { data: reminders, error: remindersError } = await supabase
    .from("lembretes_cobranca")
    .select("id, atleta_id, programado_para, status, template_codigo")
    .eq("assessoria_id", user.assessoriaId)
    .in("atleta_id", [...athleteNames.keys()])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (remindersError || !reminders) {
    return { error: "Não foi possível carregar a fila de lembretes." };
  }

  return {
    data: (reminders as ReminderRow[])
      .filter((reminder) => athleteNames.has(reminder.atleta_id))
      .map((reminder) => ({
        athleteId: reminder.atleta_id,
        athleteName: athleteNames.get(reminder.atleta_id) ?? "Atleta",
        id: reminder.id,
        scheduledFor: new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: assessoria.timezone,
        }).format(new Date(reminder.programado_para)),
        status: statusLabels[reminder.status],
        template: templateLabels[reminder.template_codigo],
      })),
  };
}
