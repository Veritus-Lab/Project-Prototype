export type LoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "senha", string[]>>;
};

export const initialLoginActionState: LoginActionState = {};
