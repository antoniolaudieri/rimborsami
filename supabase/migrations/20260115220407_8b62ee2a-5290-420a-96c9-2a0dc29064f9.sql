-- Tabella per tracciare i post sui social media
CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.news_articles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'twitter', 'telegram')),
  post_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  error_message text,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indice per cercare rapidamente per articolo
CREATE INDEX idx_social_posts_article_id ON public.social_posts(article_id);

-- Indice per cercare per piattaforma e status
CREATE INDEX idx_social_posts_platform_status ON public.social_posts(platform, status);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Policy: admins possono vedere tutto
CREATE POLICY "Admins can manage social posts"
ON public.social_posts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: tutti possono leggere i post pubblicati (per statistiche pubbliche)
CREATE POLICY "Anyone can view posted social posts"
ON public.social_posts
FOR SELECT
USING (status = 'posted');

-- Commento sulla tabella
COMMENT ON TABLE public.social_posts IS 'Traccia i post automatici degli articoli sui social media';