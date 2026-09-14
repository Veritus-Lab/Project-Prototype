import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { listPlansAndSubscriptions } from "@/lib/services/plan.service";
import { listStudents } from "@/lib/services/student.service";
import { PlanManagement } from "@/components/dashboard/plan-management";
import { FinancialEntryForm } from "@/components/dashboard/financial-entry-form";
export const metadata = { title: "Financeiro — FLERNK" };
export default async function SocioFinancialPage() { await requireRole("socio"); const [financial, studentsResult] = await Promise.all([listPlansAndSubscriptions(), listStudents()]); const students = "data" in studentsResult ? studentsResult.data ?? [] : []; return <div className="dashboard-page"><p className="eyebrow">Gestão financeira</p><h1 className="dashboard-title">Planos, contratos e cobranças</h1><p className="dashboard-subtitle">As cobranças são geradas por ciclo, com valor preservado no contrato e sem duplicação.</p><section className="dashboard-section"><Card elevated><FinancialEntryForm />{"error" in financial?<p className="form-error" role="alert">{financial.error}</p>:<PlanManagement plans={financial.data.plans as never} versions={financial.data.versions as never} subscriptions={financial.data.subscriptions as never} charges={financial.data.charges as never} runs={financial.data.runs as never} students={students as never}/>}</Card></section></div>; }
