import { NextResponse, type NextRequest } from "next/server";

import { getConfiguredAppOrigin } from "@/lib/services/auth.service";
import { createServerClient } from "@/lib/supabase/server";

function confirmationUrl(origin: string) {
  return new URL("/confirmar-email?erro=link-invalido", origin);
}

export async function GET(request: NextRequest) {
  const origin = getConfiguredAppOrigin();
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(confirmationUrl(origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(confirmationUrl(origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
