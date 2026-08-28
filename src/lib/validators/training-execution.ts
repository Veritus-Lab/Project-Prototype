import { z } from "zod";

const discomfortRegions = ["pe", "tornozelo", "panturrilha", "joelho", "coxa", "quadril", "lombar", "outro"] as const;

export const startTrainingSchema = z.object({ assignmentId: z.string().uuid("Treino inválido.") });

export const completeTrainingSchema = z.object({
  assignmentId: z.string().uuid("Treino inválido."),
  rpe: z.coerce.number().int().min(1).max(10).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(1440).optional(),
  distanceMeters: z.coerce.number().int().min(1).max(200000).optional(),
  note: z.string().trim().max(500).optional(),
  discomfortRegion: z.enum(discomfortRegions).optional(),
  discomfortIntensity: z.coerce.number().int().min(1).max(10).optional(),
}).refine((value) => Boolean(value.discomfortRegion) === Boolean(value.discomfortIntensity), {
  message: "Informe região e intensidade do desconforto juntas.",
  path: ["discomfortRegion"],
});

export type CompleteTrainingInput = z.infer<typeof completeTrainingSchema>;
