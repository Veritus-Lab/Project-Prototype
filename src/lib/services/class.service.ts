import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";

export async function listClasses() {
  const user = await requireRole("socio", "professor");
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("classes").select("id, name, description, active, created_at").eq("assessoria_id", user.assessoriaId).order("name");
  if (error || !data) return { error: "Não foi possível carregar as turmas agora." } as const;
  return { data: data.filter((item) => item.id) as Array<(typeof data)[number] & { id: string }> } as const;
}

export async function listClassMeetings() {
  const user = await requireRole("socio", "professor");
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("class_meetings").select("id, class_id, starts_at, ends_at, canceled_at, cancellation_reason").eq("assessoria_id", user.assessoriaId).order("starts_at", { ascending: false }).limit(30);
  if (error || !data) return { error: "Não foi possível carregar os encontros agora." } as const;
  return { data: data.filter((item) => item.id && item.class_id) as Array<(typeof data)[number] & { id: string; class_id: string }> } as const;
}

export async function listClassMemberships() {
  const user = await requireRole("socio", "professor");
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("class_memberships").select("id, class_id, student_id, enrollment_id, starts_on, ends_on").eq("assessoria_id", user.assessoriaId).is("ends_on", null);
  if (error || !data) return { error: "Não foi possível carregar os alunos das turmas." } as const;
  if (!data.length) return { data: [] } as const;
  const { data: students } = await supabase.from("students").select("id, name").eq("assessoria_id", user.assessoriaId).in("id", data.map((item) => item.student_id));
  const names = new Map((students ?? []).map((student) => [student.id, student.name]));
  return { data: data.filter((item) => item.id && item.class_id && item.student_id && item.enrollment_id).map((item) => ({ ...item, id: item.id as string, class_id: item.class_id as string, student_id: item.student_id as string, enrollment_id: item.enrollment_id as string, student_name: names.get(item.student_id) ?? "Aluno" })) } as const;
}

export async function createClass(name: string, description?: string) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  if (name.trim().length < 2 || name.trim().length > 120) return { error: "Informe um nome de turma válido." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_class" as never, { target_name: name, target_description: description?.trim() || null } as never);
  if (error) return { error: "Não foi possível criar a turma agora." } as const;
  return { success: true } as const;
}

export async function createClassMeeting(classId: string, startsAt: string, endsAt: string) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  const start = new Date(startsAt); const end = new Date(endsAt);
  if (!classId || Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start) return { error: "Informe início e fim válidos." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_class_meeting" as never, { target_class_id: classId, target_starts_at: start.toISOString(), target_ends_at: end.toISOString() } as never);
  if (error) return { error: "Não foi possível criar o encontro agora." } as const;
  return { success: true } as const;
}

export async function createClassMeetingSeries(classId: string, startsAt: string, endsAt: string, occurrences: number) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  const start = new Date(startsAt); const end = new Date(endsAt);
  if (!classId || Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end <= start || !Number.isInteger(occurrences) || occurrences < 1 || occurrences > 52) return { error: "Informe horários válidos e até 52 ocorrências." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("create_class_meeting_series" as never, { target_class_id: classId, target_starts_at: start.toISOString(), target_ends_at: end.toISOString(), target_occurrences: occurrences } as never);
  if (error) return { error: "Não foi possível agendar a recorrência agora." } as const;
  return { success: true } as const;
}

export async function addClassMember(classId: string, studentId: string, enrollmentId: string) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  if (!classId || !studentId || !enrollmentId) return { error: "Selecione turma, aluno e matrícula." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("add_class_member" as never, { target_class_id: classId, target_student_id: studentId, target_enrollment_id: enrollmentId } as never);
  if (error) return { error: "Não foi possível vincular o aluno agora." } as const;
  return { success: true } as const;
}

export async function cancelClassMeeting(meetingId: string, reason: string) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  if (!meetingId || reason.trim().length < 2) return { error: "Informe o motivo do cancelamento." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("cancel_class_meeting" as never, { target_meeting_id: meetingId, target_reason: reason.trim() } as never);
  if (error) return { error: "Não foi possível cancelar o encontro agora." } as const;
  return { success: true } as const;
}
