import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { getTrainerWeeklySchedule } from "./trainer-calendar.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "trainer-1",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

function assessoriaQuery() {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { timezone: "America/Sao_Paulo" },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  return { eq, maybeSingle, select };
}

function athleteQuery() {
  const trainerEq = vi.fn().mockResolvedValue({
    data: [
      { id: "athlete-1", profiles: { nome: "Bia" } },
      { id: "athlete-2", profiles: { nome: "Carlos" } },
    ],
    error: null,
  });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, select, trainerEq };
}

function assignmentQuery() {
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        id: "assignment-1",
        atleta_id: "athlete-1",
        agendado_para: "2026-08-26T13:00:00.000Z",
        status: "atribuido",
        treinos: { titulo: "Intervalado" },
      },
      {
        id: "assignment-other",
        atleta_id: "outside-athlete",
        agendado_para: "2026-08-26T14:00:00.000Z",
        status: "atribuido",
        treinos: { titulo: "Não deve aparecer" },
      },
    ],
    error: null,
  });
  const lt = vi.fn().mockReturnValue({ order });
  const gte = vi.fn().mockReturnValue({ lt });
  const inAthletes = vi.fn().mockReturnValue({ gte });
  const assessoriaEq = vi.fn().mockReturnValue({ in: inAthletes });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, gte, inAthletes, lt, order, select };
}

describe("trainer calendar service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads only the current trainer athletes and their assignments for the current week", async () => {
    const assessoria = assessoriaQuery();
    const athletes = athleteQuery();
    const assignments = assignmentQuery();
    const from = vi.fn((table: string) => {
      if (table === "assessorias") return assessoria;
      if (table === "atletas") return athletes;
      if (table === "treinos_atletas") return assignments;
      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(
      getTrainerWeeklySchedule(trainerUser, new Date("2026-08-26T12:00:00.000Z")),
    ).resolves.toEqual({
      data: {
        timezone: "America/Sao_Paulo",
        days: [
          { dateKey: "2026-08-24", dayNumber: "24", events: [], isToday: false, weekday: "seg" },
          { dateKey: "2026-08-25", dayNumber: "25", events: [], isToday: false, weekday: "ter" },
          {
            dateKey: "2026-08-26",
            dayNumber: "26",
            isToday: true,
            weekday: "qua",
            events: [
              {
                athleteId: "athlete-1",
                athleteName: "Bia",
                id: "assignment-1",
                status: "Atribuído",
                time: "10:00",
                trainingTitle: "Intervalado",
              },
            ],
          },
          { dateKey: "2026-08-27", dayNumber: "27", events: [], isToday: false, weekday: "qui" },
          { dateKey: "2026-08-28", dayNumber: "28", events: [], isToday: false, weekday: "sex" },
          { dateKey: "2026-08-29", dayNumber: "29", events: [], isToday: false, weekday: "sáb" },
          { dateKey: "2026-08-30", dayNumber: "30", events: [], isToday: false, weekday: "dom" },
        ],
      },
    });

    expect(athletes.assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(athletes.trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(assignments.assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(assignments.inAthletes).toHaveBeenCalledWith("atleta_id", ["athlete-1", "athlete-2"]);
    expect(assignments.gte).toHaveBeenCalledWith("agendado_para", "2026-08-24T03:00:00.000Z");
    expect(assignments.lt).toHaveBeenCalledWith("agendado_para", "2026-08-31T03:00:00.000Z");
  });
});
