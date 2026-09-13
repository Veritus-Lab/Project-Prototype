begin;

revoke all on function private.is_active_team_member(uuid) from public, anon, authenticated;
revoke all on function private.is_active_socio(uuid) from public, anon, authenticated;
revoke all on function private.is_student_owner(uuid, uuid) from public, anon, authenticated;

commit;
