import type { ReactNode } from "react";

import { signOutAction } from "./signout/actions";
import { requireUser, type PapelUsuario } from "@/lib/auth/session";

interface SidebarItem {
  label: string;
  href?: string;
}

// Items without href are presentation-only for this etapa; they stay inert
// by design until their features are implemented.
const sidebarItems: Record<PapelUsuario, SidebarItem[]> = {
  treinador: [
    { label: "Painel", href: "/treinador" },
    { label: "Convites", href: "/treinador/convites" },
    { label: "Atletas", href: "/treinador/atletas" },
    { label: "Treinos", href: "/treinador/treinos" },
    { label: "Calendário", href: "/treinador/calendario" },
    { label: "Mensagens" },
  ],
  atleta: [
    { label: "Painel", href: "/atleta" },
    { label: "Meus treinos" },
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
      <aside className="dashboard-sidebar">
        <span className="dashboard-brand">FLERNK</span>
        <nav className="dashboard-nav" aria-label="Navegação do painel">
          {items.map((item) =>
            item.href ? (
              <a key={item.label} href={item.href} className="dashboard-nav-link">
                {item.label}
              </a>
            ) : (
              <span key={item.label} className="dashboard-nav-item">
                {item.label}
              </span>
            ),
          )}
        </nav>
      </aside>
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
