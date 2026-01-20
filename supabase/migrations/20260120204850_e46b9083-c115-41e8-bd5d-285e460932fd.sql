-- Add content_type column to social_posts for tracking post strategy performance
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS content_type TEXT CHECK (content_type IN ('attraction', 'education', 'conversion'));

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON public.social_posts(content_type);

-- Add comment for documentation
COMMENT ON COLUMN public.social_posts.content_type IS 'Content strategy type: attraction (viral hooks), education (value content), conversion (sales CTA)';