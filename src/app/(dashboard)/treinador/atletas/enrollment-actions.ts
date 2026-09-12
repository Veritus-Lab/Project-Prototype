"use server";

import { revalidatePath } from "next/cache";
import { changeEnrollmentStatus, createEnrollment, type EnrollmentStatus } from "@/lib/services/student.service";

type ActionState = { error?: string; success?: boolean };

export async function createEnrollmentAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const result = await createEnrollment(String(formData.get("studentId") ?? ""), String(formData.get("startsOn") ?? ""));
  if ("error" in result) return { error: result.error };
  revalidatePath("/treinador/atletas");
  return { success: true };
}

export async function changeEnrollmentStatusAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const status = String(formData.get("status") ?? "") as EnrollmentStatus;
  const result = await changeEnrollmentStatus(String(formData.get("enrollmentId") ?? ""), status, String(formData.get("reason") ?? ""));
  if ("error" in result) return { error: result.error };
  revalidatePath("/treinador/atletas");
  return { success: true };
}
