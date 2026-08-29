import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  acceptInvitation,
  inspectInvitation,
} from "./invitation.service";

function createSupabaseMock() {
  const rpc = vi.fn();
  const signUp = vi.fn();
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: "athlete-1" } },
  });

  mocks.createServerClient.mockResolvedValue({
    rpc,
    auth: { signUp, getUser },
  });

  return { rpc, signUp, getUser };
}

describe("invitation acceptance service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.flernk.test");
  });

  it("inspects a valid invitation without exposing internal identifiers", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValueOnce({
      data: [
        {
          email_mascarado: "a***a@example.com",
          assessoria_nome: "Assessoria Alfa",
          estado: "pendente",
        },
      ],
      error: null,
    });

    await expect(inspectInvitation("raw_token")).resolves.toEqual({
      data: {
        maskedEmail: "a***a@example.com",
        assessoriaNome: "Assessoria Alfa",
        state: "active",
      },
    });
    expect(supabase.rpc).toHaveBeenCalledWith("validar_convite", {
      hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it.each([
    ["invalido", "invalid"],
    ["expirado", "expired"],
    ["revogado", "revoked"],
    ["aceito", "used"],
  ] as const)("maps public invitation state %s", async (estado, state) => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValueOnce({
      data: [{ email_mascarado: null, assessoria_nome: null, estado }],
      error: null,
    });

    await expect(inspectInvitation("raw_token")).resolves.toEqual({
      data: {
        maskedEmail: null,
        assessoriaNome: null,
        state,
      },
    });
  });

  it("signs up an athlete and accepts the invitation atomically by RPC", async () => {
    const supabase = createSupabaseMock();
    supabase.signUp.mockResolvedValueOnce({
      data: { user: { id: "athlete-1" }, session: { access_token: "token" } },
      error: null,
    });
    supabase.rpc.mockResolvedValueOnce({ data: undefined, error: null });

    await expect(
      acceptInvitation({
        token: "raw_token",
        nome: "Ana Atleta",
        email: "ANA@Example.COM",
        senha: "Segura123",
      }),
    ).resolves.toEqual({ data: { confirmationRequired: false } });

    expect(supabase.signUp).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "Segura123",
      options: {
        emailRedirectTo:
          "https://app.flernk.test/auth/callback?convite=raw_token&nome=Ana+Atleta",
        data: {
          nome: "Ana Atleta",
          papel: "atleta",
        },
      },
    });
    expect(supabase.rpc).toHaveBeenCalledWith("aceitar_convite", {
      hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      user_id: "athlete-1",
      nome: "Ana Atleta",
    });
  });

  it("waits for email confirmation before accepting when Supabase creates no session", async () => {
    const supabase = createSupabaseMock();
    supabase.signUp.mockResolvedValueOnce({
      data: { user: { id: "athlete-1" }, session: null },
      error: null,
    });

    await expect(
      acceptInvitation({
        token: "raw_token",
        nome: "Ana Atleta",
        email: "ana@example.com",
        senha: "Segura123",
      }),
    ).resolves.toEqual({ data: { confirmationRequired: true } });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns a public error when the authenticated email diverges from the invitation", async () => {
    const supabase = createSupabaseMock();
    supabase.signUp.mockResolvedValueOnce({
      data: { user: { id: "athlete-1" }, session: { access_token: "token" } },
      error: null,
    });
    supabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "email nao corresponde ao convite" },
    });

    await expect(
      acceptInvitation({
        token: "raw_token",
        nome: "Ana Atleta",
        email: "outra@example.com",
        senha: "Segura123",
      }),
    ).resolves.toEqual({
      error: "Use o mesmo e-mail que recebeu o convite.",
    });
  });
});
