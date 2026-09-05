"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  Menu,
  MessageSquare,
  UserPlus,
  UsersRound,
  WalletCards,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export interface DashboardNavigationItem {
  label: string;
  href?: string;
}

const itemIcons: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = {
  Painel: LayoutDashboard,
  Convites: UserPlus,
  Atletas: UsersRound,
  Treinos: Dumbbell,
  "Meus treinos": Dumbbell,
  "Calendário": CalendarDays,
  Financeiro: WalletCards,
  Mensagens: MessageSquare,
};

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== "/treinador" && href !== "/atleta" && pathname.startsWith(`${href}/`));
}

function NavigationLinks({
  items,
  onNavigate,
}: {
  items: DashboardNavigationItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav" aria-label="Navegação do painel">
      {items.map((item) => {
        const Icon = itemIcons[item.label] ?? LayoutDashboard;

        if (!item.href) {
          return <span key={item.label} className="dashboard-nav-item" aria-disabled="true"><Icon aria-hidden={true} /><span>{item.label}</span></span>;
        }

        const current = isCurrentPath(pathname, item.href);
        return <Link key={item.label} href={item.href} className="dashboard-nav-link" aria-current={current ? "page" : undefined} onClick={onNavigate}><Icon aria-hidden={true} /><span>{item.label}</span></Link>;
      })}
    </nav>
  );
}

export function DashboardNavigation({ items }: { items: DashboardNavigationItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return <>
    <aside className={`dashboard-sidebar${isCollapsed ? " is-collapsed" : ""}`}>
      <div className="dashboard-brand-row"><span className="dashboard-brand"><Image src="/flernk-mark.png" alt="" aria-hidden="true" width={24} height={24} /><span>FLERNK</span></span><button type="button" className="dashboard-sidebar-toggle" aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"} onClick={() => setIsCollapsed((collapsed) => !collapsed)}>{isCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}</button></div>
      <NavigationLinks items={items} />
    </aside>
    <button type="button" className="dashboard-menu-trigger" aria-label="Abrir navegação" aria-expanded={isOpen} aria-controls="dashboard-mobile-navigation" onClick={() => setIsOpen(true)}><Menu aria-hidden="true" /></button>
    {isOpen ? <div className="dashboard-mobile-navigation" id="dashboard-mobile-navigation"><button type="button" className="dashboard-navigation-backdrop" aria-label="Fechar navegação" onClick={() => setIsOpen(false)} /><aside className="dashboard-navigation-drawer" aria-label="Menu do painel"><div className="dashboard-drawer-heading"><span className="dashboard-brand"><Image src="/flernk-mark.png" alt="" aria-hidden="true" width={24} height={24} /><span>FLERNK</span></span><button type="button" className="dashboard-drawer-close" aria-label="Fechar navegação" onClick={() => setIsOpen(false)}><X aria-hidden="true" /></button></div><NavigationLinks items={items} onNavigate={() => setIsOpen(false)} /></aside></div> : null}
  </>;
}
