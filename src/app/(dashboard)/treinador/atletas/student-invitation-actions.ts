"use server";

import { createStudentAccessInvitation } from "@/lib/services/student-invitation.service";

export type StudentAccessInvitationActionState = { error?: string; invitationUrl?: string };

export async function createStudentAccessInvitationAction(
  _previousState: StudentAccessInvitationActionState, formData: FormData,
): Promise<StudentAccessInvitationActionState> {
  const result = await createStudentAccessInvitation(String(formData.get("studentId") ?? ""));
  if ("error" in result) return { error: result.error ?? "Não foi possível gerar o acesso." };
  return { invitationUrl: result.data.invitationUrl };
}
