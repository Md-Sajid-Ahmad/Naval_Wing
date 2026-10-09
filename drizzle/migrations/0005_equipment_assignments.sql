CREATE TABLE public.equipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id uuid NOT NULL REFERENCES public.cadets(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  assigned_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX equipment_assignments_cadet_idx ON public.equipment_assignments(cadet_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_assignments TO anon, authenticated;
GRANT ALL ON public.equipment_assignments TO service_role;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_assignments_open ON public.equipment_assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);