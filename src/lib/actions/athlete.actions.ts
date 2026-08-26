"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { updateTrainerAthleteOperationalProfile } from "@/lib/services/athlete.service";
import { athleteOperationalProfileFormSchema } from "@/lib/validators/athlete-operational";
import type { AthleteOperationalActionState } from "./athlete.state";

export async function updateAthleteOperationalProfileAction(
  _previousState: AthleteOperationalActionState,
  formData: FormData,
): Promise<AthleteOperationalActionState> {
  const parsed = athleteOperationalProfileFormSchema.safeParse({
    athleteId: formData.get("athleteId"),
    telefone: formData.get("telefone"),
    objetivo: formData.get("objetivo"),
    nivel: formData.get("nivel"),
    dataNascimento: formData.get("dataNascimento"),
    observacoesInternas: formData.get("observacoesInternas"),
    contatoEmergenciaNome: formData.get("contatoEmergenciaNome"),
    contatoEmergenciaTelefone: formData.get("contatoEmergenciaTelefone"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { athleteId, ...input } = parsed.data;
  const user = await requireRole("treinador");
  const result = await updateTrainerAthleteOperationalProfile(
    user,
    athleteId,
    input,
  );

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath(`/treinador/atletas/${athleteId}`);

  return { success: "Dados operacionais atualizados." };
}
