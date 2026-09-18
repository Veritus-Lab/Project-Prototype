import { NextResponse, type NextRequest } from "next/server";

import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_PRESETS,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_LANDING_ASSESSORIA_ID = "b8b49b94-ce66-49b6-8e4c-2dd98081abcf";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting por IP para conter bots e spam de formulário
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = checkRateLimit(`public_form:interest:${clientIp}`, RATE_LIMIT_PRESETS.PUBLIC_FORM);

  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult, RATE_LIMIT_PRESETS.PUBLIC_FORM.message);
  }

  // 2. Validação e sanitização da carga
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    phone?: string;
  } | null;

  if (!body || !body.name || body.name.trim().length < 2 || (!body.email && !body.phone)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // 3. Resolução da assessoria configurada
  const targetAssessoriaId = process.env.LANDING_ASSESSORIA_ID ?? DEFAULT_LANDING_ASSESSORIA_ID;
  const supabase = await createServerClient();

  const { data: assessoria } = await supabase
    .from("assessorias")
    .select("id")
    .eq("id", targetAssessoriaId)
    .maybeSingle();

  if (!assessoria) {
    return NextResponse.json({ error: "Serviço indisponível temporariamente." }, { status: 503 });
  }

  // 4. Inserção deduplicada com sanitização
  const safeEmail = body.email ? body.email.trim().toLowerCase() : null;
  const safePhone = body.phone ? body.phone.replace(/\D/g, "") : null;
  const deduplicationKey = `${safeEmail ?? ""}|${safePhone ?? ""}`;

  const { error } = await supabase.from("leads").insert({
    assessoria_id: assessoria.id,
    name: body.name.trim().slice(0, 100),
    email: safeEmail,
    phone: safePhone,
    deduplication_key: deduplicationKey,
    source: "landing",
  } as never);

  if (error?.code === "23505") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (error) {
    return NextResponse.json({ error: "Não foi possível enviar seus dados." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
