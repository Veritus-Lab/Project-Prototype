"use server";

import { redirect } from "next/navigation";

import {
  acceptTeamInvitation,
  createAccountAndAcceptTeamInvitation,
} from "@/lib/services/team-invitation.service";
import { acceptTeamInvitationSchema } from "@/lib/validators/invitation";
import type { AcceptTeamInvitationActionState } from "./state";

export async function acceptTeamInvitationAction(formData: FormData): Promise<never> {
  const token = String(formData.get("token") ?? "");
  const result = await acceptTeamInvitation(token, String(formData.get("nome") ?? ""));

  if ("error" in result) {
    redirect(`/convite/equipe/${encodeURIComponent(token)}?erro=${encodeURIComponent(result.error ?? "Não foi possível aceitar o convite agora.")}`);
  }

  redirect("/treinador");
}

export async function createTeamAccountAction(
  _previousState: AcceptTeamInvitationActionState,
  formData: FormData,
): Promise<AcceptTeamInvitationActionState> {
  const parsed = acceptTeamInvitationSchema.safeParse({
    token: formData.get("token"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const result = await createAccountAndAcceptTeamInvitation(parsed.data);
  if ("error" in result) return { error: result.error };
  if (result.data?.confirmationRequired) return { confirmationRequired: true };
  redirect("/treinador");
}
