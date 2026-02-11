
-- Create content_reposts table for tracking repurposed content
CREATE TABLE public.content_reposts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES public.news_articles(id) ON DELETE CASCADE,
  format text NOT NULL,
  platform text NOT NULL,
  post_text text NOT NULL,
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reposts ENABLE ROW LEVEL SECURITY;

-- Admin-only management
CREATE POLICY "Admins can manage content reposts"
ON public.content_reposts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public read for posted content
CREATE POLICY "Anyone can view posted reposts"
ON public.content_reposts
FOR SELECT
USING (posted_at IS NOT NULL);

-- Index for quick lookups
CREATE INDEX idx_content_reposts_article_id ON public.content_reposts(article_id);
CREATE INDEX idx_content_reposts_posted_at ON public.content_reposts(posted_at DESC);
CREATE INDEX idx_content_reposts_format ON public.content_reposts(format);
