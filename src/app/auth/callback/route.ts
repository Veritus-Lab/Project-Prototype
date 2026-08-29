import { NextResponse, type NextRequest } from "next/server";

import { getConfiguredAppOrigin } from "@/lib/services/auth.service";
import { completeInvitationAcceptance } from "@/lib/services/invitation.service";
import { createServerClient } from "@/lib/supabase/server";

function confirmationUrl(origin: string) {
  return new URL("/confirmar-email?erro=link-invalido", origin);
}

export async function GET(request: NextRequest) {
  const origin = getConfiguredAppOrigin();

  if (!origin) {
    return NextResponse.json(
      { error: "Não foi possível concluir a confirmação agora." },
      { status: 500 },
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const invitationToken = request.nextUrl.searchParams.get("convite");
  const athleteName = request.nextUrl.searchParams.get("nome");

  if (!code) {
    return NextResponse.redirect(confirmationUrl(origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(confirmationUrl(origin));
  }

  if (invitationToken || athleteName) {
    if (!invitationToken || !athleteName) {
      return NextResponse.redirect(confirmationUrl(origin));
    }

    const completion = await completeInvitationAcceptance({
      token: invitationToken,
      nome: athleteName,
    });

    if ("error" in completion) {
      return NextResponse.redirect(confirmationUrl(origin));
    }

    return NextResponse.redirect(new URL("/atleta", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
