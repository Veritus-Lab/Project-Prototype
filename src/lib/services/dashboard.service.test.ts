import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  getAthleteDashboardData,
  getTrainerDashboardData,
} from "./dashboard.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "trainer-1",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

const athleteUser = {
  id: "athlete-1",
  email: "atleta@example.com",
  nome: "Atleta",
  papel: "atleta",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

function countQuery(count: number, error: unknown = null) {
  const eq = vi.fn().mockResolvedValue({ count, error });
  const select = vi.fn().mockReturnValue({ eq });

  return {
    eq,
    select,
  };
}

function chainedCountQuery(count: number, error: unknown = null) {
  const secondEq = vi.fn().mockResolvedValue({ count, error });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  const select = vi.fn().mockReturnValue({ eq: firstEq });

  return {
    firstEq,
    secondEq,
    select,
  };
}

function statusCountQuery(count: number, error: unknown = null) {
  const statusEq = vi.fn().mockResolvedValue({ count, error });
  const athleteEq = vi.fn().mockReturnValue({ eq: statusEq });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: athleteEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    athleteEq,
    select,
    statusEq,
  };
}

function pendingInvitationCountQuery(count: number, error: unknown = null) {
  const gt = vi.fn().mockResolvedValue({ count, error });
  const isRevoked = vi.fn().mockReturnValue({ gt });
  const isUsed = vi.fn().mockReturnValue({ is: isRevoked });
  const statusEq = vi.fn().mockReturnValue({ is: isUsed });
  const trainerEq = vi.fn().mockReturnValue({ eq: statusEq });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    gt,
    isRevoked,
    isUsed,
    select,
    statusEq,
    trainerEq,
  };
}

function recentTrainingsQuery() {
  const limit = vi.fn().mockResolvedValue({
    data: [
      {
        id: "treino-1",
        titulo: "Tiro de 400m",
        descricao: "8 x 400m com 90s de descanso",
        origem: "manual",
        created_at: "2026-08-25T10:00:00.000Z",
      },
      {
        id: "treino-2",
        titulo: "Longao base",
        descricao: null,
        origem: "ia",
        created_at: "2026-08-24T10:00:00.000Z",
      },
    ],
    error: null,
  });
  const order = vi.fn().mockReturnValue({ limit });
  const trainerEq = vi.fn().mockReturnValue({ order });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    limit,
    order,
    select,
    trainerEq,
  };
}

function athleteAssignmentsQuery() {
  const limit = vi.fn().mockResolvedValue({
    data: [
      {
        id: "assignment-1",
        status: "atribuido",
        atribuido_em: "2026-08-25T10:00:00.000Z",
        treinos: {
          titulo: "Regenerativo",
          descricao: "6km leve",
          origem: "manual",
        },
      },
      {
        id: "assignment-2",
        status: "em_andamento",
        atribuido_em: "2026-08-24T10:00:00.000Z",
        treinos: {
          titulo: "Tiro curto",
          descricao: null,
          origem: "ia",
        },
      },
    ],
    error: null,
  });
  const order = vi.fn().mockReturnValue({ limit });
  const athleteEq = vi.fn().mockReturnValue({ order });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: athleteEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    athleteEq,
    limit,
    order,
    select,
  };
}

describe("dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
  });

  it("loads trainer dashboard metrics from the current assessment only", async () => {
    const athletes = countQuery(4);
    const trainings = chainedCountQuery(9);
    const invitations = pendingInvitationCountQuery(2);
    const recentTrainings = recentTrainingsQuery();
    const treinosQueries = [trainings, recentTrainings];
    const from = vi.fn((table: string) => {
      if (table === "atletas") return athletes;
      if (table === "treinos") return treinosQueries.shift();
      if (table === "convites_atletas") return invitations;
      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(getTrainerDashboardData(trainerUser)).resolves.toEqual({
      metrics: [
        {
          label: "Atletas ativos",
          value: "4",
          hint: "Atletas vinculados à sua assessoria.",
        },
        {
          label: "Treinos criados",
          value: "9",
          hint: "Treinos reais cadastrados por você.",
        },
        {
          label: "Convites pendentes",
          value: "2",
          hint: "Convites ativos aguardando aceite.",
        },
      ],
      trainings: [
        {
          id: "treino-1",
          titulo: "Tiro de 400m",
          quando: "Criado em 25/08/2026",
          detalhe: "8 x 400m com 90s de descanso",
        },
        {
          id: "treino-2",
          titulo: "Longao base",
          quando: "Criado em 24/08/2026",
          detalhe: "Origem: IA",
        },
      ],
    });

    expect(athletes.select).toHaveBeenCalledWith("*", {
      count: "exact",
      head: true,
    });
    expect(athletes.eq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(trainings.firstEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(trainings.secondEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(invitations.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(invitations.trainerEq).toHaveBeenCalledWith(
      "treinador_id",
      "trainer-1",
    );
    expect(invitations.statusEq).toHaveBeenCalledWith("status", "pendente");
    expect(invitations.isUsed).toHaveBeenCalledWith("usado_em", null);
    expect(invitations.isRevoked).toHaveBeenCalledWith("revogado_em", null);
    expect(invitations.gt).toHaveBeenCalledWith(
      "expira_em",
      "2026-08-25T12:00:00.000Z",
    );
    expect(recentTrainings.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(recentTrainings.trainerEq).toHaveBeenCalledWith(
      "treinador_id",
      "trainer-1",
    );
  });

  it("loads athlete dashboard metrics and assigned trainings for the current athlete only", async () => {
    const assigned = chainedCountQuery(5);
    const inProgress = statusCountQuery(1);
    const done = statusCountQuery(3);
    const assignments = athleteAssignmentsQuery();
    const assignmentQueries = [assigned, inProgress, done, assignments];
    const from = vi.fn((table: string) => {
      if (table === "treinos_atletas") {
        return assignmentQueries.shift();
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(getAthleteDashboardData(athleteUser)).resolves.toEqual({
      metrics: [
        {
          label: "Treinos atribuídos",
          value: "5",
          hint: "Treinos vinculados ao seu perfil.",
        },
        {
          label: "Em andamento",
          value: "1",
          hint: "Treinos iniciados e ainda não concluídos.",
        },
        {
          label: "Concluídos",
          value: "3",
          hint: "Treinos finalizados por você.",
        },
      ],
      trainings: [
        {
          id: "assignment-1",
          titulo: "Regenerativo",
          quando: "Atribuído em 25/08/2026",
          detalhe: "6km leve",
        },
        {
          id: "assignment-2",
          titulo: "Tiro curto",
          quando: "Atribuído em 24/08/2026",
          detalhe: "Em andamento",
        },
      ],
    });

    expect(assigned.firstEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(assigned.secondEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
    expect(inProgress.athleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
    expect(inProgress.statusEq).toHaveBeenCalledWith("status", "em_andamento");
    expect(done.athleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
    expect(done.statusEq).toHaveBeenCalledWith("status", "concluido");
    expect(assignments.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(assignments.athleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
  });
});
