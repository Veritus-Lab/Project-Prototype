export type AcceptInvitationActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"token" | "nome" | "email" | "senha", string[]>>;
};

export const initialAcceptInvitationActionState: AcceptInvitationActionState = {};
