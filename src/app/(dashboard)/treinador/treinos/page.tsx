import Link from "next/link";

import { TrainingAssignmentForm } from "@/components/dashboard/training-assignment-form";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerAthletes } from "@/lib/services/athlete.service";
import { listTrainerTrainings } from "@/lib/services/training.service";

export const metadata = { title: "Treinos - FLERNK" };

export default async function TrainerTrainingsPage() {
  const user = await requireRole("treinador");
  const [trainingResult, athleteResult] = await Promise.all([
    listTrainerTrainings(user),
    listTrainerAthletes(user),
  ]);
  const trainings = "data" in trainingResult && trainingResult.data ? trainingResult.data : [];
  const athletes = "data" in athleteResult && athleteResult.data ? athleteResult.data : [];

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Painel do treinador</p>
      <div className="page-heading-actions">
        <div>
          <h1 className="dashboard-title">Treinos</h1>
          <p className="dashboard-subtitle">
            Crie, acompanhe e atribua os treinos da sua assessoria.
          </p>
        </div>
        <Link className="button bg-brand button-primary" href="/treinador/treinos/novo">
          Novo treino
        </Link>
      </div>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Treinos criados</h2>
          {"error" in trainingResult ? (
            <p className="form-error" role="alert">
              {trainingResult.error}
            </p>
          ) : trainings.length ? (
            <ul className="dashboard-list">
              {trainings.map((training) => (
                <li key={training.id}>
                  <span className="dashboard-list-title">{training.titulo}</span>
                  <span className="dashboard-list-when">
                    {training.quantidadeBlocos} {training.quantidadeBlocos === 1 ? "bloco" : "blocos"}
                  </span>
                  <span className="dashboard-list-detail">
                    {training.descricao ?? "Sem descricao"}
                  </span>

                  <details className="training-assignment">
                    <summary>Atribuir a atletas</summary>
                    {"error" in athleteResult ? (
                      <p className="form-error" role="alert">
                        {athleteResult.error}
                      </p>
                    ) : (
                      <TrainingAssignmentForm athletes={athletes} trainingId={training.id} />
                    )}
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty-state">Nenhum treino criado ainda.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
