-- Create news_articles table for automated SEO content
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(160) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  featured_image_url TEXT,
  reading_time_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  views_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
ON public.news_articles
FOR SELECT
USING (is_published = true);

-- Policy: Admins can manage all articles
CREATE POLICY "Admins can manage news articles"
ON public.news_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_news_articles_published ON public.news_articles(is_published, published_at DESC);
CREATE INDEX idx_news_articles_category ON public.news_articles(category);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);

-- Create trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();