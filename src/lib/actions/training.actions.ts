"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import {
  assignTrainingToAthletes,
  createTraining,
  deleteTrainerTraining,
} from "@/lib/services/training.service";
import { assignTrainingSchema } from "@/lib/validators/training-assignment";
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

export async function deleteTrainingAction(formData: FormData): Promise<void> {
  const user = await requireRole("treinador");
  const result = await deleteTrainerTraining(user, String(formData.get("trainingId") ?? ""));
  if (!("error" in result)) {
    revalidatePath("/treinador/treinos");
    revalidatePath("/treinador");
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

export async function assignTrainingAction(
  _previousState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const parsed = assignTrainingSchema.safeParse({
    trainingId: formData.get("trainingId"),
    athleteIds: formData.getAll("athleteIds"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireRole("treinador");
  const result = await assignTrainingToAthletes(user, parsed.data);

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/treinador/treinos");
  revalidatePath("/treinador/atletas");
  revalidatePath("/treinador");
  revalidatePath("/atleta");

  if (result.data.createdCount === 0) {
    return { success: "O treino já estava atribuído aos atletas selecionados." };
  }

  return {
    success: `${result.data.createdCount} ${
      result.data.createdCount === 1 ? "atleta recebeu" : "atletas receberam"
    } o treino.`,
  };
}
