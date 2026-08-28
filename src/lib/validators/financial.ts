import { z } from "zod";

export const createSubscriptionSchema = z.object({
  athleteId: z.string().uuid("Atleta inválido."),
  amountCents: z.coerce.number().int().min(0).max(10_000_000),
  periodicity: z.enum(["mensal", "trimestral", "semestral", "anual"]),
  dueDay: z.coerce.number().int().min(1).max(31),
  paymentMethod: z.string().trim().max(80).optional(),
  status: z.enum(["ativa", "suspensa", "isenta"]),
  startDate: z.string().date("Data de início inválida."),
});

export const markChargePaidSchema = z.object({ chargeId: z.string().uuid("Cobrança inválida.") });
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
