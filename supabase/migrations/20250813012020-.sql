-- Secure RLS by removing overly broad policies that allow any authenticated user to access all data

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Drop permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to select categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON public.categories;
DROP POLICY IF EXISTS "select_categories" ON public.categories;

-- TRANSACTIONS: Drop permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated users to select transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON public.transactions;

-- WALLETS: Drop permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow authenticated users to insert wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow authenticated users to select wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow authenticated users to update wallets" ON public.wallets;

-- PROFILES: Drop permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON public.profiles;

-- Note: We keep the user-specific policies already present:
--  categories: Users can view/update/delete/create their own (auth.uid() = user_id)
--  transactions: Users can view/update/delete/create their own (auth.uid() = user_id)
--  wallets: Users can view/update/delete/create their own (auth.uid() = user_id)
--  profiles: Users can view/update/insert their own (auth.uid() = id)

-- This migration tightens access without changing application behavior for legitimate users.
