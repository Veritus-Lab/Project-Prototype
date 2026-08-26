export interface AthleteOperationalActionState {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<
      | "athleteId"
      | "telefone"
      | "objetivo"
      | "nivel"
      | "dataNascimento"
      | "observacoesInternas"
      | "contatoEmergenciaNome"
      | "contatoEmergenciaTelefone",
      string[]
    >
  >;
}

export const initialAthleteOperationalActionState: AthleteOperationalActionState =
  {};
