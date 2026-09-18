import { NextResponse, type NextRequest } from "next/server";

import { processNextJobs } from "@/lib/queue/job-queue.service";
import { timingSafeStringEqual } from "@/lib/security/timing-safe";
import { getServerEnv } from "@/lib/server-env";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  const providedSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cronHeader;

  const env = getServerEnv();
  const expectedSecret = env.CRON_SECRET;

  if (!expectedSecret || !providedSecret || !timingSafeStringEqual(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 },
    );
  }

  try {
    const result = await processNextJobs(20, "cron-worker");
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao processar a fila.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
