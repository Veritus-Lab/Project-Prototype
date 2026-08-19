-- FLERNK initial schema. Forward-only: never edit after this migration is applied.
begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create type public.papel_usuario as enum ('treinador', 'atleta');
create type public.status_convite as enum ('pendente', 'aceito', 'revogado', 'expirado');
create type public.origem_treino as enum ('manual', 'ia', 'importado');

create table public.assessorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 120),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  cor_primaria text,
  cor_secundaria text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key,
  assessoria_id uuid not null,
  nome text not null check (char_length(btrim(nome)) between 2 and 120),
  papel public.papel_usuario not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_id_auth_fkey
    foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_assessoria_fkey
    foreign key (assessoria_id) references public.assessorias (id) on delete cascade,
  constraint profiles_assessoria_id_key unique (assessoria_id, id)
);

create table public.treinadores (
  id uuid primary key,
  assessoria_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treinadores_profile_fkey
    foreign key (assessoria_id, id)
    references public.profiles (assessoria_id, id)
    on delete cascade,
  constraint treinadores_assessoria_id_key unique (assessoria_id, id)
);

create table public.atletas (
  id uuid primary key,
  assessoria_id uuid not null,
  treinador_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint atletas_profile_fkey
    foreign key (assessoria_id, id)
    references public.profiles (assessoria_id, id)
    on delete cascade,
  constraint atletas_treinador_fkey
    foreign key (assessoria_id, treinador_id)
    references public.treinadores (assessoria_id, id)
    on delete set null (treinador_id),
  constraint atletas_assessoria_id_key unique (assessoria_id, id)
);

create table public.convites_atletas (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null,
  treinador_id uuid not null,
  email text not null check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 320
    and position('@' in email) > 1
  ),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  status public.status_convite not null default 'pendente',
  expira_em timestamptz not null,
  usado_em timestamptz,
  revogado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint convites_assessoria_fkey
    foreign key (assessoria_id) references public.assessorias (id) on delete cascade,
  constraint convites_treinador_fkey
    foreign key (assessoria_id, treinador_id)
    references public.treinadores (assessoria_id, id)
    on delete cascade,
  constraint convites_expiracao_check check (expira_em > created_at),
  constraint convites_estado_check check (
    (status = 'pendente' and usado_em is null and revogado_em is null)
    or (status = 'aceito' and usado_em is not null and revogado_em is null)
    or (status = 'revogado' and usado_em is null and revogado_em is not null)
    or (status = 'expirado' and usado_em is null and revogado_em is null)
  )
);

create table public.treinos (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null,
  treinador_id uuid not null,
  titulo text not null check (char_length(btrim(titulo)) between 2 and 160),
  descricao text,
  origem public.origem_treino not null default 'manual',
  estrutura jsonb not null default '{"blocos":[]}'::jsonb check (jsonb_typeof(estrutura) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treinos_assessoria_fkey
    foreign key (assessoria_id) references public.assessorias (id) on delete cascade,
  constraint treinos_treinador_fkey
    foreign key (assessoria_id, treinador_id)
    references public.treinadores (assessoria_id, id)
    on delete cascade,
  constraint treinos_assessoria_id_key unique (assessoria_id, id)
);

create table public.treinos_atletas (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null,
  treino_id uuid not null,
  atleta_id uuid not null,
  status text not null default 'atribuido' check (status in ('atribuido', 'em_andamento', 'concluido', 'cancelado')),
  atribuido_em timestamptz not null default now(),
  iniciado_em timestamptz,
  concluido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treinos_atletas_treino_fkey
    foreign key (assessoria_id, treino_id)
    references public.treinos (assessoria_id, id)
    on delete cascade,
  constraint treinos_atletas_atleta_fkey
    foreign key (assessoria_id, atleta_id)
    references public.atletas (assessoria_id, id)
    on delete cascade,
  constraint treinos_atletas_treino_atleta_key unique (treino_id, atleta_id),
  constraint treinos_atletas_datas_check check (
    (iniciado_em is null or iniciado_em >= atribuido_em)
    and (concluido_em is null or concluido_em >= coalesce(iniciado_em, atribuido_em))
    and (status <> 'concluido' or concluido_em is not null)
  )
);

-- Composite tenant-first indexes support foreign keys, RLS predicates and dashboards.
create index profiles_assessoria_papel_idx
  on public.profiles (assessoria_id, papel, id);
create index treinadores_assessoria_idx
  on public.treinadores (assessoria_id, id);
create index atletas_assessoria_treinador_idx
  on public.atletas (assessoria_id, treinador_id, id);
create index convites_assessoria_treinador_status_idx
  on public.convites_atletas (assessoria_id, treinador_id, status);
create index convites_assessoria_email_idx
  on public.convites_atletas (assessoria_id, email);
create index convites_status_expira_em_idx
  on public.convites_atletas (status, expira_em);
create index treinos_assessoria_treinador_created_idx
  on public.treinos (assessoria_id, treinador_id, created_at desc);
create index treinos_atletas_assessoria_atleta_status_idx
  on public.treinos_atletas (assessoria_id, atleta_id, status);
create index treinos_atletas_assessoria_treino_atleta_idx
  on public.treinos_atletas (assessoria_id, treino_id, atleta_id);

create function private.current_assessoria_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.assessoria_id
  from public.profiles as profile
  where profile.id = (select auth.uid())
$$;

create function private.is_treinador(tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.assessoria_id = tenant_id
        and profile.papel = 'treinador'
    ),
    false
  )
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create function private.enforce_convite_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> new.status then
    if old.status <> 'pendente' then
      raise exception using errcode = '22023', message = 'estado final do convite e imutavel';
    end if;

    if new.status not in ('aceito', 'revogado', 'expirado') then
      raise exception using errcode = '22023', message = 'transicao de convite invalida';
    end if;
  end if;

  if old.usado_em is not null and new.usado_em is distinct from old.usado_em then
    raise exception using errcode = '22023', message = 'uso do convite e imutavel';
  end if;

  if old.revogado_em is not null and new.revogado_em is distinct from old.revogado_em then
    raise exception using errcode = '22023', message = 'revogacao do convite e imutavel';
  end if;

  return new;
