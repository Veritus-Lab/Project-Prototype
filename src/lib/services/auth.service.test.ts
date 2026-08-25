import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { signUpTrainer } from "./auth.service";

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
    mocks.createServerClient.mockResolvedValue({ auth: { signUp: mocks.signUp } });
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
});
