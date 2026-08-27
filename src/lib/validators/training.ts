import { z } from "zod";

import { trainingBlocksSchema } from "./training-template";

const nullableTrimmedString = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    },
    z.string().max(max, message).nullable(),
  );

export const createTrainingSchema = z.object({
  titulo: z.string().trim().min(2, "Informe um título com ao menos 2 caracteres.").max(
    160,
    "Título deve ter no máximo 160 caracteres.",
  ),
  descricao: nullableTrimmedString(
    500,
    "Descrição deve ter no máximo 500 caracteres.",
  ),
  tipoTreinoId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : null),
    z.string().uuid("Tipo de treino inválido.").nullable(),
  ),
  blocos: trainingBlocksSchema,
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
