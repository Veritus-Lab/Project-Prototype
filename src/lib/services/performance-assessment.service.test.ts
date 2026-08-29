import { describe, expect, it } from "vitest";

import { getPerformanceZones } from "./performance-assessment.service";

describe("performance assessment zones", () => {
  it("creates pace planning references from a threshold pace", () => {
    expect(getPerformanceZones(300, null)).toEqual([
      { label: "Leve", minimum: 330, maximum: 360, unit: "pace" },
      { label: "Moderado", minimum: 310, maximum: 330, unit: "pace" },
      { label: "Limiar", minimum: 290, maximum: 310, unit: "pace" },
      { label: "Intenso", minimum: 270, maximum: 290, unit: "pace" },
    ]);
  });

  it("creates VAM planning references when only VAM is recorded", () => {
    expect(getPerformanceZones(null, 200)).toEqual([
      { label: "Leve", minimum: 120, maximum: 140, unit: "vam" },
      { label: "Moderado", minimum: 140, maximum: 160, unit: "vam" },
      { label: "Limiar", minimum: 160, maximum: 180, unit: "vam" },
      { label: "Intenso", minimum: 180, maximum: 200, unit: "vam" },
    ]);
  });
});
