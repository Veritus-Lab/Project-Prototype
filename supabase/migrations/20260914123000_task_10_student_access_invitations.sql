begin;

create table public.student_invitations (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null references public.assessorias(id) on delete restrict,
  student_id uuid not null,
  email text not null check (email = lower(btrim(email)) and position('@' in email) > 1),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assessoria_id, id),
  foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  check (accepted_at is null or revoked_at is null)
);

create unique index student_invitations_one_active_student_idx
  on public.student_invitations(student_id)
  where accepted_at is null and revoked_at is null;

alter table public.student_invitations enable row level security;
alter table public.student_invitations force row level security;
revoke all on public.student_invitations from public, anon, authenticated;

create or replace function public.create_student_invitation(target_student_id uuid, token_hash_input text)
returns uuid
language plpgsql security definer set search_path = public, private, extensions
as $$
declare tenant_id uuid; invite_id uuid; student_email text;
begin
  select assessoria_id into tenant_id from public.team_members
    where profile_id = auth.uid() and role = 'socio' and status = 'active';
  if tenant_id is null then raise exception using errcode = '42501', message = 'Only socios may invite students'; end if;
  select email into student_email from public.students
    where id = target_student_id and assessoria_id = tenant_id and auth_user_id is null;
  if student_email is null then raise exception using errcode = '22023', message = 'Student requires an unlinked email'; end if;
  update public.student_invitations set revoked_at = now()
    where student_id = target_student_id and accepted_at is null and revoked_at is null;
  insert into public.student_invitations(assessoria_id, student_id, email, token_hash, expires_at, created_by_profile_id)
    values(tenant_id, target_student_id, student_email, token_hash_input, now() + interval '7 days', auth.uid())
    returning id into invite_id;
  return invite_id;
end;
$$;

create or replace function public.accept_student_invitation(invitation_token text)
returns void
language plpgsql security definer set search_path = public, private, extensions
as $$
declare invitation public.student_invitations%rowtype; current_email text; current_user_id uuid := auth.uid(); student_name text; profile_assessoria uuid;
begin
  select lower(email) into current_email from auth.users where id = current_user_id and email_confirmed_at is not null;
  if current_user_id is null or current_email is null then raise exception using errcode = '42501', message = 'Confirmed account required'; end if;
  select * into invitation from public.student_invitations
    where token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
      and accepted_at is null and revoked_at is null and expires_at > now()
    for update;
  if not found or current_email <> invitation.email then raise exception using errcode = '42501', message = 'Invalid student invitation'; end if;
  if exists (select 1 from public.students where auth_user_id = current_user_id and id <> invitation.student_id) then
    raise exception using errcode = '23505', message = 'Account already linked to another student';
  end if;
  select name into student_name from public.students where id = invitation.student_id and assessoria_id = invitation.assessoria_id;
  if student_name is null then raise exception using errcode = '22023', message = 'Student unavailable'; end if;
  select assessoria_id into profile_assessoria from public.profiles where id = current_user_id;
  if profile_assessoria is not null and profile_assessoria <> invitation.assessoria_id then
    raise exception using errcode = '42501', message = 'Account belongs to another assessoria';
  end if;
  insert into public.profiles(id, assessoria_id, nome, papel)
    values(current_user_id, invitation.assessoria_id, student_name, 'atleta')
    on conflict (id) do nothing;
  update public.students set auth_user_id = current_user_id
    where id = invitation.student_id and assessoria_id = invitation.assessoria_id and auth_user_id is null;
  if not found then raise exception using errcode = '23505', message = 'Student already linked'; end if;
  update public.student_invitations set accepted_at = now() where id = invitation.id;
end;
$$;

revoke all on function public.create_student_invitation(uuid, text), public.accept_student_invitation(text) from public, anon;
grant execute on function public.create_student_invitation(uuid, text), public.accept_student_invitation(text) to authenticated;

commit;
