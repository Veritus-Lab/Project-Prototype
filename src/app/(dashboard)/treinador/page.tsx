import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Plus, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getTrainerDashboardData } from "@/lib/services/dashboard.service";

export const metadata = { title: "Painel do treinador — FLERNK" };

export default async function TreinadorDashboard() {
  const user = await requireRole("treinador");
  const { metrics, trainings } = await getTrainerDashboardData(user);

  return <div className="dashboard-page dashboard-v2">
    <div className="page-heading-actions dashboard-welcome"><div><p className="eyebrow">Painel do treinador</p><h1 className="dashboard-title">Olá, {user.nome}</h1><p className="dashboard-subtitle">O que precisa de atenção na sua assessoria hoje.</p></div><Link className="button bg-brand button-primary" href="/treinador/treinos/novo"><Plus aria-hidden="true" />Novo treino</Link></div>
    <div className="dashboard-cards">{metrics.map((metric) => <Card key={metric.label} elevated><h3>{metric.label}</h3><p className="dashboard-card-value">{metric.value}</p><p className="dashboard-card-hint">{metric.hint}</p></Card>)}</div>
    <div className="dashboard-operational-grid"><section className="dashboard-section"><div className="dashboard-section-heading"><h2>Próximos treinos</h2><Link href="/treinador/calendario">Ver calendário <ArrowRight aria-hidden="true" /></Link></div>{trainings.length ? <ul className="dashboard-list">{trainings.map((treino) => <li key={treino.id}><span className="dashboard-list-title">{treino.titulo}</span><span className="dashboard-list-when">{treino.quando}</span><span className="dashboard-list-detail">{treino.detalhe}</span></li>)}</ul> : <p className="dashboard-empty-state">Não há treinos agendados. Crie um treino e atribua-o a um atleta.</p>}</section><section className="dashboard-section dashboard-quick-actions"><h2>Ações rápidas</h2><Link href="/treinador/atletas"><UsersRound aria-hidden="true" /><span>Gerenciar atletas</span><ArrowRight aria-hidden="true" /></Link><Link href="/treinador/calendario"><CalendarDays aria-hidden="true" /><span>Programar treino</span><ArrowRight aria-hidden="true" /></Link><Link href="/treinador/financeiro"><CreditCard aria-hidden="true" /><span>Acompanhar financeiro</span><ArrowRight aria-hidden="true" /></Link></section></div>
  </div>;
}
