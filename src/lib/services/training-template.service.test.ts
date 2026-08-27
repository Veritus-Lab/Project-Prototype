import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { listTrainingTypeCatalog } from "./training-template.service";

function trainingTypeCatalogQuery(data: unknown, error: unknown = null) {
  const orderByName = vi.fn().mockResolvedValue({ data, error });
  const orderByOrder = vi.fn().mockReturnValue({ order: orderByName });
  const select = vi.fn().mockReturnValue({ order: orderByOrder });

  return { orderByName, orderByOrder, select };
}

describe("training template service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only validated catalog structures with safe labels", async () => {
    const catalog = trainingTypeCatalogQuery([
      {
        id: "type-1",
        codigo: "corrida_facil",
        nome: "Corrida fácil",
        objetivo: "Construir base aeróbica com conforto.",
        descricao: "Corrida contínua em intensidade leve e controlada.",
        estrutura_schema: {
          blocos: [
            {
              tipo: "principal",
              titulo: "Corrida fácil",
              campos: ["duracaoMinutos", "distanciaMetros", "rpe"],
              obrigatorios: ["duracaoMinutos"],
            },
          ],
        },
        alerta: "Reduza ou interrompa se houver dor aguda ou mal-estar incomum.",
      },
    ]);
    const from = vi.fn((table: string) => {
      if (table === "tipos_treino_catalogo") {
        return catalog;
      }

      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(listTrainingTypeCatalog()).resolves.toEqual({
      data: [
        {
          id: "type-1",
          codigo: "corrida_facil",
          nome: "Corrida fácil",
          objetivo: "Construir base aeróbica com conforto.",
          descricao: "Corrida contínua em intensidade leve e controlada.",
          estruturaSchema: {
            blocos: [
              {
                tipo: "principal",
                titulo: "Corrida fácil",
                campos: ["duracaoMinutos", "distanciaMetros", "rpe"],
                obrigatorios: ["duracaoMinutos"],
              },
            ],
          },
          alerta: "Reduza ou interrompa se houver dor aguda ou mal-estar incomum.",
        },
      ],
    });

    expect(from).toHaveBeenCalledWith("tipos_treino_catalogo");
    expect(catalog.select).toHaveBeenCalledWith(
      "id, codigo, nome, objetivo, descricao, estrutura_schema, alerta",
    );
    expect(catalog.orderByOrder).toHaveBeenCalledWith("ordem", {
      ascending: true,
    });
    expect(catalog.orderByName).toHaveBeenCalledWith("nome", {
      ascending: true,
    });
  });

  it("returns a generic error when the catalog is unavailable or malformed", async () => {
    const catalog = trainingTypeCatalogQuery([
      {
        id: "type-1",
        codigo: "corrida_facil",
        nome: "Corrida fácil",
        objetivo: "Construir base aeróbica com conforto.",
        descricao: "Corrida contínua em intensidade leve e controlada.",
        estrutura_schema: { blocos: [] },
        alerta: "Reduza ou interrompa se houver dor aguda ou mal-estar incomum.",
      },
    ]);
    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => catalog),
    });

    await expect(listTrainingTypeCatalog()).resolves.toEqual({
      error: "Não foi possível carregar a biblioteca de treinos agora.",
    });
  });
});
