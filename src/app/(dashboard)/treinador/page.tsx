import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, UserRoundCog, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Gestão — FLERNK" };

type ManagementLink = {
  title: string;
  description: string;
  href: string;
  icon: typeof UsersRound;
};

const partnerLinks: ManagementLink[] = [
  {
    title: "Alunos",
    description: "Consulte os alunos vinculados à assessoria.",
    href: "/treinador/atletas",
    icon: UsersRound,
  },
  {
    title: "Turmas",
    description: "Organize a operação das turmas da FLERNK.",
    href: "/treinador/calendario",
    icon: CalendarDays,
  },
  {
    title: "Financeiro",
    description: "Acompanhe assinaturas, cobranças e pagamentos.",
    href: "/treinador/financeiro",
    icon: CircleDollarSign,
  },
  {
    title: "Equipe",
    description: "Gerencie os acessos administrativos da assessoria.",
    href: "/treinador/equipe",
    icon: UserRoundCog,
  },
];

const professorLinks: ManagementLink[] = partnerLinks.slice(0, 2);

export default async function ManagementDashboard() {
  const user = await requireRole("socio", "professor");
  const isPartner = user.role === "socio";
  const links = isPartner ? partnerLinks : professorLinks;

  return (
    <div className="dashboard-page">
      <p className="eyebrow">{isPartner ? "Visão geral" : "Gestão operacional"}</p>
      <h1 className="dashboard-title">Olá, {user.nome}</h1>
      <p className="dashboard-subtitle">
        {isPartner
          ? "Centralize a gestão administrativa e financeira da FLERNK."
          : "Acompanhe os alunos e a organização das suas turmas."}
      </p>

      <section className="dashboard-section" aria-label="Áreas de gestão">
        <div className="trainer-quick-actions">
          {links.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <Icon aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <Card elevated>
          <h2>{isPartner ? "Organização da assessoria" : "Próximas ações"}</h2>
          <p className="dashboard-empty-state">
            {isPartner
              ? "Use as áreas acima para manter alunos, turmas, finanças e equipe organizados."
              : "Consulte os alunos e as turmas para registrar os acompanhamentos da operação."}
          </p>
        </Card>
      </section>
    </div>
  );
}
