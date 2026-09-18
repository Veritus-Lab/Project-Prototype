import { describe, expect, it } from "vitest";

import { assertNoLeakedPublicSecrets, getServerEnv, requireServerSecret } from "./server-env";

describe("server-env security", () => {
  it("allows safe environment configurations", () => {
    const env = getServerEnv({
      NODE_ENV: "test",
      APP_ENV: "test",
      EXTERNAL_INTEGRATIONS_MODE: "disabled",
      RESEND_API_KEY: "re_test_key_12345",
      ASAAS_WEBHOOK_TOKEN: "secure_token_12345",
    });

    expect(env.APP_ENV).toBe("test");
    expect(env.RESEND_API_KEY).toBe("re_test_key_12345");
  });

  it("throws when a server secret has a NEXT_PUBLIC_ prefix", () => {
    expect(() =>
      assertNoLeakedPublicSecrets({
        NEXT_PUBLIC_RESEND_API_KEY: "re_leak_test",
      }),
    ).toThrow("FALHA CRÍTICA DE SEGURANÇA");

    expect(() =>
      assertNoLeakedPublicSecrets({
        NEXT_PUBLIC_ASAAS_API_KEY: "asaas_leak_test",
      }),
    ).toThrow("FALHA CRÍTICA DE SEGURANÇA");

    expect(() =>
      assertNoLeakedPublicSecrets({
        NEXT_PUBLIC_CRON_SECRET: "cron_leak_test",
      }),
    ).toThrow("FALHA CRÍTICA DE SEGURANÇA");
  });

  it("throws when requireServerSecret fails to find a requested key", () => {
    expect(() =>
      requireServerSecret("CRON_SECRET", {
        NODE_ENV: "test",
      }),
    ).toThrow("não está configurada no ambiente");
  });

  it("returns the secret when present in requireServerSecret", () => {
    const val = requireServerSecret("CRON_SECRET", {
      NODE_ENV: "test",
      CRON_SECRET: "min_16_characters_secret_key_123",
    });
    expect(val).toBe("min_16_characters_secret_key_123");
  });
});
