import { createHash, randomBytes } from "node:crypto";

import type { Database } from "@/types/database";

export type InvitationStatus = Database["public"]["Enums"]["status_convite"];
export type InvitationState = "active" | "expired" | "used" | "revoked";

export interface InvitationStateInput {
  status: InvitationStatus;
  expira_em: string;
  usado_em?: string | null;
  revogado_em?: string | null;
}

const invitationLifetimeMs = 7 * 24 * 60 * 60 * 1000;

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationToken() {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    hash: hashInvitationToken(token),
  };
}

export function invitationExpiresAt(createdAt = new Date()) {
  return new Date(createdAt.getTime() + invitationLifetimeMs);
}

export function getInvitationState(
  invite: InvitationStateInput,
  now = new Date(),
): InvitationState {
  if (invite.status === "aceito" || invite.usado_em) {
    return "used";
  }

  if (invite.status === "revogado" || invite.revogado_em) {
    return "revoked";
  }

  if (invite.status === "expirado" || new Date(invite.expira_em) <= now) {
    return "expired";
  }

  return "active";
}
