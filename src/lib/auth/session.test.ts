import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { requireRole, requireUser } from "./session";

const authenticatedUser = {
  id: "user-123",
  email: "atleta@flernk.app",
};

function mockProfile(papel: "treinador" | "atleta") {
  mocks.maybeSingle.mockResolvedValue({
    data: {
      id: authenticatedUser.id,
      nome: "Ana Corre",
      papel,
      assessoria_id: "assessoria-123",
    },
    error: null,
  });
}

describe("session authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: mocks.from,
    });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.getUser.mockResolvedValue({ data: { user: authenticatedUser }, error: null });
  });

  it("returns the persisted trainer profile, never client-selected role metadata", async () => {
    mockProfile("treinador");

    await expect(requireUser()).resolves.toEqual({
      id: "user-123",
      email: "atleta@flernk.app",
      nome: "Ana Corre",
      papel: "treinador",
      assessoriaId: "assessoria-123",
    });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.eq).toHaveBeenCalledWith("id", authenticatedUser.id);
  });

  it("allows a trainer into the trainer dashboard", async () => {
    mockProfile("treinador");

    await expect(requireRole("treinador")).resolves.toMatchObject({
      papel: "treinador",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects an athlete to the athlete dashboard when requesting a trainer route", async () => {
    mockProfile("atleta");
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(requireRole("treinador")).rejects.toThrow("NEXT_REDIRECT:/atleta");
    expect(mocks.redirect).toHaveBeenCalledWith("/atleta");
  });

  it("redirects anonymous users to login", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(requireRole("atleta")).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("fails safely when an authenticated user has no persisted profile", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(requireUser()).rejects.toThrow("conta ainda não está configurada");
  });
});
