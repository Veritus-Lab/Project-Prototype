"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { completeTraining, startTraining } from "@/lib/services/training-execution.service";
import { completeTrainingSchema, startTrainingSchema } from "@/lib/validators/training-execution";
import type { TrainingActionState } from "./training.state";

function refresh() { revalidatePath("/atleta"); revalidatePath("/atleta/calendario"); revalidatePath("/treinador"); }

export async function startTrainingAction(_: TrainingActionState, formData: FormData): Promise<TrainingActionState> {
  const parsed = startTrainingSchema.safeParse({ assignmentId: formData.get("assignmentId") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await startTraining(await requireRole("atleta"), parsed.data.assignmentId);
  if ("error" in result) return { error: result.error };
  refresh();
  return { success: "Treino iniciado." };
}

export async function completeTrainingAction(_: TrainingActionState, formData: FormData): Promise<TrainingActionState> {
  const parsed = completeTrainingSchema.safeParse({ assignmentId: formData.get("assignmentId"), rpe: formData.get("rpe") || undefined, durationMinutes: formData.get("durationMinutes") || undefined, distanceMeters: formData.get("distanceMeters") || undefined, note: formData.get("note") || undefined, discomfortRegion: formData.get("discomfortRegion") || undefined, discomfortIntensity: formData.get("discomfortIntensity") || undefined });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await completeTraining(await requireRole("atleta"), parsed.data);
  if ("error" in result) return { error: result.error };
  refresh();
  return { success: "Treino concluído e execução registrada." };
}
