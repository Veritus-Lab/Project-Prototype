"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createAthleteEquipment, deactivateAthleteEquipment, linkAthleteEquipmentExecution } from "@/lib/services/athlete-equipment.service";
import { deactivateEquipmentSchema, equipmentFormSchema, linkEquipmentExecutionSchema } from "@/lib/validators/athlete-equipment";
import type { AthleteEquipmentActionState } from "./athlete-equipment.state";

function refresh() { revalidatePath("/atleta"); }

export async function createAthleteEquipmentAction(_: AthleteEquipmentActionState, formData: FormData): Promise<AthleteEquipmentActionState> {
  const parsed = equipmentFormSchema.safeParse({ name: formData.get("name"), startedOn: formData.get("startedOn"), initialMileageMeters: formData.get("initialMileageMeters"), mileageLimitMeters: formData.get("mileageLimitMeters") || undefined });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await createAthleteEquipment(await requireRole("atleta"), parsed.data);
  if ("error" in result) return result;
  refresh();
  return { success: "Equipamento cadastrado." };
}

export async function deactivateAthleteEquipmentAction(_: AthleteEquipmentActionState, formData: FormData): Promise<AthleteEquipmentActionState> {
  const parsed = deactivateEquipmentSchema.safeParse({ equipmentId: formData.get("equipmentId") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await deactivateAthleteEquipment(await requireRole("atleta"), parsed.data.equipmentId);
  if ("error" in result) return result;
  refresh();
  return { success: "Equipamento desativado." };
}

export async function linkAthleteEquipmentExecutionAction(_: AthleteEquipmentActionState, formData: FormData): Promise<AthleteEquipmentActionState> {
  const parsed = linkEquipmentExecutionSchema.safeParse({ equipmentId: formData.get("equipmentId"), executionId: formData.get("executionId") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await linkAthleteEquipmentExecution(await requireRole("atleta"), parsed.data.equipmentId, parsed.data.executionId);
  if ("error" in result) return result;
  refresh();
  return { success: "Execução vinculada ao equipamento." };
}
