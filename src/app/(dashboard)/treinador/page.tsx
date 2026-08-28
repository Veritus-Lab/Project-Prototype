import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Dumbbell,
  MailCheck,
  Plus,
  UsersRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getTrainerDashboardData } from "@/lib/services/dashboard.service";

export const metadata = { title: "Painel do treinador — FLERNK" };

const metricIcons = [UsersRound, Dumbbell, MailCheck];

export default async function TreinadorDashboard() {
  const user = await requireRole("treinador");
  const { metrics, trainings } = await getTrainerDashboardData(user);

  return (
    <div className="dashboard-page trainer-dashboard">
      <div className="trainer-dashboard-header">
        <div>
          <p className="eyebrow">Painel do treinador</p>
          <h1 className="dashboard-title">Olá, {user.nome}</h1>
          <p className="dashboard-subtitle">
            Visão operacional da sua assessoria.
          </p>
        </div>
        <Link className="button bg-brand button-primary" href="/treinador/treinos/novo">
          <Plus aria-hidden="true" />
          Novo treino
        </Link>
      </div>

      <section className="trainer-metrics" aria-label="Resumo da assessoria">
        {metrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? Dumbbell;

          return (
            <Card key={metric.label} elevated className="trainer-metric-card">
              <div className="trainer-metric-heading">
                <h2>{metric.label}</h2>
                <Icon aria-hidden="true" />
              </div>
              <p className="dashboard-card-value">{metric.value}</p>
              <p className="dashboard-card-hint">{metric.hint}</p>
            </Card>
          );
        })}
      </section>

      <div className="trainer-dashboard-grid">
        <section className="trainer-dashboard-panel trainer-training-panel">
          <div className="trainer-panel-heading">
            <div>
              <p className="eyebrow">Operação</p>
              <h2>Atividade de treinos</h2>
            </div>
            <Link href="/treinador/calendario">
              Ver calendário
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {trainings.length ? (
            <ul className="trainer-training-list">
              {trainings.map((training) => (
                <li key={training.id}>
                  <span className="trainer-training-icon">
                    <CalendarDays aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{training.titulo}</h3>
                    <p>{training.detalhe}</p>
                  </div>
                  <time>{training.quando}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty-state">
              Nenhum treino agendado. Crie um treino e atribua-o a um atleta.
            </p>
          )}
        </section>

        <section className="trainer-dashboard-panel trainer-actions-panel">
          <div className="trainer-panel-heading">
            <div>
              <p className="eyebrow">Atalhos</p>
              <h2>Ações rápidas</h2>
            </div>
          </div>
          <div className="trainer-quick-actions">
            <Link href="/treinador/atletas">
              <UsersRound aria-hidden="true" />
              <span><strong>Atletas</strong><small>Gerenciar vínculos e perfis</small></span>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/treinador/calendario">
              <CalendarDays aria-hidden="true" />
              <span><strong>Calendário</strong><small>Programar os próximos treinos</small></span>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/treinador/financeiro">
              <CreditCard aria-hidden="true" />
              <span><strong>Financeiro</strong><small>Acompanhar vencimentos</small></span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
