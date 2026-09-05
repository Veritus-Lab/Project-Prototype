import "server-only";

import { Resend } from "resend";

let client: Resend | undefined;

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey?.startsWith("re_")) {
    throw new Error("O envio de e-mails não está configurado.");
  }

  client ??= new Resend(apiKey);

  return client;
}
