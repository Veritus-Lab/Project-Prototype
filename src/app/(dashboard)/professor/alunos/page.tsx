import StudentsPage from "@/app/(dashboard)/treinador/atletas/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Alunos — FLERNK" };
export default async function ProfessorStudentsPage() { await requireRole("professor"); return StudentsPage(); }
