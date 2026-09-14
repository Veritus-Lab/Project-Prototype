import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
import { Card } from "@/components/ui/card";
export const metadata = { title: "Recuperar acesso — FLERNK" };
export default function RecoveryPage() { return <AuthShell><Card className="auth-card" elevated><h1>Recuperar acesso</h1><p className="auth-lead">Informe seu e-mail para receber as instruções de redefinição.</p><PasswordRecoveryForm /><p className="auth-footer"><Link href="/login">Voltar para entrar</Link></p></Card></AuthShell>; }
