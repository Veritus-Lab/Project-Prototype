import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";

export type PlanPeriodicity = "monthly" | "quarterly" | "semiannual" | "annual";
const periods = new Set<PlanPeriodicity>(["monthly", "quarterly", "semiannual", "annual"]);

export async function listPlansAndSubscriptions() {
  const user = await requireRole("socio"); const supabase = await createServerClient();
  const [{ data: plans, error: plansError }, { data: versions, error: versionsError }, { data: subscriptions, error: subscriptionsError }, { data: charges, error: chargesError }, { data: runs, error: runsError }] = await Promise.all([
    supabase.from("plans").select("id,name,description,active").eq("assessoria_id", user.assessoriaId).order("name"),
    supabase.from("plan_versions").select("id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from,effective_until").eq("assessoria_id", user.assessoriaId).order("version_number", { ascending: false }),
    supabase.from("subscriptions").select("id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on,ends_on").eq("assessoria_id", user.assessoriaId).order("created_at", { ascending: false }),
    supabase.from("charges").select("id,student_id,subscription_id,status,amount_cents,due_on,cycle_key").eq("assessoria_id", user.assessoriaId).order("due_on", { ascending: false }).limit(24),
    supabase.from("billing_generation_runs").select("id,window_starts_on,window_ends_on,status,generated_count,completed_at").eq("assessoria_id", user.assessoriaId).order("started_at", { ascending: false }).limit(8),
  ]);
  if (plansError || versionsError || subscriptionsError || chargesError || runsError) return { error: "Não foi possível carregar os contratos financeiros." } as const;
  return { data: { plans: plans ?? [], versions: versions ?? [], subscriptions: subscriptions ?? [], charges: charges ?? [], runs: runs ?? [] } } as const;
}

export async function createPlan(input: { name: string; description: string; amountCents: number; periodicity: PlanPeriodicity; dueDay: number; effectiveFrom: string }) {
  assertApplicationMutationAllowed(); await requireRole("socio");
  if (input.name.trim().length < 2 || !Number.isInteger(input.amountCents) || input.amountCents < 0 || !periods.has(input.periodicity) || !Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31 || !/^\d{4}-\d{2}-\d{2}$/.test(input.effectiveFrom)) return { error: "Informe as condições válidas do plano." } as const;
  const supabase = await createServerClient(); const { error } = await supabase.rpc("create_plan_version" as never, { target_name: input.name.trim(), target_description: input.description.trim() || null, target_amount_cents: input.amountCents, target_periodicity: input.periodicity, target_due_day: input.dueDay, target_effective_from: input.effectiveFrom } as never);
  if (error) return { error: "Não foi possível criar o plano agora." } as const; return { success: true } as const;
}

export async function createManagedSubscription(input: { studentId: string; enrollmentId: string; planVersionId: string; startsOn: string }) {
  assertApplicationMutationAllowed(); await requireRole("socio");
  if (!input.studentId || !input.enrollmentId || !input.planVersionId || !/^\d{4}-\d{2}-\d{2}$/.test(input.startsOn)) return { error: "Selecione aluno, matrícula, versão e início." } as const;
  const supabase = await createServerClient(); const { error } = await supabase.rpc("create_subscription" as never, { target_student_id: input.studentId, target_enrollment_id: input.enrollmentId, target_plan_version_id: input.planVersionId, target_starts_on: input.startsOn } as never);
  if (error) return { error: "Não foi possível criar o contrato. O aluno pode já ter uma assinatura vigente." } as const; return { success: true } as const;
}

export async function createPlanRevision(input: { planId: string; amountCents: number; periodicity: PlanPeriodicity; dueDay: number; effectiveFrom: string }) {
  assertApplicationMutationAllowed(); await requireRole("socio");
  if (!input.planId || !Number.isInteger(input.amountCents) || input.amountCents < 0 || !periods.has(input.periodicity) || !Number.isInteger(input.dueDay) || input.dueDay < 1 || input.dueDay > 31 || !/^\d{4}-\d{2}-\d{2}$/.test(input.effectiveFrom)) return { error: "Informe as condições válidas da nova versão." } as const;
  const supabase = await createServerClient(); const { error } = await supabase.rpc("create_plan_revision" as never, { target_plan_id: input.planId, target_amount_cents: input.amountCents, target_periodicity: input.periodicity, target_due_day: input.dueDay, target_effective_from: input.effectiveFrom } as never);
  if (error) return { error: "A vigência escolhida se sobrepõe a uma versão existente." } as const; return { success: true } as const;
}

export async function generateBillingCycles(input: { windowStartsOn: string; windowEndsOn: string }) {
  assertApplicationMutationAllowed(); await requireRole("socio");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.windowStartsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(input.windowEndsOn) || input.windowEndsOn < input.windowStartsOn) return { error: "Informe uma janela de geração válida." } as const;
  const supabase = await createServerClient(); const { data, error } = await supabase.rpc("generate_billing_cycles" as never, { target_window_starts_on: input.windowStartsOn, target_window_ends_on: input.windowEndsOn } as never);
  if (error) return { error: "Não foi possível gerar as cobranças agora." } as const;
  return { success: true, generatedCount: Number((data as { generated_count?: number } | null)?.generated_count ?? 0) } as const;
}

export async function changeManagedSubscriptionStatus(input: { subscriptionId: string; status: "active" | "paused" | "ended" | "canceled" | "exempt"; effectiveOn: string; reason: string }) {
  assertApplicationMutationAllowed(); await requireRole("socio");
  if (!input.subscriptionId || !["active", "paused", "ended", "canceled", "exempt"].includes(input.status) || !/^\d{4}-\d{2}-\d{2}$/.test(input.effectiveOn)) return { error: "Informe uma alteração de contrato válida." } as const;
  const supabase = await createServerClient(); const { error } = await supabase.rpc("change_subscription_status" as never, { target_subscription_id: input.subscriptionId, target_status: input.status, target_effective_on: input.effectiveOn, target_reason: input.reason } as never);
  if (error) return { error: "Não foi possível atualizar o status do contrato." } as const;
  return { success: true } as const;
}
