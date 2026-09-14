import { requireRole } from "@/lib/auth/session";
import StudentDashboard from "@/app/(dashboard)/atleta/page";
export const metadata = { title: "Meu painel — FLERNK" };
export default async function AlunoDashboardPage() { await requireRole("aluno"); return StudentDashboard(); }
