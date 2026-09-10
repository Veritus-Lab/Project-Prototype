import { ChargePaidForm, CommunicationPreferenceForm, QueueReminderForm, SubscriptionForm, SubscriptionStatusForm } from "@/components/dashboard/financial-forms";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerAthletes } from "@/lib/services/athlete.service";
import { financialStatus } from "@/lib/services/financial.service";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Financeiro - FLERNK" };

export default async function FinancialPage() {
  const user = await requireRole("socio");
  const [athleteResult, supabase] = await Promise.all([listTrainerAthletes(user), createServerClient()]);
  const [{ data: charges, error: chargesError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    supabase.from("cobrancas").select("id, atleta_id, valor_centavos, vencimento_em, status").eq("assessoria_id", user.assessoriaId).order("vencimento_em", { ascending: true }).limit(50),
    supabase.from("assinaturas_atletas").select("id, atleta_id, valor_centavos, moeda, periodicidade, dia_vencimento, status, inicio_em").eq("assessoria_id", user.assessoriaId).order("created_at", { ascending: false }).limit(50),
  ]);
  const athletes = "data" in athleteResult && athleteResult.data ? athleteResult.data : [];
  const athleteNames = new Map(athletes.map((athlete) => [athlete.id, athlete.nome]));
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  return <div className="dashboard-page"><p className="eyebrow">Painel do treinador</p><h1 className="dashboard-title">Financeiro</h1><p className="dashboard-subtitle">Assinaturas, vencimentos e pagamentos registrados manualmente.</p><section className="dashboard-section"><Card elevated><h2>Nova assinatura</h2>{athletes.length ? <SubscriptionForm athletes={athletes} /> : <p className="dashboard-empty-state">Vincule um atleta antes de criar uma assinatura.</p>}</Card></section><section className="dashboard-section"><Card elevated><h2>Assinaturas</h2>{subscriptionsError ? <p className="form-error">Não foi possível carregar as assinaturas.</p> : subscriptions?.length ? <ul className="dashboard-list financial-subscription-list">{subscriptions.map((subscription) => <li key={subscription.id}><span className="dashboard-list-title">{athleteNames.get(subscription.atleta_id) ?? "Atleta"}</span><span className="dashboard-list-detail">{amount.format(subscription.valor_centavos / 100)} · {subscription.periodicidade} · dia {subscription.dia_vencimento}</span><SubscriptionStatusForm subscriptionId={subscription.id} status={subscription.status} /></li>)}</ul> : <p className="dashboard-empty-state">Nenhuma assinatura cadastrada.</p>}</Card></section><section className="dashboard-section"><Card elevated><h2>Consentimento de WhatsApp</h2><p className="field-hint">A plataforma não envia mensagens nesta etapa.</p>{athletes.length ? <CommunicationPreferenceForm athletes={athletes} /> : null}</Card></section><section className="dashboard-section"><Card elevated><h2>Próximas cobranças</h2>{chargesError ? <p className="form-error">Não foi possível carregar as cobranças.</p> : charges?.length ? <ul className="dashboard-list">{charges.map((charge) => { const status = financialStatus({ dueDate: charge.vencimento_em, status: charge.status }); return <li key={charge.id}><span className="dashboard-list-title">{athleteNames.get(charge.atleta_id) ?? "Atleta"}</span><span className="dashboard-list-when">{status}</span><span className="dashboard-list-detail">{amount.format(charge.valor_centavos / 100)} · vence em {new Intl.DateTimeFormat("pt-BR").format(new Date(`${charge.vencimento_em}T00:00:00`))}</span>{charge.status === "aberta" ? <><ChargePaidForm chargeId={charge.id} /><QueueReminderForm chargeId={charge.id} /></> : null}</li>; })}</ul> : <p className="dashboard-empty-state">Nenhuma cobrança cadastrada.</p>}</Card></section></div>;
}
