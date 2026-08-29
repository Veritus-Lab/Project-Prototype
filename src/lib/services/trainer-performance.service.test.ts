import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { getTrainerPerformanceData } from "./trainer-performance.service";
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
    data: [{ id: "athlete-1" }, { id: "athlete-2" }],
    error: null,
  });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, select, trainerEq };
}

function assignmentsQuery() {
  const lt = vi.fn().mockResolvedValue({
    data: [
      { id: "assignment-1", agendado_para: "2026-08-25T13:00:00.000Z", status: "atribuido" },
      { id: "assignment-2", agendado_para: "2026-08-28T13:00:00.000Z", status: "atribuido" },
      { id: "assignment-cancelled", agendado_para: "2026-08-25T15:00:00.000Z", status: "cancelado" },
    ],
    error: null,
  });
  const gte = vi.fn().mockReturnValue({ lt });
  const inAthletes = vi.fn().mockReturnValue({ gte });
  const assessoriaEq = vi.fn().mockReturnValue({ in: inAthletes });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, gte, inAthletes, lt, select };
}

function executionsQuery() {
  const lt = vi.fn().mockResolvedValue({
    data: [
      {
        treino_atleta_id: "assignment-1",
        rpe: 6,
        duracao_real_minutos: 35,
        distancia_real_metros: 5000,
        registrado_em: "2026-08-25T15:00:00.000Z",
      },
      {
        treino_atleta_id: "assignment-other-week",
        rpe: 8,
        duracao_real_minutos: 12,
        distancia_real_metros: 1600,
        registrado_em: "2026-08-26T14:00:00.000Z",
      },
    ],
    error: null,
  });
  const gte = vi.fn().mockReturnValue({ lt });
  const statusEq = vi.fn().mockReturnValue({ gte });
  const inAthletes = vi.fn().mockReturnValue({ eq: statusEq });
  const assessoriaEq = vi.fn().mockReturnValue({ in: inAthletes });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, gte, inAthletes, lt, select, statusEq };
}

describe("trainer performance service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates team indicators from current trainer executions only", async () => {
    const assessoria = assessoriaQuery();
    const athletes = athleteQuery();
    const assignments = assignmentsQuery();
    const executions = executionsQuery();
    const from = vi.fn((table: string) => {
      if (table === "assessorias") return assessoria;
      if (table === "atletas") return athletes;
      if (table === "treinos_atletas") return assignments;
      if (table === "execucoes_treino") return executions;
      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(
      getTrainerPerformanceData(trainerUser, new Date("2026-08-26T12:00:00.000Z")),
    ).resolves.toEqual({
      data: {
        days: [
          { dateKey: "2026-08-24", executions: 0, isToday: false, weekday: "seg" },
          { dateKey: "2026-08-25", executions: 1, isToday: false, weekday: "ter" },
          { dateKey: "2026-08-26", executions: 1, isToday: true, weekday: "qua" },
          { dateKey: "2026-08-27", executions: 0, isToday: false, weekday: "qui" },
          { dateKey: "2026-08-28", executions: 0, isToday: false, weekday: "sex" },
          { dateKey: "2026-08-29", executions: 0, isToday: false, weekday: "sáb" },
          { dateKey: "2026-08-30", executions: 0, isToday: false, weekday: "dom" },
        ],
        metrics: [
          { label: "Execuções concluídas", value: "2", hint: "Registros concluídos nesta semana." },
          { label: "Adesão semanal", value: "100%", hint: "1 de 1 treinos previstos até agora." },
          { label: "Distância registrada", value: "6,6 km", hint: "Somente distância informada pelos atletas." },
          { label: "Tempo registrado", value: "47 min", hint: "Somente duração informada pelos atletas." },
        ],
        rpeAverage: "7.0",
      },
    });

    expect(athletes.assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(athletes.trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(assignments.inAthletes).toHaveBeenCalledWith("atleta_id", ["athlete-1", "athlete-2"]);
    expect(executions.inAthletes).toHaveBeenCalledWith("atleta_id", ["athlete-1", "athlete-2"]);
    expect(executions.statusEq).toHaveBeenCalledWith("status", "concluido");
    expect(assignments.gte).toHaveBeenCalledWith("agendado_para", "2026-08-24T03:00:00.000Z");
    expect(executions.lt).toHaveBeenCalledWith("registrado_em", "2026-08-31T03:00:00.000Z");
  });
});
