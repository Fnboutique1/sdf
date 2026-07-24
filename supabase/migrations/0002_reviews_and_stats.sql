-- Run this after 0001_purchases.sql (Supabase Dashboard -> SQL Editor,
-- or `supabase db push`).
--
-- Adds real, verified reviews + a public stats function so the site never
-- has to show fake review counts or fake enrollment numbers again.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  unique (course_id, user_id) -- one review per student per course
);

alter table public.reviews enable row level security;

-- Anyone (including logged-out visitors) can read reviews — they're
-- meant to be shown publicly on the course page.
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

-- A student can only insert a review as themselves, and only if they have
-- a completed (paid) purchase for that exact course. This is the real,
-- server-enforced gate — the UI check in the app is just a courtesy.
create policy "Verified buyers can insert their own review"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.purchases p
      where p.user_id = auth.uid()
        and p.course_id = reviews.course_id
        and p.status = 'paid'
    )
  );

-- Students can update/delete only their own review.
create policy "Students can update their own review"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Students can delete their own review"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Public stats function: real enrolled-student count (distinct paid
-- purchasers) + real average rating + real review count for a course.
-- SECURITY DEFINER is required here because "students enrolled" must
-- aggregate across ALL students' purchases, which the purchases table's
-- own RLS (each student sees only their own row) would otherwise block.
-- Only aggregate numbers are ever returned — no purchase or personal
-- details are exposed by this function.
create or replace function public.get_course_public_stats(p_course_id text)
returns table (
  students_enrolled bigint,
  avg_rating numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(distinct user_id) from public.purchases
       where course_id = p_course_id and status = 'paid') as students_enrolled,
    coalesce((select avg(rating)::numeric(3,2) from public.reviews
       where course_id = p_course_id), 0) as avg_rating,
    (select count(*) from public.reviews
       where course_id = p_course_id) as review_count;
$$;

revoke all on function public.get_course_public_stats(text) from public;
grant execute on function public.get_course_public_stats(text) to anon, authenticated;
