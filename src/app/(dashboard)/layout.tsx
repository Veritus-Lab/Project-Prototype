import type { ReactNode } from "react";

import { signOutAction } from "./signout/actions";
import { DashboardNavigation, type DashboardNavigationItem } from "@/components/dashboard/dashboard-navigation";
import { requireUser, type FlernkRole } from "@/lib/auth/session";

// Items without href are presentation-only for this etapa; they stay inert
// by design until their features are implemented.
const sidebarItems: Record<FlernkRole, DashboardNavigationItem[]> = {
  socio: [
    { label: "Painel", href: "/treinador" },
    { label: "Alunos", href: "/treinador/atletas" },
    { label: "Turmas", href: "/treinador/calendario" },
    { label: "Financeiro", href: "/treinador/financeiro" },
    { label: "Mensagens", href: "/treinador/mensagens" },
    { label: "Equipe", href: "/treinador/equipe" },
  ],
  professor: [
    { label: "Minha gestão", href: "/treinador" },
    { label: "Alunos", href: "/treinador/atletas" },
    { label: "Turmas", href: "/treinador/calendario" },
  ],
  aluno: [
    { label: "Painel", href: "/atleta" },
    { label: "Minha turma", href: "/atleta/calendario" },
    { label: "Meu financeiro" },
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
