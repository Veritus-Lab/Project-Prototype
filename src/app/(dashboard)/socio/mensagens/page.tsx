import MessagesPage from "@/app/(dashboard)/treinador/mensagens/page";
import { requireRole } from "@/lib/auth/session";
export const metadata = { title: "Mensagens — FLERNK" };
export default async function SocioMessagesPage() { await requireRole("socio"); return MessagesPage(); }
