import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { createTeamInvitationAction } from "./actions";

export const metadata = { title: "Equipe — FLERNK" };

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string; erro?: string }>;
}) {
  await requireRole("socio");
  const { convite, erro } = await searchParams;

  return (
    <main className="dashboard-page">
      <p className="eyebrow">Gestão de acessos</p>
      <h1 className="dashboard-title">Equipe</h1>
      <p className="dashboard-subtitle">Convide sócios e professores para a gestão da FLERNK.</p>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Novo convite</h2>
          <form action={createTeamInvitationAction} className="invitation-form">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required className="input" />
            <label htmlFor="role">Papel</label>
            <select id="role" name="role" className="input" defaultValue="professor">
              <option value="professor">Professor</option>
              <option value="socio">Sócio</option>
            </select>
            <button className="button button-primary" type="submit">Gerar convite</button>
          </form>
          {erro ? <p className="form-error" role="alert">{erro}</p> : null}
          {convite ? (
            <div className="dashboard-empty-state" role="status">
              <p>Convite criado. Envie este link ao membro da equipe:</p>
              <a className="dashboard-link" href={convite}>{convite}</a>
            </div>
          ) : null}
        </Card>
      </section>
    </main>
  );
}
