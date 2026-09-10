begin;

-- Preserve existing access while the legacy identity model is retired.
-- The first legacy trainer in each assessoria becomes its initial sócio;
-- other trainers become professors and therefore cannot access finance.
with ranked_trainers as (
  select
    profile.assessoria_id,
    profile.id as profile_id,
    row_number() over (
      partition by profile.assessoria_id
      order by profile.created_at, profile.id
    ) as trainer_rank
  from public.profiles profile
  where profile.papel = 'treinador'
)
insert into public.team_members (assessoria_id, profile_id, role, status)
select
  ranked.assessoria_id,
  ranked.profile_id,
  case when ranked.trainer_rank = 1 then 'socio'::public.team_member_role else 'professor'::public.team_member_role end,
  'active'::public.team_member_status
from ranked_trainers ranked
on conflict (assessoria_id, profile_id) do nothing;

insert into public.students (assessoria_id, auth_user_id, legacy_atleta_id, name)
select
  profile.assessoria_id,
  profile.id,
  athlete.id,
  profile.nome
from public.profiles profile
join public.atletas athlete
  on athlete.assessoria_id = profile.assessoria_id
 and athlete.id = profile.id
where profile.papel = 'atleta'
on conflict (assessoria_id, legacy_atleta_id) do nothing;

commit;
