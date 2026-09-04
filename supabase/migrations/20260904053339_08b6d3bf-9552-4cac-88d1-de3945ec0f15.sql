CREATE TYPE public.app_role AS ENUM ('admin','officer','cadet');
CREATE TYPE public.cadet_status AS ENUM ('active','inactive','passed_out');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  rank text,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','officer'));
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cadet')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cadets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  rank text NOT NULL DEFAULT 'Cadet',
  batch text,
  ward text NOT NULL DEFAULT 'A',
  phone text,
  status public.cadet_status NOT NULL DEFAULT 'active',
  joined_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cadets TO authenticated;
GRANT ALL ON public.cadets TO service_role;
ALTER TABLE public.cadets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cadets_select_auth" ON public.cadets FOR SELECT TO authenticated USING (true);
CREATE POLICY "cadets_insert_staff" ON public.cadets FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "cadets_update_staff" ON public.cadets FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "cadets_delete_staff" ON public.cadets FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id uuid NOT NULL REFERENCES public.cadets(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT current_date,
  status public.attendance_status NOT NULL DEFAULT 'present',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cadet_id, session_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_select_auth" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_write_staff" ON public.attendance FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER cadets_touch BEFORE UPDATE ON public.cadets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.cadets (cadet_id, full_name, rank, batch, ward, phone, status, joined_on) VALUES
('BN-2214','রায়হান হোসেন','Cadet','2024','A','01711000001','active','2024-01-15'),
('BN-2198','নুসরাত জাহান','Cadet','2024','A','01711000002','active','2024-01-15'),
('BN-2201','সারোয়ার মিয়া','Senior Cadet','2023','B','01711000003','active','2023-02-10'),
('BN-2176','তানভীর আহমেদ','Cadet','2024','B','01711000004','active','2024-01-20'),
('BN-2150','সুমাইয়া আক্তার','Corporal','2023','A','01711000005','active','2023-03-05'),
('BN-2143','রফিক ইসলাম','Sergeant','2022','C','01711000006','active','2022-08-11'),
('BN-2131','নাদিয়া হোসেন','Corporal','2023','C','01711000007','active','2023-04-19'),
('BN-2120','আরিফুল ইসলাম','Cadet','2025','B','01711000008','active','2025-01-12'),
('BN-2112','মেহেদী হাসান','Cadet','2025','A','01711000009','active','2025-01-12'),
('BN-2099','ফারহানা ইয়াসমিন','Senior Cadet','2022','C','01711000010','inactive','2022-09-01');

INSERT INTO public.attendance (cadet_id, session_date, status)
SELECT id, current_date, CASE WHEN random() < 0.85 THEN 'present'::public.attendance_status ELSE 'absent'::public.attendance_status END
FROM public.cadets WHERE status = 'active';