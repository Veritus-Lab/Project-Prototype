import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PapelUsuario = Database["public"]["Enums"]["papel_usuario"];

export interface SessionUser {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
  assessoriaId: string;
}

export const missingProfileError =
  "Sua conta ainda não está configurada. Fale com o suporte.";

export function destinationForPapel(papel: PapelUsuario) {
  return papel === "treinador" ? "/treinador" : "/atleta";
}

// Authorization is derived exclusively from the persisted profile; client
// supplied metadata or login preferences are never trusted.
export async function requireUser(): Promise<SessionUser> {
  const supabase = await createServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, nome, papel, assessoria_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(missingProfileError);
  }

  return {
    id: profile.id,
    email: authData.user.email ?? "",
    nome: profile.nome,
    papel: profile.papel,
    assessoriaId: profile.assessoria_id,
  };
}

export async function requireRole(papel: PapelUsuario): Promise<SessionUser> {
  const user = await requireUser();

  if (user.papel !== papel) {
    redirect(destinationForPapel(user.papel));
  }

  return user;
}
