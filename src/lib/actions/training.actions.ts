"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createTraining } from "@/lib/services/training.service";
import { createTrainingSchema } from "@/lib/validators/training";
import type { TrainingActionState } from "./training.state";

function parseBlocks(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export async function createTrainingAction(
  _previousState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const blocks = parseBlocks(formData.get("blocos"));

  if (!blocks) {
    return { fieldErrors: { blocos: ["Blocos de treino inválidos."] } };
  }

  const parsed = createTrainingSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    tipoTreinoId: formData.get("tipoTreinoId"),
    blocos: blocks,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireRole("treinador");
  const result = await createTraining(user, parsed.data);

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/treinador/treinos");
  revalidatePath("/treinador");

  return { success: "Treino criado." };
}
