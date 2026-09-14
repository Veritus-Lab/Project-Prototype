"use server";
import { redirect } from "next/navigation";
import { destinationForRole, requireUser } from "@/lib/auth/session";
import { updatePassword } from "@/lib/services/auth.service";
import { passwordUpdateSchema } from "@/lib/validators/auth";
export type PasswordUpdateState = { error?: string; fieldErrors?: Partial<Record<"senha", string[]>> };
export async function updatePasswordAction(_state: PasswordUpdateState, formData: FormData): Promise<PasswordUpdateState> { const parsed = passwordUpdateSchema.safeParse({ senha: formData.get("senha") }); if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }; const result = await updatePassword(parsed.data.senha); if ("error" in result) return { error: result.error }; const user = await requireUser(); redirect(destinationForRole(user.role ?? (user.papel === "atleta" ? "aluno" : "professor"))); }
