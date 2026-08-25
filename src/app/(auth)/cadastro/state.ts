export type SignupActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"nome" | "assessoria" | "email" | "senha", string[]>>;
};

export const initialSignupActionState: SignupActionState = {};
