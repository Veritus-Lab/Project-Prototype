import { NextResponse } from "next/server";

import { getProfessorStudentFinancialStatus } from "@/lib/services/professor-financial-status.service";
import { z } from "zod";

const studentIdSchema = z.uuid();

function authorizationResponse(error: unknown) {
  const message = String(error);
  const status = message.includes("NEXT_REDIRECT:/login") ? 401 : 403;
  return NextResponse.json({ error: "Financial status unavailable" }, { status });
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/v1/professor/students/[studentId]/financial-status">,
) {
  const { studentId } = await context.params;
  if (!studentIdSchema.safeParse(studentId).success) {
    return NextResponse.json({ error: "Invalid student identifier" }, { status: 400 });
  }

  let result;
  try {
    result = await getProfessorStudentFinancialStatus(studentId);
  } catch (error) {
    return authorizationResponse(error);
  }

  if ("error" in result) {
    const status = result.error === "FORBIDDEN" ? 403 : 503;
    return NextResponse.json({ error: "Financial status unavailable" }, { status });
  }

  return NextResponse.json({ data: result.data });
}
