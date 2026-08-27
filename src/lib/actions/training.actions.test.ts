import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTraining: vi.fn(),
  revalidatePath: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/services/training.service", () => ({
  createTraining: mocks.createTraining,
}));

import { createTrainingAction } from "./training.actions";
import { initialTrainingActionState } from "./training.state";

function formData(fields: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

describe("training actions", () => {
  it("rejects invalid blocks before accessing the session or service", async () => {
    await expect(
      createTrainingAction(
        initialTrainingActionState,
        formData({
          titulo: "Treino",
          descricao: "",
          tipoTreinoId: "",
          blocos: "{json inválido}",
        }),
      ),
    ).resolves.toEqual({
      fieldErrors: { blocos: ["Blocos de treino inválidos."] },
    });

    expect(mocks.requireRole).not.toHaveBeenCalled();
    expect(mocks.createTraining).not.toHaveBeenCalled();
  });

  it("derives ownership from the trainer session and revalidates training pages", async () => {
    const trainer = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      assessoriaId: "550e8400-e29b-41d4-a716-446655440002",
    };
    mocks.requireRole.mockResolvedValue(trainer);
    mocks.createTraining.mockResolvedValue({ data: { id: "training-1" } });

    await expect(
      createTrainingAction(
        initialTrainingActionState,
        formData({
          titulo: "Intervalado de 400 m",
          descricao: "Sessão de velocidade controlada.",
          tipoTreinoId: "550e8400-e29b-41d4-a716-446655440003",
          blocos: JSON.stringify([
            {
              tipo: "principal",
              titulo: "Repetições",
              distanciaMetros: 400,
              repeticoes: 6,
              recuperacaoSegundos: 90,
            },
          ]),
        }),
      ),
    ).resolves.toEqual({ success: "Treino criado." });

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(mocks.createTraining).toHaveBeenCalledWith(trainer, {
      titulo: "Intervalado de 400 m",
      descricao: "Sessão de velocidade controlada.",
      tipoTreinoId: "550e8400-e29b-41d4-a716-446655440003",
      blocos: [
        {
          tipo: "principal",
          titulo: "Repetições",
          distanciaMetros: 400,
          repeticoes: 6,
          recuperacaoSegundos: 90,
        },
      ],
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/treinador/treinos");
  });
});
