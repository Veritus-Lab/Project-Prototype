import TeamPage from "@/app/(dashboard)/treinador/equipe/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Equipe — FLERNK" };
export default async function SocioTeamPage({ searchParams }: { searchParams: Promise<{ convite?: string; erro?: string }> }) { await requireRole("socio"); return TeamPage({ searchParams }); }
