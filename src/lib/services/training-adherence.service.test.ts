import { describe, expect, it } from "vitest";

import { compareMetric, getPlannedTotals } from "./training-adherence.service";

describe("training adherence", () => {
  it("adds prescribed duration and repeated block distance", () => {
    expect(getPlannedTotals([
      { tipo: "aquecimento", titulo: "Aquecimento", duracaoMinutos: 10 },
      { tipo: "principal", titulo: "Repetições", distanciaMetros: 400, repeticoes: 6 },
    ])).toEqual({ durationMinutes: 10, distanceMeters: 2400 });
  });

  it("classifies metrics within fifteen percent as close to planned", () => {
    expect(compareMetric(10_000, 8_500)).toMatchObject({ status: "proximo" });
    expect(compareMetric(10_000, 11_500)).toMatchObject({ status: "proximo" });
  });

  it("keeps missing measurements explicitly unknown", () => {
    expect(compareMetric(10_000, null)).toMatchObject({ status: "nao_informado" });
    expect(compareMetric(null, 10_000)).toMatchObject({ status: "nao_informado" });
  });
});
