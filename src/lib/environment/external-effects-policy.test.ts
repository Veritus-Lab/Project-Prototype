import { describe, expect, it } from "vitest";
import {
  assertApplicationMutationAllowed,
  assertExternalEffectAllowed,
} from "./external-effects-policy";

const local = { APP_ENV: "test", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321", EXTERNAL_INTEGRATIONS_MODE: "disabled" };

describe("external effects policy", () => {
  it.each(["email", "payment", "whatsapp"] as const)("blocks %s outside production/live", (effect) => {
    expect(() => assertExternalEffectAllowed(effect, local)).toThrow(/bloqueado/);
  });
  it("allows a live effect only in production", () => {
    expect(() => assertExternalEffectAllowed("payment", { APP_ENV: "production", VERCEL_ENV: "production", EXTERNAL_INTEGRATIONS_MODE: "live" })).not.toThrow();
  });
  it.each([
    { APP_ENV: "production", EXTERNAL_INTEGRATIONS_MODE: "live" },
    { APP_ENV: "production", VERCEL_ENV: "preview", EXTERNAL_INTEGRATIONS_MODE: "live" },
    { APP_ENV: "production", VERCEL_ENV: "production", VERCEL_TARGET_ENV: "preview", EXTERNAL_INTEGRATIONS_MODE: "live" },
  ])("fails closed for an absent or divergent production deployment context", (environment) => {
    expect(() => assertExternalEffectAllowed("payment", environment)).toThrow(/Contexto/);
    expect(() => assertApplicationMutationAllowed(environment)).toThrow(/Contexto/);
  });
  it.each([
    ["payment", "ASAAS_ENVIRONMENT", "ASAAS_API_KEY"],
    ["whatsapp", "WHATSAPP_ENVIRONMENT", "WHATSAPP_ACCESS_TOKEN"],
  ] as const)("allows an explicitly allow-listed %s sandbox", (effect, providerVariable, credentialVariable) => {
    expect(() => assertExternalEffectAllowed(effect, {
      ...local,
      EXTERNAL_INTEGRATIONS_MODE: "sandbox",
      ALLOW_SANDBOX_EXTERNAL_EFFECTS: "true",
      SANDBOX_EXTERNAL_EFFECTS_ALLOWLIST: effect,
      [providerVariable]: "sandbox",
      [credentialVariable]: "sandbox-credential",
    })).not.toThrow();
  });
  it("rejects sandbox credentials without the explicit allowlist", () => {
    expect(() => assertExternalEffectAllowed("payment", {
      ...local,
      EXTERNAL_INTEGRATIONS_MODE: "sandbox",
      ASAAS_ENVIRONMENT: "sandbox",
      ASAAS_API_KEY: "sandbox-credential",
    })).toThrow(/não comprovado/);
  });
  it("blocks financial mutation in preview and permits a guarded local test", () => {
    expect(() => assertApplicationMutationAllowed({ ...local, APP_ENV: "preview" })).toThrow(/preview/);
    expect(() => assertApplicationMutationAllowed(local)).not.toThrow();
  });
});
