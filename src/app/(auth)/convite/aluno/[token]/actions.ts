"use server";

import { redirect } from "next/navigation";
import { acceptStudentAccessInvitation, createStudentAccountAndAcceptInvitation } from "@/lib/services/student-invitation.service";
import { acceptInvitationSchema } from "@/lib/validators/invitation";

export type StudentInvitationActionState = { error?: string; confirmationRequired?: boolean };

export async function acceptStudentInvitationAction(formData: FormData): Promise<never> {
  const token = String(formData.get("token") ?? "");
  const result = await acceptStudentAccessInvitation(token);
  if ("error" in result) redirect(`/convite/aluno/${encodeURIComponent(token)}?erro=${encodeURIComponent(result.error ?? "Não foi possível aceitar o convite agora.")}`);
  redirect("/aluno");
}

export async function createStudentAccountAction(_previousState: StudentInvitationActionState, formData: FormData): Promise<StudentInvitationActionState> {
  const parsed = acceptInvitationSchema.pick({ token: true, email: true, senha: true }).safeParse({ token: formData.get("token"), email: formData.get("email"), senha: formData.get("senha") });
  if (!parsed.success) return { error: "Confira o e-mail e a senha para continuar." };
  const result = await createStudentAccountAndAcceptInvitation(parsed.data);
  if ("error" in result) return { error: result.error ?? "Não foi possível concluir o convite agora." };
  if (result.data?.confirmationRequired) return { confirmationRequired: true };
  redirect("/aluno");
}
