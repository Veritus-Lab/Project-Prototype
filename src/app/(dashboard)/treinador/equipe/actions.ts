"use server";
import { redirect } from "next/navigation";
import { createTeamInvitation } from "@/lib/services/team-invitation.service";
export async function createTeamInvitationAction(formData: FormData): Promise<never> {
  const result = await createTeamInvitation(String(formData.get("email") ?? ""), String(formData.get("role") ?? "") as "socio" | "professor");
  if ("error" in result) redirect(`/treinador/equipe?erro=${encodeURIComponent(result.error ?? "Não foi possível criar o convite agora.")}`);
  redirect(`/treinador/equipe?convite=${encodeURIComponent(result.data.invitationUrl)}`);
}
