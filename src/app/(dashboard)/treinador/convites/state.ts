export type InvitationActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email", string[]>>;
  createdEmail?: string;
};

export const initialInvitationActionState: InvitationActionState = {};
