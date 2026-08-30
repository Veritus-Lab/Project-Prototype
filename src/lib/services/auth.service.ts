import { createServerClient } from "@/lib/supabase/server";
import type { SignInInput, TrainerSignupInput } from "@/lib/validators/auth";

export type ServiceResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

export const genericSignupError =
  "Não foi possível criar sua conta agora. Tente novamente.";

export const genericSignInError =
  "Não foi possível entrar agora. Tente novamente.";

const accountExistsPatterns = [
  "already registered",
  "already exists",
  "user already registered",
];

const invalidCredentialsPattern = "invalid login credentials";
const emailNotConfirmedPattern = "email not confirmed";
const productionAppOrigin = "https://project-prototype-ashy.vercel.app";

export function getConfiguredAppOrigin(): string | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.VERCEL_PROJECT_PRODUCTION_URL
    ?? process.env.VERCEL_URL
    ?? productionAppOrigin;

  try {
    const url = new URL(
      configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`,
    );

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
}

function translateSignUpError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (accountExistsPatterns.some((pattern) => normalizedMessage.includes(pattern))) {
    return "Já existe uma conta com este e-mail. Se ela for sua, entre para continuar.";
  }

  return genericSignupError;
}

export async function signUpTrainer(
  input: TrainerSignupInput,
): Promise<ServiceResult<{ email: string }>> {
  const origin = getConfiguredAppOrigin();

  if (!origin) {
    return { error: genericSignupError };
  }

  try {
    const supabase = await createServerClient();
    const emailRedirectTo = new URL("/auth/callback", origin).toString();
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.senha,
      options: {
        emailRedirectTo,
        data: {
          nome: input.nome,
          assessoria_nome: input.assessoria,
          papel: "treinador",
        },
      },
    });

    if (error) {
      return { error: translateSignUpError(error.message) };
    }

    return { data: { email: input.email } };
  } catch {
    return { error: genericSignupError };
  }
}

function translateSignInError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes(invalidCredentialsPattern)) {
    return "E-mail ou senha incorretos.";
  }

  if (normalizedMessage.includes(emailNotConfirmedPattern)) {
    return "Confirme seu e-mail antes de entrar. Procure o link que enviamos para você.";
  }

  return genericSignInError;
}

export async function signIn(
  input: SignInInput,
): Promise<ServiceResult<{ email: string }>> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.senha,
    });

    if (error) {
      return { error: translateSignInError(error.message) };
    }

    return { data: { email: input.email } };
  } catch {
    return { error: genericSignInError };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch {
    // Logging out always leads back to /login; a failed server-side
    // signOut must not trap the user inside the protected area.
  }
}
