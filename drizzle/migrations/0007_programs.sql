CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  program_date date NOT NULL DEFAULT CURRENT_DATE,
  program_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY programs_open ON public.programs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.program_cadets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  cadet_id uuid NOT NULL REFERENCES public.cadets(id) ON DELETE CASCADE,
  group_name text NOT NULL DEFAULT 'cadet' CHECK (group_name IN ('cadet','parade','pilot','band','extra')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, cadet_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_cadets TO anon, authenticated;
GRANT ALL ON public.program_cadets TO service_role;
ALTER TABLE public.program_cadets ENABLE ROW LEVEL SECURITY;
CREATE POLICY program_cadets_open ON public.program_cadets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);