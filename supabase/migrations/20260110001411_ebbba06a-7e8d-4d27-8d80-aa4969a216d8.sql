-- Aggiungi nuove categorie all'enum opportunity_category
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'telecom';
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'energy';
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'transport';
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'automotive';
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'tech';
ALTER TYPE opportunity_category ADD VALUE IF NOT EXISTS 'class_action';

-- Crea tabella class_actions per metadati specifici
CREATE TABLE public.class_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  organizer TEXT NOT NULL,
  status TEXT DEFAULT 'in_corso' CHECK (status IN ('in_corso', 'adesioni_aperte', 'adesioni_chiuse', 'conclusa', 'vinta', 'persa')),
  adhesion_deadline DATE,
  adhesion_url TEXT,
  tribunal TEXT,
  case_number TEXT,
  source_url TEXT,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.class_actions ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono vedere le class action attive
CREATE POLICY "Anyone can view class actions"
ON public.class_actions
FOR SELECT
USING (true);

-- Policy: solo admin possono gestire
CREATE POLICY "Admins can manage class actions"
ON public.class_actions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger per updated_at
CREATE TRIGGER update_class_actions_updated_at
BEFORE UPDATE ON public.class_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();