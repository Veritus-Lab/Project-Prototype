import { z } from "zod";

type PublicEnvironment = Partial<
  Pick<
    NodeJS.ProcessEnv,
    "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  >
>;

function isLegacyAnonJwt(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return false;
  }

  try {
    const encodedPayload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const payload = JSON.parse(atob(encodedPayload)) as { role?: unknown };

    return payload.role === "anon";
  } catch {
    return false;
  }
}

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ error: "A URL do Supabase é obrigatória." })
    .refine((url) => {
      try {
        return new URL(url).protocol === "https:";
      } catch {
        return false;
      }
    }, {
      error: "A URL do Supabase deve ser uma URL HTTPS válida.",
    }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({ error: "A chave publishable do Supabase é obrigatória." })
    .refine(
      (key) => key.startsWith("sb_publishable_") || isLegacyAnonJwt(key),
      {
        error:
          "A chave publishable do Supabase deve começar com sb_publishable_ ou ser um JWT anon válido.",
      },
    ),
});

export function getPublicEnv(environment?: PublicEnvironment) {
  const parsed = publicEnvironmentSchema.parse(environment ?? process.env);

  return {
    supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
