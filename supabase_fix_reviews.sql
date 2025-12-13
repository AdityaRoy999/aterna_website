
-- Fix Reviews Foreign Key to allow joining with profiles
alter table public.reviews 
  drop constraint if exists reviews_user_id_fkey;

alter table public.reviews
  add constraint reviews_user_id_fkey 
  foreign key (user_id) 
  references public.profiles(id);

-- Enable Realtime for reviews
alter publication supabase_realtime add table public.reviews;
