CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('good','bad')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('parade','piled','other')),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO anon;
GRANT ALL ON public.equipment TO service_role;

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY equipment_open ON public.equipment FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER equipment_touch_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();