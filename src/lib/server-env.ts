import "server-only";

import { z } from "zod";

/**
 * Lista de segredos estritos de servidor que NUNCA podem receber
 * o prefixo NEXT_PUBLIC_. Se alguma variável de ambiente contiver
 * esse prefixo com o nome de um segredo, a aplicação falha imediatamente.
 */
const forbiddenPublicSecretPatterns = [
  "RESEND_API_KEY",
  "ASAAS_API_KEY",
  "ASAAS_WEBHOOK_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_APP_SECRET",
  "CRON_SECRET",
  "DATABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export type EnvironmentRecord = Record<string, string | undefined>;

export function assertNoLeakedPublicSecrets(env: EnvironmentRecord = process.env): void {
  const leakedKeys: string[] = [];

  for (const key of Object.keys(env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const suffix = key.replace(/^NEXT_PUBLIC_/, "");
      if (forbiddenPublicSecretPatterns.some((pattern) => suffix.includes(pattern))) {
        leakedKeys.push(key);
      }
    }
  }

  if (leakedKeys.length > 0) {
    throw new Error(
      `FALHA CRÍTICA DE SEGURANÇA: Chaves secretas de servidor detectadas com prefixo NEXT_PUBLIC_: ${leakedKeys.join(", ")}. Chaves secretas nunca devem ser expostas ao cliente.`,
    );
  }
}

const serverEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "test", "preview", "production"]).default("development"),
  EXTERNAL_INTEGRATIONS_MODE: z.enum(["disabled", "sandbox", "live"]).default("disabled"),
  RESEND_API_KEY: z
    .string()
    .refine((val) => val.startsWith("re_"), {
      message: "RESEND_API_KEY deve começar com 're_'.",
    })
    .optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_WEBHOOK_TOKEN: z.string().min(8, "ASAAS_WEBHOOK_TOKEN deve ter pelo menos 8 caracteres.").optional(),
  ASAAS_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET deve ter pelo menos 16 caracteres para segurança do worker.").optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let parsedServerEnv: ServerEnvironment | undefined;

export function getServerEnv(environment: EnvironmentRecord = process.env): ServerEnvironment {
  assertNoLeakedPublicSecrets(environment);

  if (environment === process.env && parsedServerEnv) {
    return parsedServerEnv;
  }

  const result = serverEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuração inválida de variáveis de ambiente do servidor: ${errorMessages}`);
  }

  if (environment === process.env) {
    parsedServerEnv = result.data;
  }

  return result.data;
}

/**
 * Retorna um segredo obrigatório de servidor ou lança erro explicativo.
 * Útil antes de chamar APIs externas para garantir que a credencial está presente.
 */
export function requireServerSecret<K extends keyof ServerEnvironment>(
  key: K,
  environment: EnvironmentRecord = process.env,
): NonNullable<ServerEnvironment[K]> {
  const env = getServerEnv(environment);
  const value = env[key];

  if (!value) {
    throw new Error(
      `A chave secreta de servidor '${String(key)}' não está configurada no ambiente.`,
    );
  }

  return value as NonNullable<ServerEnvironment[K]>;
}

// Executa verificação defensiva de bootstrap
assertNoLeakedPublicSecrets();
