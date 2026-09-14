"use server";
import { passwordRecoverySchema } from "@/lib/validators/auth";
import { requestPasswordRecovery } from "@/lib/services/auth.service";
export type RecoveryState = { error?: string; sent?: boolean; fieldErrors?: Partial<Record<"email", string[]>> };
export async function requestRecoveryAction(_state: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const parsed = passwordRecoverySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  await requestPasswordRecovery(parsed.data.email);
  return { sent: true };
}
