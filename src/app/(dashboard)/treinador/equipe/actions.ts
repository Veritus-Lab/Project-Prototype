"use server";
import { createTeamInvitation } from "@/lib/services/team-invitation.service";
export async function createTeamInvitationAction(formData: FormData): Promise<void> {
  const result = await createTeamInvitation(String(formData.get("email") ?? ""), String(formData.get("role") ?? "") as "socio" | "professor");
  if ("error" in result) throw new Error(result.error);
}