end;
$$;

create function public.bootstrap_treinador()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trainer_name text;
  tenant_name text;
  slug_base text;
  tenant_id uuid;
begin
  if coalesce(new.raw_user_meta_data ->> 'papel', '') <> 'treinador' then
    return new;
  end if;

  trainer_name := pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'nome', ''));
  tenant_name := pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'assessoria_nome', ''));

  if pg_catalog.char_length(trainer_name) not between 2 and 120 then
    raise exception using errcode = '22023', message = 'nome do treinador invalido';
  end if;

  if pg_catalog.char_length(tenant_name) not between 2 and 120 then
    raise exception using errcode = '22023', message = 'nome da assessoria invalido';
  end if;

  if new.email is null or pg_catalog.btrim(new.email) = '' then
    raise exception using errcode = '22023', message = 'email do treinador invalido';
  end if;

  slug_base := pg_catalog.btrim(
    pg_catalog.regexp_replace(pg_catalog.lower(tenant_name), '[^a-z0-9]+', '-', 'g'),
    '-'
  );

  if slug_base = '' then
    slug_base := 'assessoria';
  end if;

  insert into public.assessorias (nome, slug)
  values (tenant_name, pg_catalog.left(slug_base, 80) || '-' || new.id::text)
  returning id into tenant_id;

  insert into public.profiles (id, assessoria_id, nome, papel)
  values (new.id, tenant_id, trainer_name, 'treinador');

  insert into public.treinadores (id, assessoria_id)
  values (new.id, tenant_id);

  return new;
end;
$$;

