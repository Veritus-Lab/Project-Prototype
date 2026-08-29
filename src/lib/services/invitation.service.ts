import { requireRole } from "@/lib/auth/session";
import {
  createInvitationToken,
  getInvitationState,
  hashInvitationToken,
  invitationExpiresAt,
  type InvitationState,
} from "@/lib/invitations/token";
import { createServerClient } from "@/lib/supabase/server";
import {
  acceptInvitationSchema,
  invitationEmailSchema,
  type AcceptInvitationInput,
} from "@/lib/validators/invitation";
import type { Database } from "@/types/database";

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;

type InvitationRow = Pick<
  Database["public"]["Tables"]["convites_atletas"]["Row"],
  | "id"
  | "email"
  | "status"
  | "expira_em"
  | "usado_em"
  | "revogado_em"
  | "created_at"
>;

export interface InvitationSummary extends InvitationRow {
  state: InvitationState;
}

export interface CreatedInvitation extends InvitationSummary {
  link: string;
}

export type PublicInvitationState =
  | "active"
  | "expired"
  | "used"
  | "revoked"
  | "invalid";

export interface PublicInvitation {
  maskedEmail: string | null;
  assessoriaNome: string | null;
  state: PublicInvitationState;
}

export interface InvitationAcceptance {
  confirmationRequired: boolean;
}

export type InvitationResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

const genericInvitationError =
  "Não foi possível criar o convite agora. Tente novamente.";

const genericRevokeError =
  "Não foi possível revogar o convite agora. Tente novamente.";

const genericAcceptanceError =
  "Não foi possível aceitar o convite agora. Tente novamente.";

function configuredAppOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return undefined;
  }

  try {
    const url = new URL(configuredUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
}

function invitationConfirmationUrl(origin: string, token: string, nome: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("convite", token);
  url.searchParams.set("nome", nome);
  return url.toString();
}

function mapInvitation(row: InvitationRow, now = new Date()): InvitationSummary {
  return {
    ...row,
    state: getInvitationState(row, now),
  };
}

function mapPublicInvitationState(state: string): PublicInvitationState {
  if (state === "pendente") {
    return "active";
  }

  if (state === "expirado") {
    return "expired";
  }

  if (state === "revogado") {
    return "revoked";
  }

  if (state === "aceito") {
    return "used";
  }

  return "invalid";
}

export async function createInvitation(
  rawEmail: string,
): Promise<InvitationResult<CreatedInvitation>> {
  const parsedEmail = invitationEmailSchema.safeParse(rawEmail);

  if (!parsedEmail.success) {
    return { error: parsedEmail.error.issues[0]?.message ?? genericInvitationError };
  }

  const origin = configuredAppOrigin();

  if (!origin) {
    return { error: genericInvitationError };
  }

  try {
    const user = await requireRole("treinador");
    const supabase = await createServerClient();
    const now = new Date();
    const { token, hash } = createInvitationToken();
    const email = parsedEmail.data;

    const { error: revokeDuplicateError } = await supabase
      .from("convites_atletas")
      .update({
        status: "revogado",
        revogado_em: now.toISOString(),
      })
      .eq("assessoria_id", user.assessoriaId)
      .eq("email", email)
      .eq("status", "pendente")
      .is("usado_em", null)
      .is("revogado_em", null)
      .gt("expira_em", now.toISOString());

    if (revokeDuplicateError) {
      return { error: genericInvitationError };
    }

    const { data, error } = await supabase
      .from("convites_atletas")
      .insert({
        assessoria_id: user.assessoriaId,
        treinador_id: user.id,
        email,
        token_hash: hash,
        expira_em: invitationExpiresAt(now).toISOString(),
      })
      .select("id, email, status, expira_em, usado_em, revogado_em, created_at")
      .single();

    if (error || !data) {
      return { error: genericInvitationError };
    }

    return {
      data: {
        ...mapInvitation(data, now),
        link: new URL(`/convite/${token}`, origin).toString(),
      },
    };
  } catch {
    return { error: genericInvitationError };
  }
}

export async function revokeInvitation(
  invitationId: string,
): Promise<InvitationResult<void>> {
  try {
    const user = await requireRole("treinador");
    const supabase = await createServerClient();
    const { error } = await supabase
      .from("convites_atletas")
      .update({
        status: "revogado",
        revogado_em: new Date().toISOString(),
      })
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .eq("id", invitationId);

    if (error) {
      return { error: genericRevokeError };
    }

    return { data: undefined };
  } catch {
    return { error: genericRevokeError };
  }
}

export async function listInvitations(): Promise<
  InvitationResult<InvitationSummary[]>
> {
  try {
    const user = await requireRole("treinador");
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("convites_atletas")
      .select("id, email, status, expira_em, usado_em, revogado_em, created_at")
      .eq("assessoria_id", user.assessoriaId)
      .eq("treinador_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return { error: "Não foi possível carregar os convites agora." };
    }

    return { data: data.map((row) => mapInvitation(row)) };
  } catch {
    return { error: "Não foi possível carregar os convites agora." };
  }
}

export async function inspectInvitation(
  token: string,
): Promise<InvitationResult<PublicInvitation>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("validar_convite", {
      hash: hashInvitationToken(token),
    });

    if (error || !data?.[0]) {
      return {
        data: {
          maskedEmail: null,
          assessoriaNome: null,
          state: "invalid",
        },
      };
    }

    const invitation = data[0];

    return {
      data: {
        maskedEmail: invitation.email_mascarado,
        assessoriaNome: invitation.assessoria_nome,
        state: mapPublicInvitationState(invitation.estado),
      },
    };
  } catch {
    return {
      data: {
        maskedEmail: null,
        assessoriaNome: null,
        state: "invalid",
      },
    };
  }
}

