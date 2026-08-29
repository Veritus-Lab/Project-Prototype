import type { ReactNode } from "react";

import { signOutAction } from "./signout/actions";
import { DashboardNavigation, type DashboardNavigationItem } from "@/components/dashboard/dashboard-navigation";
import { requireUser, type PapelUsuario } from "@/lib/auth/session";

// Items without href are presentation-only for this etapa; they stay inert
// by design until their features are implemented.
const sidebarItems: Record<PapelUsuario, DashboardNavigationItem[]> = {
  treinador: [
    { label: "Painel", href: "/treinador" },
    { label: "Convites", href: "/treinador/convites" },
    { label: "Atletas", href: "/treinador/atletas" },
    { label: "Treinos", href: "/treinador/treinos" },
    { label: "Calendário", href: "/treinador/calendario" },
    { label: "Financeiro", href: "/treinador/financeiro" },
    { label: "Mensagens", href: "/treinador/mensagens" },
  ],
  atleta: [
    { label: "Painel", href: "/atleta" },
    { label: "Meus treinos", href: "/atleta/treinos" },
    { label: "Calendário", href: "/atleta/calendario" },
    { label: "Mensagens" },
  ],
};

const papelLabel: Record<PapelUsuario, string> = {
  treinador: "Treinador",
  atleta: "Atleta",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const items = sidebarItems[user.papel];

  return (
    <div className="dashboard">
      <DashboardNavigation items={items} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <span className="dashboard-role">{papelLabel[user.papel]}</span>
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
