"use server";

import { redirect } from "next/navigation";

import { acceptInvitation } from "@/lib/services/invitation.service";
import { acceptInvitationSchema } from "@/lib/validators/invitation";
import type { AcceptInvitationActionState } from "./state";

export async function acceptInvitationAction(
  _previousState: AcceptInvitationActionState,
  formData: FormData,
): Promise<AcceptInvitationActionState> {
  const parsedInput = acceptInvitationSchema.safeParse({
    token: formData.get("token"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsedInput.success) {
    return { fieldErrors: parsedInput.error.flatten().fieldErrors };
  }

  const result = await acceptInvitation(parsedInput.data);

  if ("error" in result) {
    return { error: result.error };
  }

  if (result.data.confirmationRequired) {
    return { confirmationRequired: true };
  }

  redirect("/atleta");
}
