import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do aluno.").max(120),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Informe um e-mail válido.")]),
  phone: z.string().trim().max(40).optional(),
  birthDate: z.union([z.literal(""), z.string().date("Informe uma data válida.")]),
  notes: z.string().trim().max(2000).optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
