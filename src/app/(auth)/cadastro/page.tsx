import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";

export default function TrainerSignupPage() {
  return (
    <AuthShell>
      <Card className="auth-card" elevated>
        <p className="eyebrow">Para treinadores</p>
        <h1>Crie a sua assessoria</h1>
        <p className="auth-lead">
          Cadastre-se como treinador para organizar a rotina dos seus atletas.
        </p>
        <SignupForm />
        <p className="auth-footer">
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </p>
      </Card>
    </AuthShell>
  );
}
