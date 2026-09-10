import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createInvitationToken } from "@/lib/invitations/token";
import { createServerClient } from "@/lib/supabase/server";
import { acceptInvitationSchema, invitationEmailSchema } from "@/lib/validators/invitation";

export async function createTeamInvitation(emailInput: string, role: "socio" | "professor") {
  const email = invitationEmailSchema.safeParse(emailInput);
  if (!email.success || !["socio", "professor"].includes(role)) return { error: "Informe e-mail e papel válidos." } as const;
  assertApplicationMutationAllowed();
  await requireRole("socio");
  const { token, hash } = createInvitationToken();
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_team_invitation" as never, { invited_email: email.data, invited_role: role, token_hash_input: hash } as never);
  if (error) return { error: "Não foi possível criar o convite agora." } as const;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://project-prototype-ashy.vercel.app";
  return { data: { email: email.data, invitationUrl: new URL(`/convite/equipe/${token}`, origin).toString() } } as const;
}

export async function acceptTeamInvitation(tokenInput: string, nameInput: string) {
  const parsed = acceptInvitationSchema.pick({ token: true, nome: true }).safeParse({
    token: tokenInput,
    nome: nameInput,
  });

  if (!parsed.success) return { error: "Informe um convite e nome válidos." } as const;

  assertApplicationMutationAllowed();
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("accept_team_invitation" as never, {
    invitation_token: parsed.data.token,
    member_name: parsed.data.nome,
  } as never);

  if (error) return { error: "Não foi possível aceitar o convite agora." } as const;
  return { data: undefined } as const;
}