create function public.validar_convite(hash text)
returns table (
  email_mascarado text,
  assessoria_nome text,
  estado text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  invitation_email text;
  invitation_status public.status_convite;
  expires_at timestamptz;
  used_at timestamptz;
  revoked_at timestamptz;
  local_part text;
  domain_part text;
begin
  if hash is null or pg_catalog.btrim(hash) = '' then
    email_mascarado := null;
    assessoria_nome := null;
    estado := 'invalido';
    return next;
    return;
  end if;

  select invitation.email,
         tenant.nome,
         invitation.status,
         invitation.expira_em,
         invitation.usado_em,
         invitation.revogado_em
  into invitation_email,
       assessoria_nome,
       invitation_status,
       expires_at,
       used_at,
       revoked_at
  from public.convites_atletas as invitation
  join public.assessorias as tenant on tenant.id = invitation.assessoria_id
  where invitation.token_hash = hash;

  if not found then
    email_mascarado := null;
    assessoria_nome := null;
    estado := 'invalido';
    return next;
    return;
  end if;

  local_part := pg_catalog.split_part(invitation_email, '@', 1);
  domain_part := pg_catalog.split_part(invitation_email, '@', 2);
  email_mascarado := case
    when pg_catalog.char_length(local_part) <= 1 then '*@' || domain_part
    when pg_catalog.char_length(local_part) = 2 then pg_catalog.left(local_part, 1) || '*@' || domain_part
    else pg_catalog.left(local_part, 1)
      || pg_catalog.repeat('*', pg_catalog.char_length(local_part) - 2)
      || pg_catalog.right(local_part, 1)
      || '@'
      || domain_part
  end;

  estado := case
    when invitation_status = 'revogado' or revoked_at is not null then 'revogado'
    when invitation_status = 'aceito' or used_at is not null then 'aceito'
    when invitation_status = 'expirado' or expires_at <= statement_timestamp() then 'expirado'
    else 'pendente'
  end;

  return next;
end;
$$;

create function public.aceitar_convite(hash text, user_id uuid, nome text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  invitation public.convites_atletas%rowtype;
  authenticated_email text;
  athlete_name text;
begin
  if authenticated_user_id is null or authenticated_user_id <> user_id then
    raise exception using errcode = '42501', message = 'sessao nao corresponde ao usuario';
  end if;

  if hash is null or pg_catalog.btrim(hash) = '' then
    raise exception using errcode = '22023', message = 'convite invalido';
  end if;

  athlete_name := pg_catalog.btrim(coalesce(nome, ''));
  if pg_catalog.char_length(athlete_name) not between 2 and 120 then
    raise exception using errcode = '22023', message = 'nome do atleta invalido';
  end if;

  select invitation_row.*
  into invitation
  from public.convites_atletas as invitation_row
  where invitation_row.token_hash = hash
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'convite invalido';
  end if;

  if invitation.status = 'revogado' or invitation.revogado_em is not null then
    raise exception using errcode = '22023', message = 'convite revogado';
  end if;

  if invitation.status = 'aceito' or invitation.usado_em is not null then
    raise exception using errcode = '22023', message = 'convite ja utilizado';
  end if;

  if invitation.status = 'expirado' or invitation.expira_em <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'convite expirado';
  end if;

  select pg_catalog.lower(pg_catalog.btrim(auth_user.email))
  into authenticated_email
  from auth.users as auth_user
  where auth_user.id = authenticated_user_id;

  if authenticated_email is null
     or authenticated_email <> pg_catalog.lower(invitation.email) then
    raise exception using errcode = '42501', message = 'email nao corresponde ao convite';
  end if;

  if exists (select 1 from public.profiles as profile where profile.id = authenticated_user_id) then
    raise exception using errcode = '23505', message = 'usuario ja possui perfil';
  end if;

  insert into public.profiles (id, assessoria_id, nome, papel)
  values (authenticated_user_id, invitation.assessoria_id, athlete_name, 'atleta');

  insert into public.atletas (id, assessoria_id, treinador_id)
  values (authenticated_user_id, invitation.assessoria_id, invitation.treinador_id);

  update public.convites_atletas
  set status = 'aceito',
      usado_em = statement_timestamp()
  where id = invitation.id;
end;
$$;

create trigger set_assessorias_updated_at
before update on public.assessorias
for each row execute function private.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger set_treinadores_updated_at
before update on public.treinadores
for each row execute function private.set_updated_at();

create trigger set_atletas_updated_at
before update on public.atletas
for each row execute function private.set_updated_at();

create trigger enforce_convites_transition
before update on public.convites_atletas
for each row execute function private.enforce_convite_transition();

create trigger set_convites_updated_at
before update on public.convites_atletas
for each row execute function private.set_updated_at();

create trigger set_treinos_updated_at
before update on public.treinos
for each row execute function private.set_updated_at();

create trigger set_treinos_atletas_updated_at
before update on public.treinos_atletas
for each row execute function private.set_updated_at();

create trigger on_auth_user_created_bootstrap_treinador
after insert on auth.users
for each row execute function public.bootstrap_treinador();

alter table public.assessorias enable row level security;
alter table public.assessorias force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.treinadores enable row level security;
alter table public.treinadores force row level security;
alter table public.atletas enable row level security;
alter table public.atletas force row level security;
alter table public.convites_atletas enable row level security;
alter table public.convites_atletas force row level security;
alter table public.treinos enable row level security;
alter table public.treinos force row level security;
alter table public.treinos_atletas enable row level security;
alter table public.treinos_atletas force row level security;

create policy assessorias_select_tenant
on public.assessorias
for select
to authenticated
using (id = private.current_assessoria_id());

create policy assessorias_update_trainer
on public.assessorias
for update
to authenticated
using (private.is_treinador(id))
with check (private.is_treinador(id));

create policy profiles_select_own_or_trainer
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_treinador(assessoria_id)
);

create policy profiles_update_own_or_trainer
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or private.is_treinador(assessoria_id)
)
with check (
  id = (select auth.uid())
  or private.is_treinador(assessoria_id)
);

create policy treinadores_select_tenant_trainers
on public.treinadores
for select
to authenticated
using (private.is_treinador(assessoria_id));

create policy atletas_select_own_or_trainer
on public.atletas
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_treinador(assessoria_id)
);

create policy atletas_update_trainer
on public.atletas
for update
to authenticated
using (private.is_treinador(assessoria_id))
with check (private.is_treinador(assessoria_id));

