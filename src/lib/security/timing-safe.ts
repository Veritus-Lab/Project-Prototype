import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compara dois segredos (ex: tokens de webhook, chaves de API, senhas)
 * em tempo constante para neutralizar ataques de temporização (timing attacks).
 *
 * Utiliza SHA-256 sobre ambos os operandos para garantir que os buffers
 * comparados tenham exatamente o mesmo tamanho (32 bytes), evitando que a
 * checagem de comprimento vaze informações sobre o segredo esperado.
 */
export function timingSafeStringEqual(
  received: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (
    typeof received !== "string" ||
    typeof expected !== "string" ||
    received.length === 0 ||
    expected.length === 0
  ) {
    return false;
  }

  const hashReceived = createHash("sha256").update(received).digest();
  const hashExpected = createHash("sha256").update(expected).digest();

  return timingSafeEqual(hashReceived, hashExpected);
}
