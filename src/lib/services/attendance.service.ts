import { requireRole } from "@/lib/auth/session";
import { assertApplicationMutationAllowed } from "@/lib/environment/external-effects-policy";
import { createServerClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/mvp-foundation";

export type AttendanceEntry = { studentId: string; status: AttendanceStatus };
const statuses = new Set<AttendanceStatus>(["present", "absent", "excused", "not_recorded"]);

export async function listMeetingAttendance(meetingId: string) {
  const user = await requireRole("socio", "professor"); const supabase = await createServerClient();
  const { data: meeting, error } = await supabase.from("class_meetings").select("id,class_id,starts_at,canceled_at").eq("id", meetingId).eq("assessoria_id", user.assessoriaId).maybeSingle();
  if (error || !meeting) return { error: "Não foi possível carregar a chamada." } as const;
  const meetingDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(meeting.starts_at));
  const { data: memberships } = await supabase.from("class_memberships").select("id,student_id,starts_on,ends_on").eq("assessoria_id", user.assessoriaId).eq("class_id", meeting.class_id).lte("starts_on", meetingDay).or(`ends_on.is.null,ends_on.gte.${meetingDay}`);
  const ids = (memberships ?? []).map((item) => item.student_id);
  const [{ data: students }, { data: attendance }] = await Promise.all([ids.length ? supabase.from("students").select("id,name").eq("assessoria_id", user.assessoriaId).in("id", ids) : Promise.resolve({ data: [] }), ids.length ? supabase.from("attendances").select("student_id,status").eq("assessoria_id", user.assessoriaId).eq("meeting_id", meeting.id) : Promise.resolve({ data: [] })]);
  const names = new Map((students ?? []).map((item) => [item.id, item.name])); const states = new Map((attendance ?? []).map((item) => [item.student_id, item.status as AttendanceStatus]));
  return { data: { meeting, students: ids.map((id) => ({ id, name: names.get(id) ?? "Aluno", status: states.get(id) ?? "not_recorded" as AttendanceStatus })) } } as const;
}

export async function recordAttendanceBatch(meetingId: string, entries: AttendanceEntry[]) {
  assertApplicationMutationAllowed(); await requireRole("socio", "professor");
  if (!meetingId || !entries.length || entries.some((item) => !item.studentId || !statuses.has(item.status))) return { error: "Revise a chamada antes de salvar." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("record_attendance_batch" as never, { target_meeting_id: meetingId, entries: entries.map((item) => ({ student_id: item.studentId, status: item.status })) } as never);
  if (error) return { error: "Não foi possível registrar a chamada. Confira se o encontro está ativo." } as const;
  return { success: true } as const;
}