function translateAcceptanceError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email nao corresponde")) {
    return "Use o mesmo e-mail que recebeu o convite.";
  }

  if (normalized.includes("convite expirado")) {
    return "Este convite expirou.";
  }

  if (normalized.includes("convite revogado")) {
    return "Este convite foi revogado.";
  }

  if (normalized.includes("convite ja utilizado")) {
    return "Este convite já foi usado.";
  }

  return genericAcceptanceError;
}

async function completeInvitationAcceptanceWithClient(
  supabase: ServerSupabaseClient,
  token: string,
  nome: string,
): Promise<InvitationResult<void>> {
  const { error } = await supabase.rpc("aceitar_convite", {
    hash: hashInvitationToken(token),
    user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
    nome,
  });

  if (error) {
    return { error: translateAcceptanceError(error.message) };
  }

  return { data: undefined };
}

export async function completeInvitationAcceptance(
  input: Pick<AcceptInvitationInput, "token" | "nome">,
): Promise<InvitationResult<void>> {
  const parsedInput = acceptInvitationSchema
    .pick({ token: true, nome: true })
    .safeParse(input);

  if (!parsedInput.success) {
    return { error: genericAcceptanceError };
  }

  try {
    const supabase = await createServerClient();
    return completeInvitationAcceptanceWithClient(
      supabase,
      parsedInput.data.token,
      parsedInput.data.nome,
    );
  } catch {
    return { error: genericAcceptanceError };
  }
}

export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<InvitationResult<InvitationAcceptance>> {
  const parsedInput = acceptInvitationSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: parsedInput.error.issues[0]?.message ?? genericAcceptanceError };
  }

  const origin = configuredAppOrigin();

  if (!origin) {
    return { error: genericAcceptanceError };
  }

  try {
    const supabase = await createServerClient();
    const { token, nome, email, senha } = parsedInput.data;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: invitationConfirmationUrl(origin, token, nome),
        data: {
          nome,
          papel: "atleta",
        },
      },
    });

    if (signUpError || !signUpData.user?.id) {
      return { error: genericAcceptanceError };
    }

    if (!signUpData.session) {
      return { data: { confirmationRequired: true } };
    }

    const completion = await completeInvitationAcceptanceWithClient(
      supabase,
      token,
      nome,
    );

    if ("error" in completion && typeof completion.error === "string") {
      return { error: completion.error };
    }

    return { data: { confirmationRequired: false } };
  } catch {
    return { error: genericAcceptanceError };
  }
}
