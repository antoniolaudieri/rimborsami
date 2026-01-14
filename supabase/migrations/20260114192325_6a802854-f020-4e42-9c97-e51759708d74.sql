-- Add quality control columns to news_articles
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS quality_score integer,
ADD COLUMN IF NOT EXISTS editorial_notes text,
ADD COLUMN IF NOT EXISTS generation_version text DEFAULT 'v1';

-- Add check constraint for quality score
ALTER TABLE public.news_articles 
ADD CONSTRAINT quality_score_range CHECK (quality_score IS NULL OR (quality_score >= 1 AND quality_score <= 10));

-- Create index for finding recent articles for deduplication
CREATE INDEX IF NOT EXISTS idx_news_articles_recent ON public.news_articles (published_at DESC) WHERE is_published = true;

-- Create index for quality filtering
CREATE INDEX IF NOT EXISTS idx_news_articles_quality ON public.news_articles (quality_score) WHERE quality_score IS NOT NULL;