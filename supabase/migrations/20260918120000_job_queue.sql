-- Migration: 20260918120000_job_queue.sql
-- Descrição: Tabela transacional e RPC de fila para background jobs, webhooks e e-mails resilientes.

CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessoria_id UUID REFERENCES public.assessorias(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead_letter')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  backoff_seconds INT NOT NULL DEFAULT 30,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  error_message TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_queue_status_scheduled
  ON public.job_queue (status, scheduled_at)
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_job_queue_assessoria
  ON public.job_queue (assessoria_id);

-- RLS: Apenas acessível pelo servidor/backend (service_role ou funções internas)
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_queue_access_restricted"
  ON public.job_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RPC para desenfileirar jobs atômica e seguramente usando SKIP LOCKED
CREATE OR REPLACE FUNCTION public.dequeue_jobs(
  p_limit INT DEFAULT 10,
  p_lock_identifier TEXT DEFAULT 'worker-default',
  p_lock_timeout_seconds INT DEFAULT 300
)
RETURNS SETOF public.job_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH available_jobs AS (
    SELECT id
    FROM public.job_queue
    WHERE (
      status = 'pending' AND scheduled_at <= now()
    ) OR (
      status = 'processing' AND locked_at < now() - (p_lock_timeout_seconds || ' seconds')::interval
    )
    ORDER BY scheduled_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.job_queue q
  SET
    status = 'processing',
    attempts = q.attempts + 1,
    locked_at = now(),
    locked_by = p_lock_identifier,
    updated_at = now()
  FROM available_jobs a
  WHERE q.id = a.id
  RETURNING q.*;
END;
$$;
