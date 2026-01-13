-- Create a function to increment view count that bypasses RLS
CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.news_articles
  SET views_count = views_count + 1
  WHERE slug = article_slug AND is_published = true;
END;
$$;