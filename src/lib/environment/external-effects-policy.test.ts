import { describe, expect, it } from "vitest";
import { assertExternalEffectAllowed, assertLegacyFinancialMutationAllowed } from "./external-effects-policy";

const local = { APP_ENV: "test", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321", EXTERNAL_INTEGRATIONS_MODE: "disabled" };

describe("external effects policy", () => {
  it.each(["email", "payment", "whatsapp"] as const)("blocks %s outside production/live", (effect) => {
    expect(() => assertExternalEffectAllowed(effect, local)).toThrow(/bloqueado/);
  });
  it("allows a live effect only in production", () => {
    expect(() => assertExternalEffectAllowed("payment", { APP_ENV: "production", EXTERNAL_INTEGRATIONS_MODE: "live" })).not.toThrow();
  });
  it("blocks financial mutation in preview and permits a guarded local test", () => {
    expect(() => assertLegacyFinancialMutationAllowed({ ...local, APP_ENV: "preview" })).toThrow(/preview/);
    expect(() => assertLegacyFinancialMutationAllowed(local)).not.toThrow();
  });
});
