begin;

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
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  select lower(email) into current_email from auth.users where id = current_user_id;
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

revoke all on function public.accept_team_invitation(text, text) from public, anon;
grant execute on function public.accept_team_invitation(text, text) to authenticated;

commit;
