"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createTrainerAthletePerformanceAssessment } from "@/lib/services/performance-assessment.service";
import { performanceAssessmentSchema } from "@/lib/validators/performance-assessment";
import type { AthleteOperationalActionState } from "./athlete.state";

export async function createPerformanceAssessmentAction(_: AthleteOperationalActionState, formData: FormData): Promise<AthleteOperationalActionState> {
  const parsed = performanceAssessmentSchema.safeParse({ athleteId: formData.get("athleteId"), assessedOn: formData.get("assessedOn"), protocol: formData.get("protocol"), thresholdPaceSecondsPerKm: formData.get("thresholdPaceSecondsPerKm"), vamMetersPerMinute: formData.get("vamMetersPerMinute"), note: formData.get("note") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await createTrainerAthletePerformanceAssessment(await requireRole("treinador"), parsed.data);
  if ("error" in result) return result;
  revalidatePath(`/treinador/atletas/${parsed.data.athleteId}`);
  return { success: "Avaliação registrada." };
}
