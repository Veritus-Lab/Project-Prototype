import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { listExerciseCatalog } from "./exercise.service";

function exerciseCatalogQuery() {
  const orderByName = vi.fn().mockResolvedValue({
    data: [
      {
        id: "exercise-1",
        nome: "Agachamento",
        categoria: "forca",
        nivel: "iniciante",
        descricao_curta: "Fortalece membros inferiores para suporte na corrida.",
        instrucoes:
          "Execute com amplitude confortável, tronco firme e controle na descida.",
        alerta:
          "Interrompa em caso de dor aguda e procure orientação profissional.",
      },
      {
        id: "exercise-2",
        nome: "Prancha frontal",
        categoria: "core",
        nivel: "iniciante",
        descricao_curta: "Desenvolve estabilidade de tronco para a corrida.",
        instrucoes:
          "Mantenha alinhamento entre ombros, quadris e tornozelos sem prender a respiração.",
        alerta:
          "Interrompa em caso de dor aguda e procure orientação profissional.",
      },
    ],
    error: null,
  });
  const orderByCategory = vi.fn().mockReturnValue({ order: orderByName });
  const select = vi.fn().mockReturnValue({ order: orderByCategory });

  return {
    orderByCategory,
    orderByName,
    select,
  };
}

describe("exercise service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists active exercise catalog items with safe display labels", async () => {
    const exercises = exerciseCatalogQuery();
    const from = vi.fn((table: string) => {
      if (table === "exercicios_catalogo") {
        return exercises;
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(listExerciseCatalog()).resolves.toEqual({
      data: [
        {
          id: "exercise-1",
          nome: "Agachamento",
          categoria: "forca",
          categoriaLabel: "Força",
          nivel: "iniciante",
          nivelLabel: "Iniciante",
          descricaoCurta:
            "Fortalece membros inferiores para suporte na corrida.",
          instrucoes:
            "Execute com amplitude confortável, tronco firme e controle na descida.",
          alerta:
            "Interrompa em caso de dor aguda e procure orientação profissional.",
        },
        {
          id: "exercise-2",
          nome: "Prancha frontal",
          categoria: "core",
          categoriaLabel: "Core",
          nivel: "iniciante",
          nivelLabel: "Iniciante",
          descricaoCurta: "Desenvolve estabilidade de tronco para a corrida.",
          instrucoes:
            "Mantenha alinhamento entre ombros, quadris e tornozelos sem prender a respiração.",
          alerta:
            "Interrompa em caso de dor aguda e procure orientação profissional.",
        },
      ],
    });

    expect(from).toHaveBeenCalledWith("exercicios_catalogo");
    expect(exercises.select).toHaveBeenCalledWith(
      "id, nome, categoria, nivel, descricao_curta, instrucoes, alerta",
    );
    expect(exercises.orderByCategory).toHaveBeenCalledWith("categoria", {
      ascending: true,
    });
    expect(exercises.orderByName).toHaveBeenCalledWith("nome", {
      ascending: true,
    });
  });

  it("returns a generic error when Supabase cannot load the catalog", async () => {
    const orderByName = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });
    const orderByCategory = vi.fn().mockReturnValue({ order: orderByName });
    const select = vi.fn().mockReturnValue({ order: orderByCategory });

    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    await expect(listExerciseCatalog()).resolves.toEqual({
      error: "Não foi possível carregar a biblioteca de exercícios agora.",
    });
  });
});
