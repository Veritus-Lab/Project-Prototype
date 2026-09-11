import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";
import { studentSchema, type StudentInput } from "@/lib/validators/student";

export async function createStudent(input: StudentInput) {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados do aluno inválidos." } as const;

  assertApplicationMutationAllowed();
  const user = await requireRole("socio", "professor");
  const student = parsed.data;
  const supabase = await createServerClient();
  const { error } = await supabase.from("students").insert({
    assessoria_id: user.assessoriaId,
    name: student.name,
    email: student.email || null,
    phone: student.phone || null,
    birth_date: student.birthDate || null,
    notes: student.notes || null,
  });

  if (error) return { error: "Não foi possível cadastrar o aluno agora." } as const;
  return { data: undefined } as const;
}

export async function listStudents() {
  const user = await requireRole("socio", "professor");
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, email, phone, created_at")
    .eq("assessoria_id", user.assessoriaId)
    .order("name", { ascending: true });
  if (error || !data) return { error: "Não foi possível carregar os alunos agora." } as const;
  return { data } as const;
}
