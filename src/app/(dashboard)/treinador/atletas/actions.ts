"use server";

import { revalidatePath } from "next/cache";
import { createStudent } from "@/lib/services/student.service";

export async function createStudentAction(
  _previousState: { error?: string; success?: boolean },
  formData: FormData,
) {
  const result = await createStudent({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if ("error" in result) return { error: result.error ?? "Não foi possível cadastrar o aluno agora." };
  revalidatePath("/treinador/atletas");
  return { success: true };
}
