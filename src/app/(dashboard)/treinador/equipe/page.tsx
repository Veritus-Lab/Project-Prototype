import { requireRole } from "@/lib/auth/session";
import { createTeamInvitationAction } from "./actions";
export default async function TeamPage() {
  await requireRole("socio");
  return <main className="dashboard-page"><p className="eyebrow">Equipe</p><h1 className="dashboard-title">Convidar membro</h1><form action={createTeamInvitationAction} className="invitation-form"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required className="input"/><label htmlFor="role">Papel</label><select id="role" name="role" className="input"><option value="professor">Professor</option><option value="socio">Sócio</option></select><button className="button button-primary" type="submit">Gerar convite</button></form></main>;
}