create policy convites_select_trainer
on public.convites_atletas
for select
to authenticated
using (private.is_treinador(assessoria_id));

create policy convites_insert_trainer
on public.convites_atletas
for insert
to authenticated
with check (
  treinador_id = (select auth.uid())
  and private.is_treinador(assessoria_id)
  and status = 'pendente'
  and usado_em is null
  and revogado_em is null
);

create policy convites_update_trainer
on public.convites_atletas
for update
to authenticated
using (private.is_treinador(assessoria_id))
with check (
  private.is_treinador(assessoria_id)
  and status in ('pendente', 'revogado')
);

create policy treinos_select_trainer_or_assigned_athlete
on public.treinos
for select
to authenticated
using (
  private.is_treinador(assessoria_id)
  or exists (
    select 1
    from public.treinos_atletas as assignment
    where assignment.assessoria_id = treinos.assessoria_id
      and assignment.treino_id = treinos.id
      and assignment.atleta_id = (select auth.uid())
  )
);

create policy treinos_insert_trainer
on public.treinos
for insert
to authenticated
with check (
  treinador_id = (select auth.uid())
  and private.is_treinador(assessoria_id)
);

create policy treinos_update_trainer
on public.treinos
for update
to authenticated
using (private.is_treinador(assessoria_id))
with check (private.is_treinador(assessoria_id));

create policy treinos_delete_trainer
on public.treinos
for delete
to authenticated
using (private.is_treinador(assessoria_id));

create policy treinos_atletas_select_own_or_trainer
on public.treinos_atletas
for select
to authenticated
using (
  atleta_id = (select auth.uid())
  or private.is_treinador(assessoria_id)
);

create policy treinos_atletas_insert_trainer
on public.treinos_atletas
for insert
to authenticated
with check (private.is_treinador(assessoria_id));

create policy treinos_atletas_update_own_or_trainer
on public.treinos_atletas
for update
to authenticated
using (
  atleta_id = (select auth.uid())
  or private.is_treinador(assessoria_id)
)
with check (
  atleta_id = (select auth.uid())
  or private.is_treinador(assessoria_id)
);

create policy treinos_atletas_delete_trainer
on public.treinos_atletas
for delete
to authenticated
using (private.is_treinador(assessoria_id));

revoke all on table public.assessorias from public, anon, authenticated;
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.treinadores from public, anon, authenticated;
revoke all on table public.atletas from public, anon, authenticated;
revoke all on table public.convites_atletas from public, anon, authenticated;
revoke all on table public.treinos from public, anon, authenticated;
revoke all on table public.treinos_atletas from public, anon, authenticated;

grant select on table public.assessorias to authenticated;
grant update (nome, logo_url, cor_primaria, cor_secundaria) on table public.assessorias to authenticated;
grant select on table public.profiles to authenticated;
grant update (nome) on table public.profiles to authenticated;
grant select on table public.treinadores to authenticated;
grant select on table public.atletas to authenticated;
grant update (treinador_id) on table public.atletas to authenticated;

-- token_hash can be inserted by trusted server code but can never be selected by a client role.
grant select (
  id,
  assessoria_id,
  treinador_id,
  email,
  status,
  expira_em,
  usado_em,
  revogado_em,
  created_at,
  updated_at
) on table public.convites_atletas to authenticated;
grant insert (
  assessoria_id,
  treinador_id,
  email,
  token_hash,
  expira_em
) on table public.convites_atletas to authenticated;
grant update (status, revogado_em) on table public.convites_atletas to authenticated;

grant select on table public.treinos to authenticated;
grant insert (assessoria_id, treinador_id, titulo, descricao, origem, estrutura)
  on table public.treinos to authenticated;
grant update (titulo, descricao, origem, estrutura)
  on table public.treinos to authenticated;
grant delete on table public.treinos to authenticated;

grant select on table public.treinos_atletas to authenticated;
grant insert (assessoria_id, treino_id, atleta_id, status, atribuido_em)
  on table public.treinos_atletas to authenticated;
grant update (status, iniciado_em, concluido_em)
  on table public.treinos_atletas to authenticated;
grant delete on table public.treinos_atletas to authenticated;

revoke all on function private.current_assessoria_id() from public, anon, authenticated;
revoke all on function private.is_treinador(uuid) from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.enforce_convite_transition() from public, anon, authenticated;
revoke all on function public.bootstrap_treinador() from public, anon, authenticated;
revoke all on function public.validar_convite(text) from public, anon, authenticated;
revoke all on function public.aceitar_convite(text, uuid, text) from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.current_assessoria_id() to authenticated;
grant execute on function private.is_treinador(uuid) to authenticated;
grant execute on function public.validar_convite(text) to anon, authenticated;
grant execute on function public.aceitar_convite(text, uuid, text) to authenticated;

commit;
