"use server";

import { revalidatePath } from "next/cache";

import {
  createInvitation,
  deleteInvitation,
  revokeInvitation,
} from "@/lib/services/invitation.service";
import { invitationEmailSchema } from "@/lib/validators/invitation";
import type { InvitationActionState } from "./state";

const invitationsPath = "/treinador/convites";

export async function createInvitationAction(
  _previousState: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const parsedEmail = invitationEmailSchema.safeParse(formData.get("email"));

  if (!parsedEmail.success) {
    const message =
      parsedEmail.error.issues[0]?.message ??
      "Informe um e-mail válido para o convite.";

    return { fieldErrors: { email: [message] } };
  }

  const result = await createInvitation(parsedEmail.data);

  if ("error" in result) {
    return { error: result.error };
  }

  if (!result.data) {
    return { error: "Não foi possível criar o convite agora. Tente novamente." };
  }

  revalidatePath(invitationsPath);

  return {
    createdLink: result.data.link,
    createdEmail: result.data.email,
  };
}

export async function deleteInvitationAction(formData: FormData): Promise<void> {
  const result = await deleteInvitation(String(formData.get("id") ?? ""));
  if (!("error" in result)) revalidatePath(invitationsPath);
}

export async function revokeInvitationAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const result = await revokeInvitation(id);

  if (!("error" in result)) {
    revalidatePath(invitationsPath);
  }
}
