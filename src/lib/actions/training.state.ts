export interface TrainingActionState {
  fieldErrors?: Record<string, string[] | undefined>;
  error?: string;
  success?: string;
}

export const initialTrainingActionState: TrainingActionState = {};
