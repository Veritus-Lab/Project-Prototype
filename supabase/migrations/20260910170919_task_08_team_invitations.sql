begin;

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null references public.assessorias(id) on delete restrict,
  email text not null check (email = lower(btrim(email)) and position('@' in email) > 1),
  role public.team_member_role not null,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (expires_at > created_at),
  check (not (accepted_at is not null and revoked_at is not null))
);

create unique index team_invitations_one_active_email_idx
  on public.team_invitations(assessoria_id, email)
  where accepted_at is null and revoked_at is null;

alter table public.team_invitations enable row level security;
alter table public.team_invitations force row level security;
revoke all on public.team_invitations from public, anon, authenticated;

create or replace function private.prevent_last_socio_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'socio' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'socio' or new.status <> 'active')
     and not exists (
       select 1 from public.team_members member
       where member.assessoria_id = old.assessoria_id
         and member.role = 'socio'
         and member.status = 'active'
         and member.id <> old.id
     ) then
    raise exception using errcode = '23514', message = 'A assessoria precisa manter ao menos um sócio ativo';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists prevent_last_socio_removal on public.team_members;
create trigger prevent_last_socio_removal
before update or delete on public.team_members
for each row execute function private.prevent_last_socio_removal();

revoke all on function private.prevent_last_socio_removal() from public, anon, authenticated;

commit;
