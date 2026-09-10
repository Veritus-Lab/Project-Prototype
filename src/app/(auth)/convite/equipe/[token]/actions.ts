"use server";

import { redirect } from "next/navigation";

import { acceptTeamInvitation } from "@/lib/services/team-invitation.service";

export async function acceptTeamInvitationAction(formData: FormData): Promise<never> {
  const token = String(formData.get("token") ?? "");
  const result = await acceptTeamInvitation(token, String(formData.get("nome") ?? ""));

  if ("error" in result) {
    redirect(`/convite/equipe/${encodeURIComponent(token)}?erro=${encodeURIComponent(result.error ?? "Não foi possível aceitar o convite agora.")}`);
  }

  redirect("/treinador");
}
