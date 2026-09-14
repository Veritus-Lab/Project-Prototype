import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createInvitationToken } from "@/lib/invitations/token";
import { createServerClient } from "@/lib/supabase/server";

const genericError = "Não foi possível concluir o convite agora. Tente novamente.";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const existingAccountPattern = "already registered";

function appOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "https://project-prototype-ashy.vercel.app";
  try { return new URL(value.includes("://") ? value : `https://${value}`).origin; } catch { return undefined; }
}

export async function createStudentAccessInvitation(studentId: string) {
  if (!uuidPattern.test(studentId)) return { error: "Aluno inválido." } as const;
  const origin = appOrigin();
  if (!origin) return { error: genericError } as const;
  assertApplicationMutationAllowed();
  await requireRole("socio");
  const { token, hash } = createInvitationToken();
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_student_invitation" as never, {
    target_student_id: studentId, token_hash_input: hash,
  } as never);
  if (error) return { error: "O aluno precisa ter um e-mail e ainda não pode possuir acesso." } as const;
  return { data: { invitationUrl: new URL(`/convite/aluno/${token}`, origin).toString() } } as const;
}

export async function acceptStudentAccessInvitation(token: string) {
  if (!token.trim()) return { error: "Convite inválido." } as const;
  assertApplicationMutationAllowed();
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("accept_student_invitation" as never, { invitation_token: token.trim() } as never);
  if (error) return { error: genericError } as const;
  return { data: undefined } as const;
}

export async function createStudentAccountAndAcceptInvitation(input: { token: string; email: string; senha: string }) {
  const origin = appOrigin();
  if (!origin || !input.token.trim()) return { error: genericError } as const;
  try {
    assertApplicationMutationAllowed();
    const supabase = await createServerClient();
    const email = input.email.trim().toLowerCase();
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("convite_aluno", input.token.trim());
    const { data, error } = await supabase.auth.signUp({
      email, password: input.senha,
      options: { emailRedirectTo: callback.toString(), data: { papel: "atleta" } },
    });
    if (error?.message.toLowerCase().includes(existingAccountPattern)) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: input.senha });
      if (signInError) return { error: genericError } as const;
      const completion = await acceptStudentAccessInvitation(input.token);
      if ("error" in completion) return completion;
      return { data: { confirmationRequired: false } } as const;
    }
    if (error || !data.user?.id) return { error: genericError } as const;
    if (!data.session) return { data: { confirmationRequired: true } } as const;
    const completion = await acceptStudentAccessInvitation(input.token);
    if ("error" in completion) return completion;
    return { data: { confirmationRequired: false } } as const;
  } catch { return { error: genericError } as const; }
}
