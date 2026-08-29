import { z } from "zod";

const optionalInteger = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.coerce.number().int().min(minimum).max(maximum).optional(),
  );

export const performanceAssessmentSchema = z
  .object({
    athleteId: z.string().uuid("Atleta inválido."),
    assessedOn: z.string().date("Data inválida."),
    protocol: z.enum(["ritmo_limiar", "vam", "outro"]),
    thresholdPaceSecondsPerKm: optionalInteger(120, 900),
    vamMetersPerMinute: optionalInteger(80, 500),
    note: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) => Boolean(value.thresholdPaceSecondsPerKm || value.vamMetersPerMinute) || value.protocol === "outro",
    { message: "Informe ritmo de limiar, VAM ou use o protocolo Outro.", path: ["protocol"] },
  );

export type PerformanceAssessmentInput = z.infer<typeof performanceAssessmentSchema>;
