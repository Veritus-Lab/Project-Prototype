import FinancialPage from "@/app/(dashboard)/treinador/financeiro/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Financeiro — FLERNK" };
export default async function SocioFinancialPage() { await requireRole("socio"); return FinancialPage(); }
