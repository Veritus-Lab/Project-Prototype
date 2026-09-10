import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PapelUsuario = Database["public"]["Enums"]["papel_usuario"];
export type FlernkRole = "socio" | "professor" | "aluno";
export type FlernkRoleRequirement = FlernkRole | PapelUsuario;

export interface SessionUser {
  id: string;
  email: string;
  nome: string;
  /** Compatibility value for the training module while Task 09 moves its routes. */
  papel: PapelUsuario;
  role?: FlernkRole;
  assessoriaId: string;
  teamMemberId?: string | null;
  studentId?: string | null;
}

export const missingProfileError =
  "Sua conta ainda não está configurada. Fale com o suporte.";

function legacyPapelForRole(role: FlernkRole): PapelUsuario {
  return role === "aluno" ? "atleta" : "treinador";
}

export function destinationForRole(role: FlernkRole) {
  return role === "aluno" ? "/atleta" : "/treinador";
}

export function destinationForPapel(papel: PapelUsuario) {
  return papel === "treinador" ? "/treinador" : "/atleta";
}

function roleMatchesRequirement(role: FlernkRole, requirement: FlernkRoleRequirement) {
  if (requirement === "treinador") return role === "socio" || role === "professor";
  if (requirement === "atleta") return role === "aluno";
  return role === requirement;
}

// Authorization comes exclusively from active persisted membership/ownership.
// Profile metadata remains identity data and cannot grant an operational role.
export async function requireUser(): Promise<SessionUser> {
  const supabase = await createServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, nome, assessoria_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(missingProfileError);
  }

  const { data: member, error: memberError } = await supabase
    .from("team_members")
    .select("id, role")
    .eq("assessoria_id", profile.assessoria_id)
    .eq("profile_id", authData.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!memberError && member?.id && (member.role === "socio" || member.role === "professor")) {
    return {
      id: profile.id,
      email: authData.user.email ?? "",
      nome: profile.nome,
      papel: legacyPapelForRole(member.role),
      role: member.role,
      assessoriaId: profile.assessoria_id,
      teamMemberId: member.id,
      studentId: null,
    };
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("assessoria_id", profile.assessoria_id)
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (studentError || !student?.id) {
    throw new Error(missingProfileError);
  }

  return {
    id: profile.id,
    email: authData.user.email ?? "",
    nome: profile.nome,
    papel: legacyPapelForRole("aluno"),
    role: "aluno",
    assessoriaId: profile.assessoria_id,
    teamMemberId: null,
    studentId: student.id,
  };
}

export async function requireRole(
  ...roles: readonly FlernkRoleRequirement[]
): Promise<SessionUser> {
  const user = await requireUser();
  const resolvedRole = user.role;

  if (!resolvedRole || !roles.some((role) => roleMatchesRequirement(resolvedRole, role))) {
    const fallbackRole: FlernkRole = user.papel === "atleta" ? "aluno" : "professor";
    redirect(destinationForRole(resolvedRole ?? fallbackRole));
  }

  return user;
}
