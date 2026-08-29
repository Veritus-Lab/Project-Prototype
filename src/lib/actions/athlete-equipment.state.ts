export interface AthleteEquipmentActionState {
  fieldErrors?: Record<string, string[] | undefined>;
  error?: string;
  success?: string;
}

export const initialAthleteEquipmentActionState: AthleteEquipmentActionState = {};
