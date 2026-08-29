import { TrainingExecutionForm } from "@/components/dashboard/training-execution-form";
import { Card } from "@/components/ui/card";
import type {
  AthleteDailyFeedData,
  AthleteFeedAssignment,
} from "@/lib/services/athlete-feed.service";

const statusLabels = {
  atribuido: "Atribuído",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
} as const;

function AssignmentDetails({ assignment }: { assignment: AthleteFeedAssignment }) {
  const canExecute =
    assignment.status === "atribuido" || assignment.status === "em_andamento";

  return (
    <>
      <div className="athlete-daily-feed-meta">
        <span>{assignment.when}</span>
        <span className={`athlete-daily-feed-status athlete-daily-feed-status-${assignment.status}`}>
          {statusLabels[assignment.status]}
        </span>
      </div>
      <p className="athlete-daily-feed-detail">{assignment.detail}</p>
      {canExecute ? (
        <div className="athlete-daily-feed-action">
          <TrainingExecutionForm assignmentId={assignment.id} status={assignment.status} />
        </div>
      ) : null}
    </>
  );
}

export function AthleteDailyFeed({ feed }: { feed: AthleteDailyFeedData }) {
  const { priority } = feed;
  const recent = feed.recent.filter((assignment) => assignment.id !== priority?.id);

  if (!priority && recent.length === 0) {
    return (
      <section className="athlete-daily-feed" aria-labelledby="athlete-daily-feed-title">
        <h2 id="athlete-daily-feed-title">Treinos programados</h2>
        <p className="dashboard-empty-state">Nenhum treino programado</p>
      </section>
    );
  }

  return (
    <section className="athlete-daily-feed" aria-labelledby="athlete-daily-feed-title">
      {!priority ? <h2 id="athlete-daily-feed-title">Treinos programados</h2> : null}
      {priority ? (
        <Card elevated className="athlete-daily-feed-priority">
          <p className="eyebrow">{priority.isToday ? "Hoje" : "Programado"}</p>
          <h2 id="athlete-daily-feed-title">
            {priority.isToday ? "Seu treino de hoje" : "Próximo treino"}
          </h2>
          <h3>{priority.title}</h3>
          <AssignmentDetails assignment={priority} />
        </Card>
      ) : null}

      {recent.length > 0 ? (
        <section className="athlete-daily-feed-history" aria-labelledby="athlete-daily-feed-history-title">
          <h2 id="athlete-daily-feed-history-title">Treinos recentes</h2>
          <ul>
            {recent.map((assignment) => (
              <li key={assignment.id}>
                <h3>{assignment.title}</h3>
                <AssignmentDetails assignment={assignment} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
