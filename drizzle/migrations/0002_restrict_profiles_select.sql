DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;
CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_staff(auth.uid()));