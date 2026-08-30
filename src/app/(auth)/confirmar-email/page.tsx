import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Card } from "@/components/ui/card";

interface ConfirmEmailPageProps {
  searchParams: Promise<{ email?: string; erro?: string }>;
}

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const { email, erro } = await searchParams;

  if (erro) {
    return (
      <AuthShell>
        <Card className="auth-card confirmation-card" elevated>
          <p className="eyebrow">Confirmação indisponível</p>
          <h1>Não foi possível confirmar seu e-mail.</h1>
          <p className="auth-lead">
            O link pode ter expirado ou já ter sido usado. Solicite um novo link
            para tentar novamente.
          </p>
          <Link className="button button-secondary" href="/cadastro">
            Tentar novamente
          </Link>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="auth-card confirmation-card" elevated>
        <p className="eyebrow">Confirme seu e-mail</p>
        <h1>Quase lá.</h1>
        <p className="auth-lead">
          Enviamos um link de confirmação{email ? ` para ${email}` : ""}. Abra o
          e-mail para ativar sua conta e concluir o acesso à plataforma.
        </p>
        <p className="field-hint">
          Não encontrou a mensagem? Verifique também a caixa de spam.
        </p>
        <Link className="button button-secondary" href="/login">
          Voltar para entrar
        </Link>
      </Card>
    </AuthShell>
  );
}
