import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Card } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";
import { acceptTeamInvitationAction } from "./actions";

export const metadata = { title: "Convite de equipe — FLERNK" };

export default async function TeamInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const [{ token }, { erro }] = await Promise.all([params, searchParams]);
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthShell>
        <Card className="auth-card" elevated>
          <p className="eyebrow">Convite FLERNK</p>
          <h1>Entre para aceitar o convite</h1>
          <p className="auth-lead">Use o e-mail que recebeu este convite e volte a abrir este link.</p>
          <Link className="button button-primary" href="/login">Entrar</Link>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="auth-card" elevated>
        <p className="eyebrow">Convite FLERNK</p>
        <h1>Participar da equipe</h1>
        <p className="auth-lead">Confirme seu nome para ativar seu acesso administrativo.</p>
        <form action={acceptTeamInvitationAction} className="signup-form">
          <input type="hidden" name="token" value={token} />
          <label htmlFor="nome">Seu nome</label>
          <input id="nome" name="nome" className="input" autoComplete="name" required />
          {erro ? <p className="form-error" role="alert">{erro}</p> : null}
          <button className="button button-primary" type="submit">Aceitar convite</button>
        </form>
      </Card>
    </AuthShell>
  );
}
