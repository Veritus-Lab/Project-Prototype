import "server-only";

import { createServerClient } from "@/lib/supabase/server";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "dead_letter";

export interface JobRecord<T = Record<string, unknown>> {
  id: string;
  assessoria_id?: string | null;
  type: string;
  payload: T;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  backoff_seconds: number;
  scheduled_at: string;
  locked_at?: string | null;
  locked_by?: string | null;
  error_message?: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnqueueJobInput<T = Record<string, unknown>> {
  type: string;
  payload: T;
  assessoriaId?: string;
  idempotencyKey?: string;
  maxAttempts?: number;
  backoffSeconds?: number;
  delaySeconds?: number;
}

export type JobHandler<T = any> = (payload: T, job: JobRecord<T>) => Promise<void>;

const jobHandlers = new Map<string, JobHandler>();

/**
 * Registra um executor de tarefa assíncrona por tipo de job.
 */
export function registerJobHandler<T = any>(type: string, handler: JobHandler<T>): void {
  jobHandlers.set(type, handler);
}

/**
 * Limpa os handlers registrados (para isolamento em testes).
 */
export function clearJobHandlers(): void {
  jobHandlers.clear();
}

/**
 * Estrutura em memória para fallback em testes ou ambiente sem conexão remota ao Supabase.
 */
const inMemoryQueue: JobRecord[] = [];

export function getInMemoryQueue(): readonly JobRecord[] {
  return inMemoryQueue;
}

export function clearInMemoryQueue(): void {
  inMemoryQueue.length = 0;
}

/**
 * Enfileira um novo job na fila transacional com suporte a idempotência e agendamento.
 */
export async function enqueueJob<T extends Record<string, unknown>>(
  input: EnqueueJobInput<T>,
): Promise<{ success: boolean; jobId?: string; duplicate?: boolean; error?: string }> {
  const now = new Date();
  const scheduledAt = input.delaySeconds
    ? new Date(now.getTime() + input.delaySeconds * 1000).toISOString()
    : now.toISOString();

  const maxAttempts = input.maxAttempts ?? 5;
  const backoffSeconds = input.backoffSeconds ?? 30;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("job_queue")
      .insert({
        assessoria_id: input.assessoriaId ?? null,
        type: input.type,
        payload: input.payload,
        status: "pending",
        attempts: 0,
        max_attempts: maxAttempts,
        backoff_seconds: backoffSeconds,
        scheduled_at: scheduledAt,
        idempotency_key: input.idempotencyKey ?? null,
      } as never)
      .select("id")
      .maybeSingle();

    if (error) {
      // 23505: violação de unicidade da chave de idempotência no PostgreSQL
      if (error.code === "23505") {
        return { success: true, duplicate: true };
      }
      throw error;
    }

    const row = data as { id: string } | null;
    return { success: true, jobId: row?.id };
  } catch {
    // Fallback in-memory para testes unitários ou quando a tabela local não estiver instanciada
    if (input.idempotencyKey && inMemoryQueue.some((j) => j.idempotency_key === input.idempotencyKey)) {
      return { success: true, duplicate: true };
    }

    const localJob: JobRecord<T> = {
      id: `local-job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assessoria_id: input.assessoriaId ?? null,
      type: input.type,
      payload: input.payload,
      status: "pending",
      attempts: 0,
      max_attempts: maxAttempts,
      backoff_seconds: backoffSeconds,
      scheduled_at: scheduledAt,
      idempotency_key: input.idempotencyKey ?? null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    inMemoryQueue.push(localJob as JobRecord);
    return { success: true, jobId: localJob.id };
  }
}

/**
 * Processa a próxima leva de jobs pendentes respeitando concorrência e retentativas com backoff.
 */
export async function processNextJobs(
  limit = 10,
  workerIdentifier = `worker-${process.pid || "main"}`,
): Promise<{ processed: number; successes: number; failures: number }> {
  let jobsToProcess: JobRecord[] = [];
  let isDbBacked = false;

  try {
    const supabase = await createServerClient();
    // Tenta chamar a RPC atômica com SKIP LOCKED
    const { data, error } = await supabase.rpc("dequeue_jobs", {
      p_limit: limit,
      p_lock_identifier: workerIdentifier,
      p_lock_timeout_seconds: 300,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      jobsToProcess = data as JobRecord[];
      isDbBacked = true;
    }
  } catch {
    // Continua para o fallback em memória
  }

  // Fallback para fila em memória (testes)
  if (!isDbBacked) {
    const nowIso = new Date().toISOString();
    jobsToProcess = inMemoryQueue
      .filter((j) => (j.status === "pending" || j.status === "processing") && j.scheduled_at <= nowIso)
      .slice(0, limit);

    for (const j of jobsToProcess) {
      j.status = "processing";
      j.attempts += 1;
      j.locked_at = nowIso;
      j.locked_by = workerIdentifier;
    }
  }

  let successes = 0;
  let failures = 0;

  for (const job of jobsToProcess) {
    const handler = jobHandlers.get(job.type);

    if (!handler) {
      await markJobFailed(
        job,
        `Nenhum handler registrado para o tipo '${job.type}'`,
        isDbBacked,
      );
      failures++;
      continue;
    }

    try {
      await handler(job.payload, job);
      await markJobCompleted(job, isDbBacked);
      successes++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await markJobFailed(job, errorMsg, isDbBacked);
      failures++;
    }
  }

  return {
    processed: jobsToProcess.length,
    successes,
    failures,
  };
}

async function markJobCompleted(job: JobRecord, isDbBacked: boolean) {
  const now = new Date().toISOString();
  job.status = "completed";
  job.updated_at = now;
  job.locked_at = null;

  if (isDbBacked) {
    try {
      const supabase = await createServerClient();
      await supabase
        .from("job_queue")
        .update({
          status: "completed",
          updated_at: now,
          locked_at: null,
          locked_by: null,
        } as never)
        .eq("id", job.id);
    } catch {
      // Falhas de atualização em job concluído são toleradas
    }
  }
}

async function markJobFailed(job: JobRecord, errorMessage: string, isDbBacked: boolean) {
  const now = new Date();
  const willRetry = job.attempts < job.max_attempts;
  const newStatus: JobStatus = willRetry ? "pending" : "dead_letter";

  // Backoff exponencial: backoff_seconds * 2^(attempts - 1)
  const backoffMs = job.backoff_seconds * Math.pow(2, Math.max(0, job.attempts - 1)) * 1000;
  const nextScheduledAt = new Date(now.getTime() + backoffMs).toISOString();

  job.status = newStatus;
  job.error_message = errorMessage;
  job.scheduled_at = nextScheduledAt;
  job.updated_at = now.toISOString();
  job.locked_at = null;

  if (isDbBacked) {
    try {
      const supabase = await createServerClient();
      await supabase
        .from("job_queue")
        .update({
          status: newStatus,
          error_message: errorMessage,
          scheduled_at: nextScheduledAt,
          updated_at: now.toISOString(),
          locked_at: null,
          locked_by: null,
        } as never)
        .eq("id", job.id);
    } catch {
      // Ignora erro de persistência em logging
    }
  }
}
