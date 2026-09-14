import ClassesPage from "@/app/(dashboard)/treinador/calendario/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Turmas — FLERNK" };
export default async function ProfessorClassesPage({ searchParams }: { searchParams: Promise<{ chamada?: string }> }) { await requireRole("professor"); return ClassesPage({ searchParams }); }
