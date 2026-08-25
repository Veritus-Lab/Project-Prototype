import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signIn: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/services/auth.service", () => ({
  genericSignInError: "Não foi possível entrar agora. Tente novamente.",
  signIn: mocks.signIn,
}));

vi.mock("@/lib/auth/session", () => ({
  destinationForPapel: (papel: "treinador" | "atleta") =>
    papel === "treinador" ? "/treinador" : "/atleta",
  requireUser: mocks.requireUser,
}));

import { initialLoginActionState, signInAction } from "./actions";

function formData(fields: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

describe("signInAction", () => {
  it("returns field errors before calling the auth service", async () => {
    const result = await signInAction(
      initialLoginActionState,
      formData({ email: "email-invalido", senha: "" }),
    );

    expect(result.fieldErrors?.email?.[0]).toBe("Informe um e-mail válido.");
    expect(result.fieldErrors?.senha?.[0]).toBe("Informe sua senha.");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("returns a public error when credentials are rejected", async () => {
    mocks.signIn.mockResolvedValueOnce({ error: "E-mail ou senha incorretos." });

    await expect(
      signInAction(
        initialLoginActionState,
        formData({ email: "ANA@EXAMPLE.COM", senha: "Segura123" }),
      ),
    ).resolves.toEqual({ error: "E-mail ou senha incorretos." });
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "ana@example.com",
      senha: "Segura123",
    });
    expect(mocks.requireUser).not.toHaveBeenCalled();
  });

  it("redirects using the persisted profile role after successful sign in", async () => {
    mocks.signIn.mockResolvedValueOnce({ data: { email: "ana@example.com" } });
    mocks.requireUser.mockResolvedValueOnce({ papel: "atleta" });
    mocks.redirect.mockImplementationOnce((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(
      signInAction(
        initialLoginActionState,
        formData({ email: "ana@example.com", senha: "Segura123" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/atleta");
    expect(mocks.redirect).toHaveBeenCalledWith("/atleta");
  });
});
