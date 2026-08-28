"use client";

import { useActionState } from "react";

import { scheduleTrainingAction } from "@/lib/actions/schedule.actions";
import { initialTrainingActionState } from "@/lib/actions/training.state";
import type { TrainerAthleteSummary } from "@/lib/services/athlete.service";
import type { TrainerTrainingListItem } from "@/lib/services/training.service";
import { Button } from "@/components/ui/button";

export function TrainingScheduleForm({
  athletes,
  trainings,
}: {
  athletes: TrainerAthleteSummary[];
  trainings: TrainerTrainingListItem[];
}) {
  const [state, formAction, isPending] = useActionState(scheduleTrainingAction, initialTrainingActionState);

  if (athletes.length === 0 || trainings.length === 0) {
    return <p className="dashboard-empty-state">Crie um treino e vincule atletas antes de agendar.</p>;
  }

  return (
    <form action={formAction} className="training-form" noValidate>
      <div className="form-field">
        <label htmlFor="trainingId">Treino</label>
        <select className="input" id="trainingId" name="trainingId" required>
          <option value="">Selecione um treino</option>
          {trainings.map((training) => <option key={training.id} value={training.id}>{training.titulo}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="scheduledFor">Data e horário</label>
        <input className="input" id="scheduledFor" name="scheduledFor" type="datetime-local" required />
        <p className="field-hint">O horário será salvo no timezone definido para a assessoria.</p>
      </div>
      <div className="form-field">
        <label htmlFor="note">Observação para os atletas</label>
        <textarea className="input" id="note" maxLength={500} name="note" rows={3} />
      </div>
      <fieldset className="training-assignment-options">
        <legend>Atletas</legend>
        {athletes.map((athlete) => <label className="training-assignment-option" key={athlete.id}><input name="athleteIds" type="checkbox" value={athlete.id} /><span>{athlete.nome}</span></label>)}
      </fieldset>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <Button disabled={isPending} type="submit">{isPending ? "Agendando..." : "Agendar treino"}</Button>
    </form>
  );
}
