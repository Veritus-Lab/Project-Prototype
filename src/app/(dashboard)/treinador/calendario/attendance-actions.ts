"use server";
import { revalidatePath } from "next/cache";
import { recordAttendanceBatch } from "@/lib/services/attendance.service";
import type { AttendanceStatus } from "@/types/mvp-foundation";
export type AttendanceActionState = { error?: string; success?: boolean };
export async function recordAttendanceAction(_state: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  let entries: Array<{ studentId: string; status: AttendanceStatus }>;
  try { entries = JSON.parse(String(formData.get("entries") ?? "[]")); } catch { return { error: "Chamada inválida." }; }
  const result = await recordAttendanceBatch(String(formData.get("meetingId") ?? ""), entries);
  if ("error" in result) return result;
  revalidatePath("/treinador/calendario"); revalidatePath("/professor/turmas");
  return result;
}
