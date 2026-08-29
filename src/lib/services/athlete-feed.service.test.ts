import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  getAthleteDailyFeed,
  type AthleteDailyFeedData,
} from "./athlete-feed.service";
import type { SessionUser } from "@/lib/auth/session";

const athleteUser = {
  id: "athlete-1",
  email: "atleta@example.com",
  nome: "Atleta",
  papel: "atleta",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

const now = new Date("2026-08-28T12:00:00.000Z");

function assignmentsQuery(
  data: unknown[] | null,
  error: unknown = null,
) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const not = vi.fn().mockReturnValue({ order });
  const athleteEq = vi.fn().mockReturnValue({ not });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: athleteEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, athleteEq, not, order, select };
}

function assignment(overrides: Record<string, unknown> = {}) {
  return {
    id: "today",
    status: "atribuido",
    atribuido_em: "2026-08-28T08:00:00.000Z",
    agendado_para: "2026-08-28T15:00:00.000Z",
    timezone: "America/Sao_Paulo",
    observacao_treinador: "Foco na técnica",
    treinos: {
      titulo: "Treino de velocidade",
      descricao: "8 x 400m",
      origem: "manual",
    },
    ...overrides,
  };
}

describe("athlete daily feed service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prioritizes a same-day assignment, including concluded status", async () => {
    const query = assignmentsQuery([
      assignment({ id: "today", status: "concluido" }),
      assignment({
        id: "tomorrow",
        agendado_para: "2026-08-29T12:00:00.000Z",
      }),
    ]);
    const from = vi.fn().mockReturnValue(query);
    mocks.createServerClient.mockResolvedValue({ from });

    const result = await getAthleteDailyFeed(athleteUser, now);

    expect(result).toMatchObject({
      data: {
        priority: {
          id: "today",
          isToday: true,
          status: "concluido",
          title: "Treino de velocidade",
          detail: "Foco na técnica",
          scheduledAt: "2026-08-28T15:00:00.000Z",
        },
        recent: [{ id: "tomorrow" }],
      },
    });
    expect(query.athleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
    expect(query.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
  });

  it("uses the next assignment when there is no assignment today", async () => {
    const query = assignmentsQuery([
      assignment({
        id: "next",
        agendado_para: "2026-08-29T12:00:00.000Z",
      }),
    ]);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    const result = await getAthleteDailyFeed(athleteUser, now);

    expect(result).toMatchObject({
      data: { priority: { id: "next", isToday: false, status: "atribuido" } },
    });
  });

  it("finds a future assignment after more than twelve past assignments", async () => {
    const pastAssignments = Array.from({ length: 13 }, (_, index) =>
      assignment({
        id: `past-${index}`,
        agendado_para: `2026-08-${String(1 + index).padStart(2, "0")}T12:00:00.000Z`,
      }),
    );
    const query = assignmentsQuery([
      ...pastAssignments,
      assignment({
        id: "future",
        agendado_para: "2026-09-01T12:00:00.000Z",
      }),
    ]);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(getAthleteDailyFeed(athleteUser, now)).resolves.toMatchObject({
      data: { priority: { id: "future", isToday: false } },
    });
  });

  it("returns the three most recent assignments without the priority item", async () => {
    const query = assignmentsQuery([
      assignment({ id: "today" }),
      assignment({ id: "next-1", agendado_para: "2026-08-29T12:00:00.000Z" }),
      assignment({ id: "next-2", agendado_para: "2026-08-30T12:00:00.000Z" }),
      assignment({ id: "next-3", agendado_para: "2026-08-31T12:00:00.000Z" }),
      assignment({ id: "next-4", agendado_para: "2026-09-01T12:00:00.000Z" }),
    ]);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    const result = await getAthleteDailyFeed(athleteUser, now);

    expect(result).toMatchObject({
      data: {
        priority: { id: "today" },
        recent: [{ id: "next-4" }, { id: "next-3" }, { id: "next-2" }],
      },
    });
  });

  it("returns an empty contract when there are no assignments", async () => {
    const query = assignmentsQuery([]);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(getAthleteDailyFeed(athleteUser, now)).resolves.toEqual({
      data: { priority: null, recent: [] } satisfies AthleteDailyFeedData,
    });
  });

  it("returns the user-facing error when Supabase fails", async () => {
    const query = assignmentsQuery(null, new Error("database unavailable"));
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    await expect(getAthleteDailyFeed(athleteUser, now)).resolves.toEqual({
      error: "Nao foi possivel carregar seu treino de hoje.",
    });
  });
});
