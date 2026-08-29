"use client";

import { useActionState } from "react";

import { assignTrainingAction } from "@/lib/actions/training.actions";
import {
  initialTrainingActionState,
  type TrainingActionState,
} from "@/lib/actions/training.state";
import type { TrainerAthleteSummary } from "@/lib/services/athlete.service";
import { Button } from "@/components/ui/button";

export function TrainingAssignmentForm({
  athletes,
  trainingId,
}: {
  athletes: TrainerAthleteSummary[];
  trainingId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    assignTrainingAction,
    initialTrainingActionState as TrainingActionState,
  );

  if (athletes.length === 0) {
    return <p className="field-hint">Cadastre ou vincule atletas antes de atribuir este treino.</p>;
  }

  return (
    <form action={formAction} className="training-assignment-form">
      <input name="trainingId" type="hidden" value={trainingId} />
      <fieldset>
        <legend>Atribuir a atletas</legend>
        <p className="field-hint">Quando houver avaliação, a referência de ritmo vigente será registrada com esta atribuição.</p>
        <div className="training-assignment-options">
          {athletes.map((athlete) => (
            <label key={athlete.id} className="training-assignment-option">
              <input name="athleteIds" type="checkbox" value={athlete.id} />
              <span>{athlete.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.fieldErrors?.athleteIds?.[0] ? (
        <p className="field-error" role="alert">
          {state.fieldErrors.athleteIds[0]}
        </p>
      ) : null}
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Atribuindo..." : "Atribuir treino"}
      </Button>
    </form>
  );
}
