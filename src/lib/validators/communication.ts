import { z } from "zod";
export const communicationPreferenceSchema = z.object({ athleteId: z.string().uuid(), phone: z.string().trim().min(8).max(24).optional(), whatsappOptIn: z.enum(["true", "false"]), billingWhatsapp: z.enum(["true", "false"]) });
export const queueReminderSchema = z.object({ chargeId: z.string().uuid(), templateCode: z.enum(["cobranca_proximo_vencimento", "cobranca_vencida"]) });
export type CommunicationPreferenceInput = z.infer<typeof communicationPreferenceSchema>;
