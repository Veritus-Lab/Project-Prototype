import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getUser: vi.fn(),
  from: vi.fn(),
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

type QueryResult = { data: unknown; error: unknown };

function query(result: QueryResult) {
  const builder = {
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn().mockResolvedValue(result),
    select: vi.fn(() => builder),
  };
  return builder;
}

function mockRoleResolution({
  member,
  student,
}: {
  member: QueryResult;
  student: QueryResult;
}) {
  mocks.from.mockImplementation((table: string) => {
    if (table === "profiles") {
      return query({
        data: {
          id: authenticatedUser.id,
          nome: "Ana Corre",
          assessoria_id: "assessoria-123",
        },
        error: null,
      });
    }
    if (table === "team_members") return query(member);
    if (table === "students") return query(student);
    throw new Error(`unexpected table: ${table}`);
  });
}

describe("session authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: mocks.from,
    });
    mocks.getUser.mockResolvedValue({ data: { user: authenticatedUser }, error: null });
  });

  it("returns an active persisted team role, never client-selected metadata", async () => {
    mockRoleResolution({
      member: { data: { id: "member-1", role: "socio" }, error: null },
      student: { data: null, error: null },
    });

    await expect(requireUser()).resolves.toEqual({
      id: "user-123",
      email: "atleta@flernk.app",
      nome: "Ana Corre",
      papel: "treinador",
      role: "socio",
      assessoriaId: "assessoria-123",
      teamMemberId: "member-1",
      studentId: null,
    });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.from).toHaveBeenCalledWith("team_members");
  });

  it("allows a professor into the legacy trainer dashboard", async () => {
    mockRoleResolution({
      member: { data: { id: "member-2", role: "professor" }, error: null },
      student: { data: null, error: null },
    });

    await expect(requireRole("treinador")).resolves.toMatchObject({
      papel: "treinador",
      role: "professor",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects an athlete to the athlete dashboard when requesting a trainer route", async () => {
    mockRoleResolution({
      member: { data: null, error: null },
      student: { data: { id: "student-1" }, error: null },
    });
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
    mocks.from.mockImplementation((table: string) => {
      if (table === "profiles") return query({ data: null, error: null });
      throw new Error(`unexpected table: ${table}`);
    });

    await expect(requireUser()).rejects.toThrow("conta ainda não está configurada");
  });
});
