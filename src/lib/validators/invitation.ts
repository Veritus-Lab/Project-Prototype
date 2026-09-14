import { z } from "zod";

export const invitationEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido para o convite.");

export const revokeInvitationSchema = z.object({
  id: z.string().uuid("Convite inválido."),
});

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1, "Convite inválido."),
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[A-Za-z]/, "A senha deve incluir pelo menos uma letra.")
    .regex(/\d/, "A senha deve incluir pelo menos um número."),
});

// Team invitations are the only public account-provisioning path. They use
// the same credential requirements as a student invitation, but do not carry
// any client-controlled role or organization field.
export const acceptTeamInvitationSchema = acceptInvitationSchema.pick({
  token: true,
  nome: true,
  email: true,
  senha: true,
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type AcceptTeamInvitationInput = z.infer<typeof acceptTeamInvitationSchema>;
