import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Card } from "@/components/ui/card";

interface ConfirmEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const { email } = await searchParams;

  return (
    <AuthShell>
      <Card className="auth-card confirmation-card" elevated>
        <p className="eyebrow">Confirme seu e-mail</p>
        <h1>Quase lá.</h1>
        <p className="auth-lead">
          Enviamos um link de confirmação{email ? ` para ${email}` : ""}. Abra o
          e-mail para ativar a sua conta de treinador.
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
