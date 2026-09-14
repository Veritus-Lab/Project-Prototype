import { requireRole } from "@/lib/auth/session";
import ManagementDashboard from "@/app/(dashboard)/treinador/page";
export const metadata = { title: "Minha gestão — FLERNK" };
export default async function ProfessorDashboardPage() { await requireRole("professor"); return ManagementDashboard(); }
