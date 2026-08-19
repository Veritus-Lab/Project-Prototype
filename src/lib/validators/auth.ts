import { z } from "zod";

export const trainerSignupSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  assessoria: z.string().trim().min(2, "Informe o nome da assessoria."),
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

export type TrainerSignupInput = z.infer<typeof trainerSignupSchema>;
