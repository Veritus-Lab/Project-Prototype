import { z } from "zod";

type PublicEnvironment = Partial<
  Pick<
    NodeJS.ProcessEnv,
    "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  >
>;

const base64UrlSegment = /^[A-Za-z0-9_-]+$/;

function decodeBase64Url(value: string): string | undefined {
  if (!base64UrlSegment.test(value)) {
    return undefined;
  }

  try {
    return atob(
      value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "="),
    );
  } catch {
    return undefined;
  }
}

function decodeJwtJson(value: string): Record<string, unknown> | undefined {
  const decoded = decodeBase64Url(value);

  if (!decoded) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(decoded) as unknown;

    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

function isLegacyAnonJwt(value: string): boolean {
  const [encodedHeader, encodedPayload, encodedSignature, ...extraParts] =
    value.split(".");

  if (
    extraParts.length > 0 ||
    !encodedHeader ||
    !encodedPayload ||
    !encodedSignature
  ) {
    return false;
  }

  const header = decodeJwtJson(encodedHeader);
  const payload = decodeJwtJson(encodedPayload);
  const signature = decodeBase64Url(encodedSignature);

  return (
    header?.alg === "HS256" &&
    header.typ === "JWT" &&
    payload?.role === "anon" &&
    signature !== undefined
  );
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
  const parsed = publicEnvironmentSchema.parse(
    environment ?? {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
  );

  return {
    supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
