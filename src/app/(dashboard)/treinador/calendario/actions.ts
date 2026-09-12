"use server";
import { revalidatePath } from "next/cache";
import { addClassMember, cancelClassMeeting, createClass, createClassMeetingSeries } from "@/lib/services/class.service";
type State = { error?: string; success?: boolean };
export async function createClassAction(_s: State, fd: FormData): Promise<State> { const r = await createClass(String(fd.get("name") ?? ""), String(fd.get("description") ?? "")); if ("error" in r) return r; revalidatePath("/treinador/calendario"); return r; }
export async function createClassMeetingAction(_s: State, fd: FormData): Promise<State> { const r = await createClassMeetingSeries(String(fd.get("classId") ?? ""), String(fd.get("startsAt") ?? ""), String(fd.get("endsAt") ?? ""), Number(fd.get("occurrences") ?? 1)); if ("error" in r) return r; revalidatePath("/treinador/calendario"); return r; }
export async function cancelClassMeetingAction(fd: FormData): Promise<void> { await cancelClassMeeting(String(fd.get("meetingId") ?? ""), String(fd.get("reason") ?? "")); revalidatePath("/treinador/calendario"); }
export async function addClassMemberAction(_s: State, fd: FormData): Promise<State> { const r = await addClassMember(String(fd.get("classId") ?? ""), String(fd.get("studentId") ?? ""), String(fd.get("enrollmentId") ?? "")); if ("error" in r) return r; revalidatePath("/treinador/calendario"); return r; }
