import { assertSafeTestEnvironment } from "./test-environment-guard";

type Environment = Record<string, string | undefined>;
export type ExternalEffect = "email" | "payment" | "whatsapp";

function assertConsistentDeploymentContext(environment: Environment): string | undefined {
  const appEnvironment = environment.APP_ENV?.toLowerCase();
  const vercelEnvironment = environment.VERCEL_ENV?.toLowerCase();
  const vercelTargetEnvironment = environment.VERCEL_TARGET_ENV?.toLowerCase();

  if (appEnvironment === "production" && vercelEnvironment !== "production") {
    throw new Error("Contexto de produção bloqueado: VERCEL_ENV=production é obrigatório.");
  }
  for (const deploymentEnvironment of [vercelEnvironment, vercelTargetEnvironment].filter(Boolean)) {
    if (deploymentEnvironment !== appEnvironment) {
      throw new Error("Contexto de deployment divergente de APP_ENV.");
    }
  }
  return appEnvironment;
}

export function assertExternalEffectAllowed(effect: ExternalEffect, environment: Environment = process.env): void {
  const appEnvironment = assertConsistentDeploymentContext(environment);
  const mode = environment.EXTERNAL_INTEGRATIONS_MODE?.toLowerCase();
  if (appEnvironment === "production" && mode === "live") return;
  if (effect === "email") throw new Error("Efeito externo email bloqueado fora de production/live.");

  const providerEnvironment = environment[effect === "payment" ? "ASAAS_ENVIRONMENT" : "WHATSAPP_ENVIRONMENT"]?.toLowerCase();
  const credential = environment[effect === "payment" ? "ASAAS_API_KEY" : "WHATSAPP_ACCESS_TOKEN"];
  const allowlist = new Set((environment.SANDBOX_EXTERNAL_EFFECTS_ALLOWLIST ?? "").split(",").map((item) => item.trim()));
  if (
    ["development", "test", "preview"].includes(appEnvironment ?? "") &&
    mode === "sandbox" && providerEnvironment === "sandbox" && credential &&
    environment.ALLOW_SANDBOX_EXTERNAL_EFFECTS === "true" && allowlist.has(effect)
  ) return;
  throw new Error(`Efeito externo ${effect} bloqueado: sandbox não comprovado.`);
}

export function assertApplicationMutationAllowed(environment: Environment = process.env): void {
  const appEnvironment = assertConsistentDeploymentContext(environment);
  if (appEnvironment === "production") return;
  if (appEnvironment === "development" || appEnvironment === "test") {
    assertSafeTestEnvironment(environment);
    return;
  }
  throw new Error("Mutação da aplicação bloqueada: ambiente não isolado ou preview read-only.");
}

export const assertLegacyFinancialMutationAllowed = assertApplicationMutationAllowed;
