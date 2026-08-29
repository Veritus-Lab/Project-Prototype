-- The server includes the optional catalog reference when creating a training.
-- RLS remains the authorization boundary for the authenticated trainer.
grant insert (tipo_treino_id) on table public.treinos to authenticated;
