import type { SessionUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { CreateSubscriptionInput } from "@/lib/validators/financial";

export interface FinancialCharge { id: string; athleteId: string; valueCents: number; dueDate: string; status: string; athleteName: string }
export type FinancialResult<T> = { data: T } | { error: string };

function firstDueDate(startDate: string, dueDay: number) {
  const [year, month] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, dueDay));
  return date.toISOString().slice(0, 10);
}

export function financialStatus(charge: Pick<FinancialCharge, "dueDate" | "status">) {
  if (charge.status === "paga" || charge.status === "isenta" || charge.status === "cancelada") return charge.status;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(`${charge.dueDate}T00:00:00`);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  return diff < 0 ? "vencida" : diff <= 7 ? "próximo do vencimento" : "em dia";
}

export async function createSubscription(user: SessionUser, input: CreateSubscriptionInput): Promise<FinancialResult<true>> {
  const supabase = await createServerClient();
  const { data: athlete } = await supabase.from("atletas").select("id").eq("assessoria_id", user.assessoriaId).eq("treinador_id", user.id).eq("id", input.athleteId).maybeSingle();
  if (!athlete) return { error: "Atleta não encontrado." };
  const { data: subscription, error } = await supabase.from("assinaturas_atletas").insert({ assessoria_id: user.assessoriaId, atleta_id: input.athleteId, valor_centavos: input.amountCents, periodicidade: input.periodicity, dia_vencimento: input.dueDay, metodo_previsto: input.paymentMethod || null, status: input.status, inicio_em: input.startDate }).select("id").single();
  if (error || !subscription) return { error: "Não foi possível criar a assinatura." };
  const chargeStatus = input.status === "isenta" ? "isenta" : "aberta";
  const { data: charge, error: chargeError } = await supabase.from("cobrancas").insert({ assessoria_id: user.assessoriaId, assinatura_id: subscription.id, atleta_id: input.athleteId, valor_centavos: input.amountCents, vencimento_em: firstDueDate(input.startDate, input.dueDay), status: chargeStatus }).select("id").single();
  if (chargeError || !charge) return { error: "Assinatura criada, mas a cobrança inicial falhou." };
  await supabase.from("eventos_financeiros").insert({ assessoria_id: user.assessoriaId, atleta_id: input.athleteId, assinatura_id: subscription.id, cobranca_id: charge.id, ator_id: user.id, tipo: "assinatura_criada", detalhes: { valor_centavos: input.amountCents, vencimento_em: firstDueDate(input.startDate, input.dueDay) } });
  return { data: true };
}

export async function markChargePaid(user: SessionUser, chargeId: string): Promise<FinancialResult<true>> {
  const supabase = await createServerClient();
  const { data: charge, error } = await supabase.from("cobrancas").update({ status: "paga", paga_em: new Date().toISOString() }).eq("assessoria_id", user.assessoriaId).eq("id", chargeId).select("id, atleta_id, assinatura_id").maybeSingle();
  if (error || !charge) return { error: "Não foi possível registrar o pagamento." };
  await supabase.from("eventos_financeiros").insert({ assessoria_id: user.assessoriaId, atleta_id: charge.atleta_id, assinatura_id: charge.assinatura_id, cobranca_id: charge.id, ator_id: user.id, tipo: "cobranca_marcada_paga", detalhes: {} });
  return { data: true };
}
