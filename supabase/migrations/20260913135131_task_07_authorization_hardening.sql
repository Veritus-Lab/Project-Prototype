begin;

-- The RLS policies invoke these helpers as the authenticated database role.
-- They remain outside the Data API's exposed schemas; revoke the default and
-- anonymous grants, then grant only the policy execution role.
revoke all on function private.is_active_team_member(uuid) from public, anon;
revoke all on function private.is_active_socio(uuid) from public, anon;
revoke all on function private.is_student_owner(uuid, uuid) from public, anon;

grant execute on function private.is_active_team_member(uuid) to authenticated;
grant execute on function private.is_active_socio(uuid) to authenticated;
grant execute on function private.is_student_owner(uuid, uuid) to authenticated;

commit;
