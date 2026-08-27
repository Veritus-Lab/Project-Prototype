import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  createTraining,
  listTrainerTrainings,
} from "./training.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "550e8400-e29b-41d4-a716-446655440002",
} satisfies SessionUser;

const input = {
  titulo: "Intervalado de 400 m",
  descricao: "Sessão de velocidade controlada.",
  tipoTreinoId: "550e8400-e29b-41d4-a716-446655440003",
  blocos: [
    {
      tipo: "principal" as const,
      titulo: "Repetições de 400 m",
      distanciaMetros: 400,
      repeticoes: 6,
      recuperacaoSegundos: 90,
    },
  ],
};

function activeTrainingTypeQuery(data: unknown = { id: input.tipoTreinoId }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  return { select };
}

describe("training service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a manual training using only the authenticated trainer tenant", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "training-1",
        titulo: input.titulo,
        descricao: input.descricao,
        tipo_treino_id: input.tipoTreinoId,
        estrutura: { blocos: input.blocos },
        created_at: "2026-08-27T10:00:00.000Z",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const trainingType = activeTrainingTypeQuery();
    const from = vi.fn((table: string) => {
      if (table === "tipos_treino_catalogo") {
        return trainingType;
      }

      if (table === "treinos") {
        return { insert };
      }

      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(createTraining(trainerUser, input)).resolves.toEqual({
      data: {
        id: "training-1",
        titulo: input.titulo,
        descricao: input.descricao,
        tipoTreinoId: input.tipoTreinoId,
        blocos: input.blocos,
        criadoEm: "2026-08-27T10:00:00.000Z",
      },
    });

    expect(insert).toHaveBeenCalledWith({
      assessoria_id: trainerUser.assessoriaId,
      treinador_id: trainerUser.id,
      titulo: input.titulo,
      descricao: input.descricao,
      tipo_treino_id: input.tipoTreinoId,
      origem: "manual",
      estrutura: { blocos: input.blocos },
    });
  });

  it("returns a generic error when RLS or a tenant constraint denies creation", async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const trainingType = activeTrainingTypeQuery(null);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn((table: string) =>
        table === "tipos_treino_catalogo" ? trainingType : { insert },
      ),
    });

    await expect(createTraining(trainerUser, input)).resolves.toEqual({
      error: "Não foi possível criar o treino agora.",
    });
  });

  it("lists trainings scoped by the current trainer and assessment", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "training-1",
          titulo: "Longão confortável",
          descricao: null,
          tipo_treino_id: null,
          estrutura: { blocos: input.blocos },
          created_at: "2026-08-27T10:00:00.000Z",
        },
      ],
      error: null,
    });
    const trainerEq = vi.fn().mockReturnValue({ order });
    const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
    const select = vi.fn().mockReturnValue({ eq: assessoriaEq });
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    await expect(listTrainerTrainings(trainerUser)).resolves.toEqual({
      data: [
        {
          id: "training-1",
          titulo: "Longão confortável",
          descricao: null,
          tipoTreinoId: null,
          quantidadeBlocos: 1,
          criadoEm: "2026-08-27T10:00:00.000Z",
        },
      ],
    });

    expect(assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      trainerUser.assessoriaId,
    );
    expect(trainerEq).toHaveBeenCalledWith("treinador_id", trainerUser.id);
  });
});
