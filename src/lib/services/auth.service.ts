import { createServerClient } from "@/lib/supabase/server";
import type { TrainerSignupInput } from "@/lib/validators/auth";

export type ServiceResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

const accountExistsPatterns = [
  "already registered",
  "already exists",
  "user already registered",
];

export function getConfiguredAppOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL deve estar configurada.");
  }

  const url = new URL(configuredUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL deve usar HTTP ou HTTPS.");
  }

  return url.origin;
}

function translateSignUpError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (accountExistsPatterns.some((pattern) => normalizedMessage.includes(pattern))) {
    return "Já existe uma conta com este e-mail. Se ela for sua, entre para continuar.";
  }

  return "Não foi possível criar sua conta agora. Tente novamente.";
}

export async function signUpTrainer(
  input: TrainerSignupInput,
): Promise<ServiceResult<{ email: string }>> {
  const supabase = await createServerClient();
  const emailRedirectTo = new URL("/auth/callback", getConfiguredAppOrigin()).toString();
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
}
