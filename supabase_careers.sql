-- Create job_applications table
create table if not exists public.job_applications (
  id uuid default uuid_generate_v4() primary key,
  job_title text not null,
  full_name text not null,
  email text not null,
  phone text,
  linkedin_url text,
  resume_url text,
  answers jsonb, -- Store role-specific answers here
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.job_applications enable row level security;

-- Allow anyone to insert job applications
create policy "Anyone can insert job applications" on job_applications
  for insert with check (true);

-- Storage for Resumes
-- Note: You might need to create the 'resumes' bucket in the Supabase Dashboard if this SQL doesn't work due to permissions.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Allow anyone to upload to the resumes bucket
create policy "Anyone can upload resumes"
on storage.objects for insert
with check ( bucket_id = 'resumes' );

-- Allow anyone to read their own resume (technically difficult without auth, so we might keep it private or allow public read if needed, but for privacy, let's keep it private and only allow insert for now. Admins can view via dashboard).
