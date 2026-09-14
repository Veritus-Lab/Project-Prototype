begin;

create or replace function private.prevent_last_socio_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'socio' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'socio' or new.status <> 'active') then
    -- All changes to active partners of the same assessoria serialize here.
    -- Without this transaction lock, two concurrent removals could each see
    -- the other partner and leave the tenant with no active socio.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(old.assessoria_id::text, 0)
    );

    if not exists (
      select 1 from public.team_members member
      where member.assessoria_id = old.assessoria_id
        and member.role = 'socio'
        and member.status = 'active'
        and member.id <> old.id
    ) then
      raise exception using errcode = '23514', message = 'A assessoria precisa manter ao menos um sócio ativo';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.accept_team_invitation(invitation_token text, member_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.team_invitations%rowtype;
  current_user_id uuid := auth.uid();
  current_email text;
  current_email_confirmed_at timestamptz;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select lower(email), email_confirmed_at
    into current_email, current_email_confirmed_at
    from auth.users
   where id = current_user_id;

  if current_email_confirmed_at is null then
    raise exception using errcode = '42501', message = 'Invitation email is not confirmed';
  end if;

  select * into invitation from public.team_invitations
   where token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
   for update;
  if not found or invitation.accepted_at is not null or invitation.revoked_at is not null or invitation.expires_at <= now() then
    raise exception using errcode = '22023', message = 'Invalid team invitation';
  end if;
  if current_email <> invitation.email then
    raise exception using errcode = '42501', message = 'Invitation email mismatch';
  end if;
  if exists (select 1 from public.profiles where id = current_user_id) then
    raise exception using errcode = '23505', message = 'Account already configured';
  end if;

  insert into public.profiles (id, assessoria_id, nome, papel)
  values (current_user_id, invitation.assessoria_id, btrim(member_name), 'treinador');
  insert into public.team_members (assessoria_id, profile_id, role, status)
  values (invitation.assessoria_id, current_user_id, invitation.role, 'active');
  update public.team_invitations set accepted_at = now() where id = invitation.id;
end;
$$;

revoke all on function private.prevent_last_socio_removal() from public, anon, authenticated;
revoke all on function public.accept_team_invitation(text, text) from public, anon;
grant execute on function public.accept_team_invitation(text, text) to authenticated;

commit;
