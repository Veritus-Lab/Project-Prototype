begin;

-- No public payload may create an assessoria or elevate a user to team member.
drop trigger if exists on_auth_user_created_bootstrap_treinador on auth.users;

revoke all on function public.bootstrap_treinador() from public, anon, authenticated;

commit;
