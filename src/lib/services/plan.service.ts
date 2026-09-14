import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";

export type PlanPeriodicity = "monthly" | "quarterly" | "semiannual" | "annual";
const periods = new Set<PlanPeriodicity>(["monthly", "quarterly", "semiannual", "annual"]);

export async function listPlansAndSubscriptions() {
  const user = await requireRole("socio"); const supabase = await createServerClient();
  const [{ data: plans, error: plansError }, { data: versions, error: versionsError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    supabase.from("plans").select("id,name,description,active").eq("assessoria_id", user.assessoriaId).order("name"),
    supabase.from("plan_versions").select("id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from,effective_until").eq("assessoria_id", user.assessoriaId).order("version_number", { ascending: false }),
    supabase.from("subscriptions").select("id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on").eq("assessoria_id", user.assessoriaId).order("created_at", { ascending: false }),
  ]);
  if (plansError || versionsError || subscriptionsError) return { error: "Não foi possível carregar os contratos financeiros." } as const;
  return { data: { plans: plans ?? [], versions: versions ?? [], subscriptions: subscriptions ?? [] } } as const;
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
