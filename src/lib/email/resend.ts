import "server-only";

import { Resend } from "resend";
import { assertExternalEffectAllowed } from "@/lib/environment/external-effects-policy";

let client: Resend | undefined;

export function getResendClient() {
  assertExternalEffectAllowed("email");
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey?.startsWith("re_")) {
    throw new Error("O envio de e-mails não está configurado.");
  }

  client ??= new Resend(apiKey);

  return client;
}
