import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/atleta/:path*",
    "/treinador/:path*",
    "/aluno/:path*",
    "/socio/:path*",
    "/professor/:path*",
    "/redefinir-senha",
    "/auth/callback",
  ],
};
