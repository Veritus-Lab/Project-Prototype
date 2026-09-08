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

import { signIn, signOut, signUpTrainer } from "./auth.service";

const validTrainer = {
  nome: "Rodrigo Sousa",
  assessoria: "FLERNK Running",
  email: "rodrigo@example.com",
  senha: "Segura123",
};

const genericError = "Não foi possível criar sua conta agora. Tente novamente.";

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

  it.each(["", "not a URL", "ftp://app.example.com"])(
    "returns a public error when the configured app origin is invalid (%s)",
    async (configuredUrl) => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", configuredUrl);

      await expect(signUpTrainer(validTrainer)).resolves.toEqual({
        error: genericError,
      });
    },
  );

  it("returns a public error when Supabase signup throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.com");
    mocks.signUp.mockRejectedValueOnce(new Error("network unavailable"));

    await expect(signUpTrainer(validTrainer)).resolves.toEqual({ error: genericError });
  });

  it("creates a trainer and translates duplicate accounts", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.com");
    mocks.signUp.mockResolvedValueOnce({ error: null });
    await expect(signUpTrainer(validTrainer)).resolves.toEqual({ data: { email: validTrainer.email } });
    expect(mocks.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: validTrainer.email,
      options: expect.objectContaining({ emailRedirectTo: "https://app.example.com/auth/callback" }),
    }));

    mocks.signUp.mockResolvedValueOnce({ error: { message: "User already registered" } });
    await expect(signUpTrainer(validTrainer)).resolves.toEqual({ error: "Já existe uma conta com este e-mail. Se ela for sua, entre para continuar." });
  });

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
