begin;

grant delete on table public.convites_atletas to authenticated;

create policy convites_delete_trainer
on public.convites_atletas
for delete
to authenticated
using (
  treinador_id = (select auth.uid())
  and private.is_treinador(assessoria_id)
);

commit;
