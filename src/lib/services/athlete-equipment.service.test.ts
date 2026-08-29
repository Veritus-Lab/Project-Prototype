import { describe, expect, it } from "vitest";

import { getEquipmentProgress } from "./athlete-equipment.service";

describe("getEquipmentProgress", () => {
  it("sums initial mileage and linked completed executions", () => {
    expect(getEquipmentProgress(12_500, 37_500, 100_000)).toEqual({
      mileageMeters: 50_000,
      progressPercent: 50,
      alert: null,
    });
  });

  it("asks the athlete to monitor equipment at 80 percent", () => {
    expect(getEquipmentProgress(0, 80_000, 100_000)).toMatchObject({
      progressPercent: 80,
      alert: "acompanhar",
    });
  });

  it("marks the configured limit as reached at 100 percent", () => {
    expect(getEquipmentProgress(10_000, 90_000, 100_000)).toMatchObject({
      progressPercent: 100,
      alert: "limite_atingido",
    });
  });

  it("does not show a percentage or alert without a configured limit", () => {
    expect(getEquipmentProgress(1_000, 2_000, null)).toEqual({
      mileageMeters: 3_000,
      progressPercent: null,
      alert: null,
    });
  });
});
