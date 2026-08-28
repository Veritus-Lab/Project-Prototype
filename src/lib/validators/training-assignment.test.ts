import { describe, expect, it } from "vitest";

import { assignTrainingSchema } from "./training-assignment";

const trainingId = "550e8400-e29b-41d4-a716-446655440001";
const athleteId = "550e8400-e29b-41d4-a716-446655440002";

describe("assignTrainingSchema", () => {
  it("requires at least one athlete", () => {
    const result = assignTrainingSchema.safeParse({ trainingId, athleteIds: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.athleteIds).toEqual([
        "Selecione ao menos um atleta.",
      ]);
    }
  });

  it("rejects a repeated athlete selection", () => {
    const result = assignTrainingSchema.safeParse({
      trainingId,
      athleteIds: [athleteId, athleteId],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.athleteIds).toEqual([
        "Um atleta não pode ser selecionado mais de uma vez.",
      ]);
    }
  });

  it("accepts a unique list of athlete identifiers", () => {
    expect(
      assignTrainingSchema.safeParse({
        trainingId,
        athleteIds: [athleteId, "550e8400-e29b-41d4-a716-446655440003"],
      }).success,
    ).toBe(true);
  });
});
