import { describe, expect, it } from "vitest";

import { athleteOperationalProfileFormSchema } from "./athlete-operational";

describe("athlete operational validator", () => {
  it("normalizes empty optional fields to null", () => {
    expect(
      athleteOperationalProfileFormSchema.parse({
        athleteId: "550e8400-e29b-41d4-a716-446655440000",
        telefone: "",
        objetivo: "  Completar 10 km  ",
        nivel: "",
        dataNascimento: "",
        observacoesInternas: "",
        contatoEmergenciaNome: "",
        contatoEmergenciaTelefone: "",
      }),
    ).toEqual({
      athleteId: "550e8400-e29b-41d4-a716-446655440000",
      telefone: null,
      objetivo: "Completar 10 km",
      nivel: null,
      dataNascimento: null,
      observacoesInternas: null,
      contatoEmergenciaNome: null,
      contatoEmergenciaTelefone: null,
    });
  });

  it("rejects unsafe or excessive operational fields", () => {
    const result = athleteOperationalProfileFormSchema.safeParse({
      athleteId: "atleta-invalido",
      telefone: "telefone<script>",
      objetivo: "x".repeat(241),
      nivel: "elite",
      dataNascimento: "2999-01-01",
      observacoesInternas: "x".repeat(1001),
      contatoEmergenciaNome: "x".repeat(121),
      contatoEmergenciaTelefone: "emergencia<script>",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toMatchObject({
      athleteId: ["Atleta inválido."],
      telefone: ["Telefone inválido."],
      objetivo: ["Objetivo deve ter no máximo 240 caracteres."],
      nivel: ["Selecione um nível válido."],
      dataNascimento: ["Data de nascimento inválida."],
      observacoesInternas: [
        "Observações internas devem ter no máximo 1000 caracteres.",
      ],
      contatoEmergenciaNome: [
        "Contato de emergência deve ter no máximo 120 caracteres.",
      ],
      contatoEmergenciaTelefone: ["Telefone de emergência inválido."],
    });
  });
});
