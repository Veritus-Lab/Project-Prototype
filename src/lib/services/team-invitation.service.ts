import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createInvitationToken } from "@/lib/invitations/token";
import { createServerClient } from "@/lib/supabase/server";
import {
  acceptTeamInvitationSchema,
  invitationEmailSchema,
  type AcceptTeamInvitationInput,
} from "@/lib/validators/invitation";

const genericTeamInvitationError = "Não foi possível concluir o convite agora. Tente novamente.";
const existingAccountPattern = "already registered";

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
  const parsed = acceptTeamInvitationSchema.pick({ token: true, nome: true }).safeParse({
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

  if (error) return { error: genericTeamInvitationError } as const;
  return { data: undefined } as const;
}

function teamInvitationConfirmationUrl(origin: string, token: string, nome: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("convite_equipe", token);
  url.searchParams.set("nome", nome);
  return url.toString();
}

function configuredAppOrigin() {
  const configuredUrl = process.env.NODE_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      ?? process.env.VERCEL_URL
      ?? "https://project-prototype-ashy.vercel.app"
    : process.env.NEXT_PUBLIC_SITE_URL
      ?? "https://project-prototype-ashy.vercel.app";

  try {
    const url = new URL(configuredUrl.includes("://") ? configuredUrl : `https://${configuredUrl}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

export async function createAccountAndAcceptTeamInvitation(
  input: AcceptTeamInvitationInput,
) {
  const parsed = acceptTeamInvitationSchema.safeParse(input);
  if (!parsed.success) return { error: "Confira nome, e-mail e senha para continuar." } as const;

  const origin = configuredAppOrigin();
  if (!origin) return { error: genericTeamInvitationError } as const;

  try {
    assertApplicationMutationAllowed();
    const supabase = await createServerClient();
    const { token, nome, email, senha } = parsed.data;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: teamInvitationConfirmationUrl(origin, token, nome),
        data: { nome },
      },
    });

    if (error?.message.toLowerCase().includes(existingAccountPattern)) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (signInError) return { error: genericTeamInvitationError } as const;
      return acceptTeamInvitation(token, nome);
    }

    if (error || !data.user?.id) return { error: genericTeamInvitationError } as const;
    if (!data.session) return { data: { confirmationRequired: true } } as const;

    const completion = await acceptTeamInvitation(token, nome);
    if ("error" in completion) return completion;
    return { data: { confirmationRequired: false } } as const;
  } catch {
    return { error: genericTeamInvitationError } as const;
  }
}
