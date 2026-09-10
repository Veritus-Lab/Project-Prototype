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
  id: "00000000-0000-4000-8000-000000000001",
  email: "socio@example.invalid",
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

function profileResult(): QueryResult {
  return {
    data: {
      id: authenticatedUser.id,
      nome: "Sócia Teste",
      papel: "treinador",
      assessoria_id: "00000000-0000-4000-8000-000000000100",
    },
    error: null,
  };
}

describe("FLERNK role session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: mocks.from,
    });
    mocks.getUser.mockResolvedValue({ data: { user: authenticatedUser }, error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === "profiles") return query(profileResult());
      if (table === "team_members") {
        return query({
          data: {
            id: "00000000-0000-4000-8000-000000000010",
            role: "socio",
            status: "active",
          },
          error: null,
        });
      }
      if (table === "students") return query({ data: null, error: null });
      throw new Error(`unexpected table: ${table}`);
    });
  });

  it("resolves an active socio membership instead of the legacy profile role", async () => {
    await expect(requireRole("socio")).resolves.toMatchObject({
      role: "socio",
      teamMemberId: "00000000-0000-4000-8000-000000000010",
      studentId: null,
    });
  });

  it("redirects a professor away from a socio-only operation", async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === "profiles") return query(profileResult());
      if (table === "team_members") {
        return query({
          data: {
            id: "00000000-0000-4000-8000-000000000011",
            role: "professor",
            status: "active",
          },
          error: null,
        });
      }
      if (table === "students") return query({ data: null, error: null });
      throw new Error(`unexpected table: ${table}`);
    });
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(requireRole("socio")).rejects.toThrow("NEXT_REDIRECT:/treinador");
  });

  it("fails closed after a team membership is removed and no student ownership exists", async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === "profiles") return query(profileResult());
      if (table === "team_members") return query({ data: null, error: null });
      if (table === "students") return query({ data: null, error: null });
      throw new Error(`unexpected table: ${table}`);
    });

    await expect(requireUser()).rejects.toThrow("conta ainda não está configurada");
  });
});
