import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { InvitationSignupForm } from "@/components/auth/invitation-signup-form";
import { Card } from "@/components/ui/card";
import {
  inspectInvitation,
  type PublicInvitationState,
} from "@/lib/services/invitation.service";

export const metadata = {
  title: "Convite — FLERNK",
};

const invalidCopy: Record<
  Exclude<PublicInvitationState, "active">,
  { title: string; body: string }
> = {
  invalid: {
    title: "Convite inválido",
    body: "Este link não foi encontrado. Peça um novo convite ao seu treinador.",
  },
  expired: {
    title: "Convite expirado",
    body: "Este convite passou do prazo de validade. Peça um novo link ao seu treinador.",
  },
  revoked: {
    title: "Convite revogado",
    body: "Este convite não está mais disponível.",
  },
  used: {
    title: "Convite já usado",
    body: "Este convite já foi aceito e não pode ser reutilizado.",
  },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await inspectInvitation(token);
  const invitation = "data" in result ? result.data : undefined;

  if (!invitation || invitation.state !== "active") {
    const invalidState = invitation?.state === "active" ? "invalid" : invitation?.state ?? "invalid";
    const copy = invalidCopy[invalidState];

    return (
      <AuthShell>
        <Card className="auth-card" elevated>
          <h1>{copy.title}</h1>
          <p className="auth-lead">{copy.body}</p>
          <p className="auth-footer">
            <Link href="/login">Voltar para entrar</Link>
          </p>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="auth-card" elevated>
        <p className="eyebrow">Convite FLERNK</p>
        <h1>{invitation.assessoriaNome}</h1>
        <p className="auth-lead">
          Crie seu acesso de atleta usando o mesmo e-mail que recebeu o convite.
        </p>
        <InvitationSignupForm
          token={token}
          maskedEmail={invitation.maskedEmail ?? "e-mail convidado"}
        />
      </Card>
    </AuthShell>
  );
}
