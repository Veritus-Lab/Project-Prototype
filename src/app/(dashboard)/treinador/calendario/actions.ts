"use server";
import { revalidatePath } from "next/cache";
import { cancelClassMeeting, createClass, createClassMeeting } from "@/lib/services/class.service";
type State = { error?: string; success?: boolean };
export async function createClassAction(_s: State, fd: FormData): Promise<State> { const r = await createClass(String(fd.get("name") ?? ""), String(fd.get("description") ?? "")); if ("error" in r) return r; revalidatePath("/treinador/calendario"); return r; }
export async function createClassMeetingAction(_s: State, fd: FormData): Promise<State> { const r = await createClassMeeting(String(fd.get("classId") ?? ""), String(fd.get("startsAt") ?? ""), String(fd.get("endsAt") ?? "")); if ("error" in r) return r; revalidatePath("/treinador/calendario"); return r; }
export async function cancelClassMeetingAction(fd: FormData): Promise<void> { await cancelClassMeeting(String(fd.get("meetingId") ?? ""), String(fd.get("reason") ?? "")); revalidatePath("/treinador/calendario"); }
