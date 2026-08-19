import { describe, expect, it } from "vitest";

import { trainerSignupSchema } from "./auth";

const validTrainer = {
  nome: "Rodrigo Sousa",
  assessoria: "FLERNK Running",
  email: "rodrigo@example.com",
  senha: "Segura123",
};

describe("trainerSignupSchema", () => {
  it("accepts a complete trainer signup", () => {
    expect(trainerSignupSchema.safeParse(validTrainer).success).toBe(true);
  });

  it("requires a strong trainer password", () => {
    const result = trainerSignupSchema.safeParse({
      ...validTrainer,
      senha: "123456",
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["nome", ""],
    ["assessoria", ""],
    ["email", "email-invalido"],
  ])("rejects an invalid %s", (field, value) => {
    expect(
      trainerSignupSchema.safeParse({ ...validTrainer, [field]: value }).success,
    ).toBe(false);
  });
});
