import "server-only";

import { getResendClient } from "@/lib/email/resend";

const testSender = "FLERNK <onboarding@resend.dev>";

export interface InvitationEmailInput {
  to: string;
  assessoriaNome: string;
  invitationUrl: string;
  expiresAt: string;
  invitationId: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatExpiration(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function renderInvitationEmail(input: InvitationEmailInput) {
  const assessoria = escapeHtml(input.assessoriaNome);
  const expiration = formatExpiration(input.expiresAt);
  const safeUrl = escapeHtml(input.invitationUrl);

  return {
    subject: `Você foi convidado para a ${input.assessoriaNome} no FLERNK`,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0A0C0E;color:#F3F4F6;font-family:Arial,sans-serif"><main style="max-width:560px;margin:0 auto;padding:40px 24px"><p style="color:#E2FF00;font-weight:700;letter-spacing:1px">FLERNK</p><h1 style="font-size:28px">Seu treino começa aqui.</h1><p>Você recebeu um convite da assessoria <strong>${assessoria}</strong> para acessar sua área de atleta.</p><p>Este convite é pessoal, pode ser usado uma única vez e expira em <strong>${expiration}</strong>.</p><p style="margin:32px 0"><a href="${safeUrl}" style="background:#E2FF00;color:#0A0C0E;padding:14px 20px;border-radius:8px;font-weight:700;text-decoration:none">Aceitar convite</a></p><p style="color:#B6BBC2;font-size:14px">Se você não esperava este convite, pode ignorar este e-mail.</p></main></body></html>`,
  };
}

export async function sendInvitationEmail(input: InvitationEmailInput) {
  const message = renderInvitationEmail(input);

  const { data, error } = await getResendClient().emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL ?? testSender,
      to: input.to,
      subject: message.subject,
      html: message.html,
    },
    {
      headers: {
        "Idempotency-Key": `invitation-${input.invitationId}`,
      },
    },
  );

  if (error || !data?.id) {
    throw new Error("Não foi possível enviar o convite por e-mail.");
  }

  return { id: data.id };
}
