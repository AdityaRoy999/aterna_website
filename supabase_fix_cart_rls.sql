-- Fix RLS policies for cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to VIEW their own cart
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
CREATE POLICY "Users can view their own cart" ON public.cart_items
FOR SELECT USING (auth.uid() = user_id);

-- 2. Allow users to INSERT items into their own cart
DROP POLICY IF EXISTS "Users can insert their own cart" ON public.cart_items;
CREATE POLICY "Users can insert their own cart" ON public.cart_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to UPDATE their own cart items
DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart_items;
CREATE POLICY "Users can update their own cart" ON public.cart_items
FOR UPDATE USING (auth.uid() = user_id);

-- 4. Allow users to DELETE items from their own cart
DROP POLICY IF EXISTS "Users can delete their own cart" ON public.cart_items;
CREATE POLICY "Users can delete their own cart" ON public.cart_items
FOR DELETE USING (auth.uid() = user_id);

-- 5. Allow Service Role (Bot) to do everything
DROP POLICY IF EXISTS "Service role full access" ON public.cart_items;
CREATE POLICY "Service role full access" ON public.cart_items
FOR ALL USING (true) WITH CHECK (true);
