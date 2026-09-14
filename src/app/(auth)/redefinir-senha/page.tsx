import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordUpdateForm } from "@/components/auth/password-update-form";
import { Card } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
export const metadata = { title: "Redefinir senha — FLERNK" };
export default async function PasswordUpdatePage() { const supabase = await createServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); return <AuthShell><Card className="auth-card" elevated><h1>Defina sua nova senha</h1><p className="auth-lead">Use uma senha segura para voltar ao seu painel.</p><PasswordUpdateForm /></Card></AuthShell>; }
