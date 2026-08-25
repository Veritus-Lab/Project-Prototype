import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { listTrainerAthletes } from "./athlete.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "trainer-1",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

function listAthletesQuery() {
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        id: "athlete-1",
        treinador_id: "trainer-1",
        created_at: "2026-08-25T10:00:00.000Z",
        profiles: {
          nome: "Bia Corredora",
          created_at: "2026-08-24T10:00:00.000Z",
        },
      },
      {
        id: "athlete-2",
        treinador_id: null,
        created_at: "2026-08-23T10:00:00.000Z",
        profiles: {
          nome: "Caio Pace",
          created_at: "2026-08-23T10:00:00.000Z",
        },
      },
    ],
    error: null,
  });
  const trainerEq = vi.fn().mockReturnValue({ order });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    order,
    select,
    trainerEq,
  };
}

describe("athlete service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists athletes for the current trainer and assessment only", async () => {
    const athletes = listAthletesQuery();
    const from = vi.fn((table: string) => {
      if (table === "atletas") {
        return athletes;
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(listTrainerAthletes(trainerUser)).resolves.toEqual({
      data: [
        {
          id: "athlete-1",
          nome: "Bia Corredora",
          vinculo: "Vinculado a você",
          criadoEm: "25/08/2026",
        },
        {
          id: "athlete-2",
          nome: "Caio Pace",
          vinculo: "Sem treinador definido",
          criadoEm: "23/08/2026",
        },
      ],
    });

    expect(athletes.select).toHaveBeenCalledWith(
      "id, treinador_id, created_at, profiles!atletas_profile_fkey(nome, created_at)",
    );
    expect(athletes.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(athletes.trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(athletes.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("returns a public error when Supabase cannot load athletes", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
    });
    const trainerEq = vi.fn().mockReturnValue({ order });
    const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
    const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    await expect(listTrainerAthletes(trainerUser)).resolves.toEqual({
      error: "Não foi possível carregar os atletas agora.",
    });
  });
});
