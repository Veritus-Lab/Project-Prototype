begin;

create or replace function public.create_class_meeting_series(
  target_class_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz,
  target_occurrences integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  aid uuid;
  occurrence integer;
  interval_length interval := interval '7 days';
  inserted_count integer := 0;
begin
  select tm.assessoria_id into aid
    from public.team_members tm
   where tm.profile_id = auth.uid() and tm.status = 'active'
   limit 1;
  if aid is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  if target_occurrences < 1 or target_occurrences > 52 then raise exception using errcode = '22023', message = 'Occurrences must be between 1 and 52'; end if;
  if target_ends_at <= target_starts_at then raise exception using errcode = '22023', message = 'Meeting end must be after start'; end if;
  if not exists (select 1 from public.classes c where c.id = target_class_id and c.assessoria_id = aid and c.active) then raise exception using errcode = '22023', message = 'Class not found'; end if;

  for occurrence in 0..(target_occurrences - 1) loop
    insert into public.class_meetings (assessoria_id, class_id, starts_at, ends_at)
    values (aid, target_class_id, target_starts_at + occurrence * interval_length, target_ends_at + occurrence * interval_length)
    on conflict (class_id, starts_at) do nothing;
    if found then inserted_count := inserted_count + 1; end if;
  end loop;
  return jsonb_build_object('created', inserted_count, 'requested', target_occurrences);
end;
$$;

revoke all on function public.create_class_meeting_series(uuid, timestamptz, timestamptz, integer) from public, anon;
grant execute on function public.create_class_meeting_series(uuid, timestamptz, timestamptz, integer) to authenticated;

commit;
