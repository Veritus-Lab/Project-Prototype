import StudentClassPage from "@/app/(dashboard)/atleta/calendario/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Minha turma — FLERNK" };
export default async function AlunoClassPage() { await requireRole("aluno"); return StudentClassPage(); }
