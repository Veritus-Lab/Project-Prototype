import { z } from "zod";

const phonePattern = /^[0-9+().\-\s]*$/;
const athleteLevels = ["iniciante", "intermediario", "avancado"] as const;

function nullableTrimmedString(max: number, message: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    },
    z.string().max(max, message).nullable(),
  );
}

function nullablePhone(message: string) {
  return nullableTrimmedString(32, message).refine(
    (value) => value === null || phonePattern.test(value),
    message,
  );
}

function nullableLevel() {
  return z
    .preprocess(
      (value) => {
        if (typeof value !== "string") {
          return null;
        }

        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      },
      z.string().nullable(),
    )
    .refine(
      (value) => value === null || athleteLevels.includes(value as AthleteLevel),
      "Selecione um nível válido.",
    );
}

function nullableBirthDate() {
  return z
    .preprocess(
      (value) => {
        if (typeof value !== "string") {
          return null;
        }

        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      },
      z.string().nullable(),
    )
    .refine((value) => {
      if (value === null) {
        return true;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);
      const now = new Date();
      const oldest = new Date(Date.UTC(now.getUTCFullYear() - 120, 0, 1));

      return (
        !Number.isNaN(date.getTime()) &&
        date <= now &&
        date >= oldest &&
        value === date.toISOString().slice(0, 10)
      );
    }, "Data de nascimento inválida.");
}

export type AthleteLevel = (typeof athleteLevels)[number];

export const athleteOperationalProfileFormSchema = z.object({
  athleteId: z.preprocess(
    (value) => String(value ?? "").trim(),
    z.string().uuid("Atleta inválido."),
  ),
  telefone: nullablePhone("Telefone inválido."),
  objetivo: nullableTrimmedString(
    240,
    "Objetivo deve ter no máximo 240 caracteres.",
  ),
  nivel: nullableLevel(),
  dataNascimento: nullableBirthDate(),
  observacoesInternas: nullableTrimmedString(
    1000,
    "Observações internas devem ter no máximo 1000 caracteres.",
  ),
  contatoEmergenciaNome: nullableTrimmedString(
    120,
    "Contato de emergência deve ter no máximo 120 caracteres.",
  ),
  contatoEmergenciaTelefone: nullablePhone("Telefone de emergência inválido."),
});

export type AthleteOperationalProfileInput = Omit<
  z.infer<typeof athleteOperationalProfileFormSchema>,
  "athleteId"
>;
