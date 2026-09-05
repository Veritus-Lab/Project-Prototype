import { InvitationForm } from "@/components/dashboard/invitation-form";
import { InvitationList } from "@/components/dashboard/invitation-list";
import { Card } from "@/components/ui/card";
import { listInvitations } from "@/lib/services/invitation.service";

export const metadata = {
  title: "Convites — FLERNK",
};

export default async function ConvitesPage() {
  const result = await listInvitations();
  const invitations = "data" in result && result.data ? result.data : [];

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">Convites</h1>
      <p className="dashboard-subtitle">
        Envie convites seguros por e-mail para atletas entrarem na sua assessoria.
      </p>

      <div className="invitation-grid">
        <Card elevated>
          <h2>Novo convite</h2>
          <InvitationForm />
        </Card>

        <section className="dashboard-section invitation-panel">
          <h2>Acompanhe os convites</h2>
          {"error" in result ? (
            <p className="form-error" role="alert">{result.error}</p>
          ) : (
            <InvitationList invitations={invitations} />
          )}
        </section>
      </div>
    </div>
  );
}
