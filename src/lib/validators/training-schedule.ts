import { z } from "zod";

const athleteIdSchema = z.string().uuid("Atleta inválido.");

export const scheduleTrainingSchema = z.object({
  trainingId: z.string().uuid("Treino inválido."),
  athleteIds: z.array(athleteIdSchema).min(1, "Selecione ao menos um atleta."),
  scheduledFor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe uma data e horário válidos."),
  note: z.string().trim().max(500, "A observação deve ter no máximo 500 caracteres.").optional(),
});

export type ScheduleTrainingInput = z.infer<typeof scheduleTrainingSchema>;
