import { z } from "zod";

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Data inválida.")
  .transform((value) => value || null);

export const equipmentFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do tênis.").max(100),
  startedOn: optionalDate,
  initialMileageMeters: z.coerce.number().int().min(0).max(2_000_000),
  mileageLimitMeters: z.coerce.number().int().min(1).max(2_000_000).optional(),
});

export const deactivateEquipmentSchema = z.object({
  equipmentId: z.string().uuid("Equipamento inválido."),
});

export const linkEquipmentExecutionSchema = z.object({
  equipmentId: z.string().uuid("Equipamento inválido."),
  executionId: z.string().uuid("Execução inválida."),
});

export type EquipmentFormInput = z.infer<typeof equipmentFormSchema>;
