export type AcceptTeamInvitationActionState = {
  confirmationRequired?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"token" | "nome" | "email" | "senha", string[]>>;
};

export const initialAcceptTeamInvitationActionState: AcceptTeamInvitationActionState = {};
