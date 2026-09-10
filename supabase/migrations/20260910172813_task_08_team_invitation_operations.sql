begin;
create or replace function public.create_team_invitation(invited_email text, invited_role public.team_member_role, token_hash_input text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; invitation_id uuid;
begin
  select member.assessoria_id into tenant_id from public.team_members member where member.profile_id = auth.uid() and member.role = 'socio' and member.status = 'active';
  if tenant_id is null then raise exception using errcode='42501', message='Only socios may invite team members'; end if;
  if invited_role not in ('socio','professor') or invited_email <> lower(btrim(invited_email)) or position('@' in invited_email) <= 1 then raise exception using errcode='22023', message='Invalid invitation'; end if;
  update public.team_invitations set revoked_at=now() where assessoria_id=tenant_id and email=invited_email and accepted_at is null and revoked_at is null;
  insert into public.team_invitations(assessoria_id,email,role,token_hash,expires_at,created_by_profile_id) values(tenant_id,invited_email,invited_role,token_hash_input,now()+interval '7 days',auth.uid()) returning id into invitation_id;
  return invitation_id;
end; $$;
create or replace function public.revoke_team_invitation(invitation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.team_invitations invitation set revoked_at=now() where invitation.id=invitation_id and invitation.assessoria_id in (select assessoria_id from public.team_members where profile_id=auth.uid() and role='socio' and status='active') and invitation.accepted_at is null;
  if not found then raise exception using errcode='42501', message='Invitation unavailable'; end if;
end; $$;
revoke all on function public.create_team_invitation(text,public.team_member_role,text), public.revoke_team_invitation(uuid) from public,anon;
grant execute on function public.create_team_invitation(text,public.team_member_role,text), public.revoke_team_invitation(uuid) to authenticated;
commit;
