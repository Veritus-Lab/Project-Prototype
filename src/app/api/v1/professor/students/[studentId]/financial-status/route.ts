import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/session";
import { getProfessorStudentFinancialStatus } from "@/lib/services/professor-financial-status.service";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/v1/professor/students/[studentId]/financial-status">,
) {
  await requireRole("socio", "professor");
  const { studentId } = await context.params;
  const result = await getProfessorStudentFinancialStatus(studentId);

  if ("error" in result) {
    return NextResponse.json({ error: "Financial status unavailable" }, { status: 403 });
  }

  return NextResponse.json({ data: result.data });
}
