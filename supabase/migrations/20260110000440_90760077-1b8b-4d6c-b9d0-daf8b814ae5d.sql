-- Trigger per calcolare deadline automaticamente quando viene creata una user_opportunity
CREATE OR REPLACE FUNCTION public.calculate_user_opportunity_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcola la deadline basata sui deadline_days dell'opportunità
  SELECT (NEW.created_at::date + COALESCE(o.deadline_days, 365))
  INTO NEW.deadline
  FROM public.opportunities o
  WHERE o.id = NEW.opportunity_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crea il trigger per le nuove user_opportunities
CREATE TRIGGER set_user_opportunity_deadline
  BEFORE INSERT ON public.user_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_user_opportunity_deadline();