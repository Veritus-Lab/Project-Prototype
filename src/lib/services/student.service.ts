import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";
import { studentSchema, type StudentInput } from "@/lib/validators/student";

export type EnrollmentStatus = "active" | "suspended" | "ended";
export type StudentEnrollment = {
  id: string;
  status: EnrollmentStatus;
  starts_on: string;
  ends_on: string | null;
  suspension_reason: string | null;
};

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
  if (data.length === 0) return { data: [] } as const;

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id, status, starts_on, ends_on, suspension_reason")
    .eq("assessoria_id", user.assessoriaId)
    .in("student_id", data.map((student) => student.id));
  if (enrollmentsError) return { error: "Não foi possível carregar as matrículas agora." } as const;

  const enrollmentByStudent = new Map((enrollments ?? []).map((enrollment) => [enrollment.student_id, enrollment]));
  return {
    data: data.map((student) => ({ ...student, enrollment: enrollmentByStudent.get(student.id) ?? null })),
  } as const;
}

export async function createEnrollment(studentId: string, startsOn: string) {
  assertApplicationMutationAllowed();
  await requireRole("socio", "professor");
  if (!studentId || !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) {
    return { error: "Informe o aluno e uma data de início válida." } as const;
  }
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_enrollment" as never, {
    target_student_id: studentId,
    target_starts_on: startsOn,
  } as never);
  if (error) return { error: "Não foi possível criar a matrícula agora." } as const;
  return { success: true } as const;
}

export async function changeEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus,
  reason?: string,
) {
  assertApplicationMutationAllowed();
  await requireRole("socio", "professor");
  if (!enrollmentId || !["active", "suspended", "ended"].includes(status)) {
    return { error: "Situação de matrícula inválida." } as const;
  }
  if (status === "suspended" && !reason?.trim()) {
    return { error: "Informe o motivo da suspensão." } as const;
  }
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("change_enrollment_status" as never, {
    target_enrollment_id: enrollmentId,
    target_status: status,
    target_reason: reason?.trim() || null,
  } as never);
  if (error) return { error: "Não foi possível atualizar a matrícula agora." } as const;
  return { success: true } as const;
}

export async function listEnrollmentHistory(enrollmentId: string) {
  const user = await requireRole("socio", "professor");
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("enrollment_history")
    .select("id, enrollment_id, previous_status, new_status, reason, occurred_at")
    .eq("assessoria_id", user.assessoriaId)
    .eq("enrollment_id", enrollmentId)
    .order("occurred_at", { ascending: false });
  if (error || !data) return { error: "Não foi possível carregar o histórico agora." } as const;
  return { data } as const;
}
