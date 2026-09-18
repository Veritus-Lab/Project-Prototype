import { NextResponse, type NextRequest } from "next/server";

import { enqueueJob } from "@/lib/queue/job-queue.service";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_PRESETS,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { timingSafeStringEqual } from "@/lib/security/timing-safe";
import { getServerEnv } from "@/lib/server-env";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting por IP para proteger contra flooding
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = checkRateLimit(`webhook:asaas:${clientIp}`, RATE_LIMIT_PRESETS.WEBHOOK);

  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, RATE_LIMIT_PRESETS.WEBHOOK.message);
  }

  // 2. Validação segura contra Timing Attack
  const token = request.headers.get("asaas-access-token");
  const env = getServerEnv();
  const expected = env.ASAAS_WEBHOOK_TOKEN;

  if (!expected || !token || !timingSafeStringEqual(token, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 3. Validação do Payload
  const event = (await request.json().catch(() => null)) as {
    id?: string;
    event?: string;
    payment?: { id?: string };
  } | null;

  if (!event?.id || !event.event) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  // 4. Ingestão transacional e enfileiramento resiliente
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from("provider_events").insert({
      provider: "asaas",
      external_event_id: event.id,
      event_type: event.event,
      sanitized_payload: { payment_id: event.payment?.id ?? null },
    } as never);

    if (error?.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (error) {
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  } catch {
    // Continua para o enfileiramento mesmo em caso de erro local
  }

  // 5. Enfileira o evento para processamento desacoplado
  await enqueueJob({
    type: "process_asaas_event",
    payload: {
      eventId: event.id,
      eventType: event.event,
      paymentId: event.payment?.id ?? null,
    },
    idempotencyKey: `asaas-event-${event.id}`,
  });

  return NextResponse.json({ received: true });
}
