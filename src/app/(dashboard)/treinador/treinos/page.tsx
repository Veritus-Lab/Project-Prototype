import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerTrainings } from "@/lib/services/training.service";

export const metadata = { title: "Treinos — FLERNK" };

export default async function TrainerTrainingsPage() {
  const user = await requireRole("treinador");
  const result = await listTrainerTrainings(user);
  const trainings = "data" in result && result.data ? result.data : [];

  return <div className="dashboard-page"><p className="eyebrow">Painel do treinador</p><div className="page-heading-actions"><div><h1 className="dashboard-title">Treinos</h1><p className="dashboard-subtitle">Crie e acompanhe a biblioteca de treinos da sua assessoria.</p></div><Link className="button bg-brand button-primary" href="/treinador/treinos/novo">Novo treino</Link></div><section className="dashboard-section"><Card elevated><h2>Treinos criados</h2>{"error" in result ? <p className="form-error" role="alert">{result.error}</p> : trainings.length ? <ul className="dashboard-list">{trainings.map((training) => <li key={training.id}><span className="dashboard-list-title">{training.titulo}</span><span className="dashboard-list-when">{training.quantidadeBlocos} {training.quantidadeBlocos === 1 ? "bloco" : "blocos"}</span><span className="dashboard-list-detail">{training.descricao ?? "Sem descrição"}</span></li>)}</ul> : <p className="dashboard-empty-state">Nenhum treino criado ainda.</p>}</Card></section></div>;
}
