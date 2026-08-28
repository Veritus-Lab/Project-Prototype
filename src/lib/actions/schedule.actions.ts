"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { scheduleTraining } from "@/lib/services/schedule.service";
import { scheduleTrainingSchema } from "@/lib/validators/training-schedule";
import type { TrainingActionState } from "./training.state";

export async function scheduleTrainingAction(
  _previousState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const parsed = scheduleTrainingSchema.safeParse({
    trainingId: formData.get("trainingId"),
    athleteIds: formData.getAll("athleteIds"),
    scheduledFor: formData.get("scheduledFor"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await scheduleTraining(await requireRole("treinador"), parsed.data);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/treinador/calendario");
  revalidatePath("/treinador");
  revalidatePath("/atleta");
  revalidatePath("/atleta/calendario");

  return { success: `${result.data.createdCount} treino(s) agendado(s).` };
}
