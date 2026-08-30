import { deleteInvitationAction, revokeInvitationAction } from "@/app/(dashboard)/treinador/convites/actions";
import { Button } from "@/components/ui/button";
import { DestructiveActionForm } from "@/components/dashboard/destructive-action-form";
import type { InvitationSummary } from "@/lib/services/invitation.service";

const stateLabel: Record<InvitationSummary["state"], string> = {
  active: "Ativo",
  expired: "Expirado",
  used: "Aceito",
  revoked: "Revogado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function InvitationList({
  invitations,
}: {
  invitations: readonly InvitationSummary[];
}) {
  if (invitations.length === 0) {
    return (
      <p className="dashboard-demo-note">
        Nenhum convite criado ainda.
      </p>
    );
  }

  return (
    <div className="invitation-list">
      {invitations.map((invitation) => (
        <article className="invitation-row" key={invitation.id}>
          <div>
            <p className="invitation-email">{invitation.email}</p>
            <p className="dashboard-list-detail">
              Expira em {formatDate(invitation.expira_em)}
            </p>
          </div>
          <span className={`invitation-status invitation-status-${invitation.state}`}>
            {stateLabel[invitation.state]}
          </span>
          {invitation.state === "active" ? (
            <form action={revokeInvitationAction}>
              <input type="hidden" name="id" value={invitation.id} />
              <Button
                type="submit"
                variant="ghost"
                aria-label={`Revogar ${invitation.email}`}
              >
                Revogar
              </Button>
            </form>
          ) : null}
          {invitation.state !== "used" ? <DestructiveActionForm action={deleteInvitationAction} fieldName="id" value={invitation.id} label="Apagar" confirmation={`Apagar o convite de ${invitation.email}? Esta ação não pode ser desfeita.`} /> : null}
        </article>
      ))}
    </div>
  );
}
