import type { ReactNode } from "react";

import { signOutAction } from "./signout/actions";
import { DashboardNavigation, type DashboardNavigationItem } from "@/components/dashboard/dashboard-navigation";
import { requireUser, type FlernkRole } from "@/lib/auth/session";

// Items without href are presentation-only for this etapa; they stay inert
// by design until their features are implemented.
const sidebarItems: Record<FlernkRole, DashboardNavigationItem[]> = {
  socio: [
    { label: "Painel", href: "/socio" },
    { label: "Alunos", href: "/socio/alunos" },
    { label: "Turmas", href: "/socio/turmas" },
    { label: "Financeiro", href: "/socio/financeiro" },
    { label: "Mensagens", href: "/socio/mensagens" },
    { label: "Equipe", href: "/socio/equipe" },
  ],
  professor: [
    { label: "Minha gestão", href: "/professor" },
    { label: "Alunos", href: "/professor/alunos" },
    { label: "Turmas", href: "/professor/turmas" },
  ],
  aluno: [
    { label: "Painel", href: "/aluno" },
    { label: "Minha turma", href: "/aluno/turma" },
    { label: "Meu financeiro", href: "/aluno/financeiro" },
  ],
};

const papelLabel: Record<FlernkRole, string> = {
  socio: "Sócio",
  professor: "Professor",
  aluno: "Aluno",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const items = sidebarItems[user.role ?? (user.papel === "atleta" ? "aluno" : "professor")];

  return (
    <div className="dashboard">
      <DashboardNavigation items={items} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <span className="dashboard-role">{papelLabel[user.role ?? (user.papel === "atleta" ? "aluno" : "professor")]}</span>
          <form className="dashboard-user" action={signOutAction}>
            <span className="dashboard-user-name">{user.nome}</span>
            <button type="submit" className="button button-ghost">
              Sair
            </button>
          </form>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
