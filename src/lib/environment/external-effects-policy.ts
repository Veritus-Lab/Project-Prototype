import { assertSafeTestEnvironment } from "./test-environment-guard";

type Environment = Record<string, string | undefined>;
export type ExternalEffect = "email" | "payment" | "whatsapp";

export function assertExternalEffectAllowed(effect: ExternalEffect, environment: Environment = process.env): void {
  const appEnvironment = environment.APP_ENV?.toLowerCase();
  const mode = environment.EXTERNAL_INTEGRATIONS_MODE?.toLowerCase();
  if (appEnvironment !== "production" || mode !== "live") {
    throw new Error(`Efeito externo ${effect} bloqueado fora de production/live.`);
  }
}

export function assertLegacyFinancialMutationAllowed(environment: Environment = process.env): void {
  const appEnvironment = environment.APP_ENV?.toLowerCase();
  if (appEnvironment === "production") return;
  if (appEnvironment === "development" || appEnvironment === "test") {
    assertSafeTestEnvironment(environment);
    return;
  }
  throw new Error("Mutação financeira bloqueada: ambiente não isolado ou preview.");
}
