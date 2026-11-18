alter table public.students add column if not exists user_id uuid;

create unique index if not exists students_user_id_unique on public.students (user_id) where user_id is not null;

comment on column public.students.user_id is 'Account di accesso collegato alla scheda studente; senza chiave esterna verso auth.users.';

create or replace function public.student_has_course(_user_id uuid, _course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.class_students cs on cs.student_id = s.id
    join public.class_courses cc on cc.class_id = cs.class_id
    where s.user_id = _user_id
      and cc.course_id = _course_id
  )
$$;

revoke all on function public.student_has_course(uuid, uuid) from public;
grant execute on function public.student_has_course(uuid, uuid) to authenticated;
grant execute on function public.student_has_course(uuid, uuid) to service_role;

create policy "Students read assigned courses"
on public.courses
for select
to authenticated
using (
  public.has_role(auth.uid(), 'student')
  and public.student_has_course(auth.uid(), id)
);

create policy "Students read assigned chapters"
on public.chapters
for select
to authenticated
using (
  public.has_role(auth.uid(), 'student')
  and public.student_has_course(auth.uid(), course_id)
);