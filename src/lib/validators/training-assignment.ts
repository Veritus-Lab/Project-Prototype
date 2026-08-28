import { z } from "zod";

const athleteIdSchema = z.string().uuid("Atleta inválido.");

export const assignTrainingSchema = z.object({
  trainingId: z.string().uuid("Treino inválido."),
  athleteIds: z
    .array(athleteIdSchema)
    .min(1, "Selecione ao menos um atleta.")
    .max(100, "Selecione no máximo 100 atletas por vez.")
    .refine(
      (athleteIds) => new Set(athleteIds).size === athleteIds.length,
      "Um atleta não pode ser selecionado mais de uma vez.",
    ),
});

export type AssignTrainingInput = z.infer<typeof assignTrainingSchema>;
