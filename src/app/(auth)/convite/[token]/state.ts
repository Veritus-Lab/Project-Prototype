export type AcceptInvitationActionState = {
  confirmationRequired?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"token" | "nome" | "email" | "senha", string[]>>;
};

export const initialAcceptInvitationActionState: AcceptInvitationActionState = {};
