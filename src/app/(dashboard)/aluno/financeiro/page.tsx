import StudentFinancialPage from "@/app/(dashboard)/atleta/financeiro/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Meu financeiro — FLERNK" };
export default async function AlunoFinancialPage() { await requireRole("aluno"); return StudentFinancialPage(); }
