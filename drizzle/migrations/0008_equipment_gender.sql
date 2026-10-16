ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'male';

ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_gender_check;
ALTER TABLE public.equipment ADD CONSTRAINT equipment_gender_check CHECK (gender IN ('male','female'));