import { z } from "zod";

const trainingBlockTypes = [
  "aquecimento",
  "principal",
  "recuperacao",
  "desaquecimento",
  "tecnica",
  "forca",
] as const;

const trainingBlockFields = [
  "duracaoMinutos",
  "distanciaMetros",
  "repeticoes",
  "recuperacaoSegundos",
  "rpe",
  "ritmoAlvo",
  "terreno",
  "inclinacaoPercebida",
  "provaAlvo",
  "educativo",
  "instrucoes",
] as const;

const optionalText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, message).optional();

export const trainingBlockSchema = z
  .object({
    tipo: z.enum(trainingBlockTypes),
    titulo: z.string().trim().min(2).max(120),
    instrucoes: optionalText(1200, "Instruções inválidas."),
    duracaoMinutos: z.number().int().min(1).max(600).optional(),
    distanciaMetros: z.number().int().min(1).max(100000).optional(),
    repeticoes: z.number().int().min(1).max(100).optional(),
    recuperacaoSegundos: z.number().int().min(0).max(3600).optional(),
    rpe: z.number().int().min(1).max(10).optional(),
    ritmoAlvo: optionalText(48, "Ritmo alvo inválido."),
    terreno: optionalText(80, "Terreno inválido."),
    inclinacaoPercebida: optionalText(80, "Inclinação inválida."),
    provaAlvo: optionalText(80, "Prova alvo inválida."),
    educativo: optionalText(120, "Educativo inválido."),
  })
  .strict()
  .refine(
    (block) =>
      block.duracaoMinutos !== undefined ||
      block.distanciaMetros !== undefined ||
      block.repeticoes !== undefined,
    "Cada bloco precisa de duração, distância ou repetições.",
  );

export const trainingBlocksSchema = z
  .array(trainingBlockSchema)
  .min(1, "Informe ao menos um bloco.")
  .max(8, "Um treino pode ter no máximo 8 blocos.");

const trainingTypeStructureBlockSchema = z
  .object({
    tipo: z.enum(trainingBlockTypes),
    titulo: z.string().trim().min(2).max(120),
    campos: z.array(z.enum(trainingBlockFields)).min(1).max(11),
    obrigatorios: z.array(z.enum(trainingBlockFields)).max(11),
  })
  .strict()
  .superRefine((block, context) => {
    for (const field of block.obrigatorios) {
      if (!block.campos.includes(field)) {
        context.addIssue({
          code: "custom",
          path: ["obrigatorios"],
          message: "Campos obrigatórios devem existir na lista de campos.",
        });
      }
    }
  });

export const trainingTypeStructureSchema = z
  .object({
    blocos: z.array(trainingTypeStructureBlockSchema).min(1).max(8),
  })
  .strict();

export type TrainingBlockInput = z.infer<typeof trainingBlockSchema>;
export type TrainingTypeStructure = z.infer<typeof trainingTypeStructureSchema>;
