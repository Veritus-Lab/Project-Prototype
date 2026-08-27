import { describe, expect, it } from "vitest";

import {
  trainingBlocksSchema,
  trainingTypeStructureSchema,
} from "./training-template";

describe("training template validators", () => {
  it("accepts a bounded structured workout with measurable blocks", () => {
    expect(
      trainingBlocksSchema.parse([
        {
          tipo: "aquecimento",
          titulo: "Trote leve",
          instrucoes: "Mantenha a respiração confortável.",
          duracaoMinutos: 12,
        },
        {
          tipo: "principal",
          titulo: "Repetições controladas",
          distanciaMetros: 400,
          repeticoes: 6,
          recuperacaoSegundos: 90,
        },
      ]),
    ).toHaveLength(2);
  });

  it("rejects unbounded or unmeasurable workout blocks", () => {
    const result = trainingBlocksSchema.safeParse([
      {
        tipo: "principal",
        titulo: "x".repeat(121),
        instrucoes: "x".repeat(1201),
      },
      ...Array.from({ length: 8 }, () => ({
        tipo: "recuperacao",
        titulo: "Caminhada",
        duracaoMinutos: 2,
      })),
    ]);

    expect(result.success).toBe(false);
  });

  it("accepts catalog structures with only allowed block field definitions", () => {
    expect(
      trainingTypeStructureSchema.parse({
        blocos: [
          {
            tipo: "principal",
            titulo: "Bloco principal",
            campos: ["distanciaMetros", "repeticoes", "recuperacaoSegundos"],
            obrigatorios: ["distanciaMetros", "repeticoes"],
          },
        ],
      }),
    ).toEqual({
      blocos: [
        {
          tipo: "principal",
          titulo: "Bloco principal",
          campos: ["distanciaMetros", "repeticoes", "recuperacaoSegundos"],
          obrigatorios: ["distanciaMetros", "repeticoes"],
        },
      ],
    });
  });

  it("rejects unknown catalog fields and excessive template blocks", () => {
    const result = trainingTypeStructureSchema.safeParse({
      blocos: Array.from({ length: 9 }, () => ({
        tipo: "principal",
        titulo: "Bloco",
        campos: ["campoLivre"],
        obrigatorios: ["campoLivre"],
      })),
    });

    expect(result.success).toBe(false);
  });
});
