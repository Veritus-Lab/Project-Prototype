import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  legacySignupDisabledError,
  getConfiguredAppOrigin,
  signIn,
  signOut,
  signUpTrainer,
} from "./auth.service";

const validTrainer = {
  nome: "Rodrigo Sousa",
  assessoria: "FLERNK Running",
  email: "rodrigo@example.com",
  senha: "Segura123",
};

describe("signUpTrainer", () => {
  beforeEach(() => {
    mocks.createServerClient.mockReset();
    mocks.signUp.mockReset();
    mocks.signInWithPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.createServerClient.mockResolvedValue({ auth: {
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the legacy public signup disabled without contacting Supabase", async () => {
    await expect(signUpTrainer(validTrainer)).resolves.toEqual({
      error: legacySignupDisabledError,
    });

    expect(mocks.createServerClient).not.toHaveBeenCalled();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it.each([
    ["development", "https://app.flernk.test/entrada", undefined, undefined, "https://app.flernk.test"],
    ["development", "ftp://app.flernk.test", undefined, undefined, undefined],
    ["production", undefined, "https://flernk.example.com/prd", undefined, "https://flernk.example.com"],
    ["production", undefined, undefined, "preview.flernk.example.com", "https://preview.flernk.example.com"],
  ])(
    "resolves the callback origin safely in %s",
    (nodeEnvironment, siteUrl, productionUrl, vercelUrl, expected) => {
      vi.stubEnv("NODE_ENV", nodeEnvironment);
      if (siteUrl) vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
      if (productionUrl) vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", productionUrl);
      if (vercelUrl) vi.stubEnv("VERCEL_URL", vercelUrl);

      expect(getConfiguredAppOrigin()).toBe(expected);
    },
  );

  it.each([
    [null, { data: { email: validTrainer.email } }],
    [{ message: "Invalid login credentials" }, { error: "E-mail ou senha incorretos." }],
    [{ message: "Email not confirmed" }, { error: "Confirme seu e-mail antes de entrar. Procure o link que enviamos para você." }],
    [{ message: "provider unavailable" }, { error: "Não foi possível entrar agora. Tente novamente." }],
  ])("maps sign-in responses", async (error, expected) => {
    mocks.signInWithPassword.mockResolvedValueOnce({ error });
    await expect(signIn({ email: validTrainer.email, senha: validTrainer.senha })).resolves.toEqual(expected);
  });

  it("handles sign-in exceptions and always resolves sign-out", async () => {
    mocks.signInWithPassword.mockRejectedValueOnce(new Error("network"));
    await expect(signIn({ email: validTrainer.email, senha: validTrainer.senha })).resolves.toEqual({ error: "Não foi possível entrar agora. Tente novamente." });
    mocks.signOut.mockRejectedValueOnce(new Error("network"));
    await expect(signOut()).resolves.toBeUndefined();
  });
});
