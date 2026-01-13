-- Aggiungere colonna per collegamento a opportunity
ALTER TABLE public.news_articles 
  ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.opportunities(id);

-- Indice per query veloci
CREATE INDEX IF NOT EXISTS idx_news_articles_opportunity_id 
  ON public.news_articles(opportunity_id);