import { z } from "zod";

export const invitationEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido para o convite.");

export const revokeInvitationSchema = z.object({
  id: z.string().uuid("Convite inválido."),
});
