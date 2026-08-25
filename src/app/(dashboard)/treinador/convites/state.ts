export type InvitationActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email", string[]>>;
  createdLink?: string;
  createdEmail?: string;
};

export const initialInvitationActionState: InvitationActionState = {};
