import "server-only";

import { requireRole } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type StudentFinancialStatus =
  Database["public"]["Enums"]["student_financial_status"];

export type ProfessorFinancialStatusResult =
  | { data: { status: StudentFinancialStatus } }
  | { error: "FORBIDDEN" }
  | { error: "UNAVAILABLE" };

/**
 * The RPC is intentionally the sole financial read available to professors.
 * It returns no amounts, dates, charge IDs, subscription IDs, or payment data.
 */
export async function getProfessorStudentFinancialStatus(
  studentId: string,
): Promise<ProfessorFinancialStatusResult> {
  await requireRole("socio", "professor");

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("get_student_financial_status", {
    target_student_id: studentId,
  });

  if (error?.code === "42501") return { error: "FORBIDDEN" };
  if (error || !data) return { error: "UNAVAILABLE" };
  return { data: { status: data } };
}
