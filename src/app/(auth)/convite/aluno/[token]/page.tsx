import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { StudentInvitationSignupForm } from "@/components/auth/student-invitation-signup-form";
import { Card } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import { acceptStudentInvitationAction } from "./actions";

export const metadata = { title: "Convite de aluno — FLERNK" };

export default async function StudentInvitePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ erro?: string }> }) {
  const [{ token }, { erro }] = await Promise.all([params, searchParams]);
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <AuthShell><Card className="auth-card" elevated><p className="eyebrow">FLERNK</p><h1>{user ? "Ative seu acesso" : "Crie seu acesso"}</h1><p className="auth-lead">Use o mesmo e-mail cadastrado pela assessoria para acompanhar sua situação financeira e administrativa.</p>{user ? <form action={acceptStudentInvitationAction} className="signup-form"><input type="hidden" name="token" value={token} />{erro ? <p className="form-error" role="alert">{erro}</p> : null}<button className="button button-primary" type="submit">Aceitar convite</button></form> : <><StudentInvitationSignupForm token={token} /><p className="field-hint">Já tem conta? <Link href="/login">Entre e abra este convite novamente.</Link></p></>}</Card></AuthShell>;
}
