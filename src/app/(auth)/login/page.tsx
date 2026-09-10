
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Entrar — FLERNK",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <Card className="auth-card" elevated>
        <h1>Entrar</h1>
        <p className="auth-lead">
          Acesse a sua conta na plataforma.
        </p>
        <LoginForm />
        <p className="auth-footer">Seu acesso é fornecido pela equipe FLERNK.</p>
      </Card>
    </AuthShell>
  );
}
