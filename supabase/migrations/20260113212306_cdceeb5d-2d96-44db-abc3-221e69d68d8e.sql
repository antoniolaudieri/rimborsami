-- Add SEO tracking columns to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS primary_keyword VARCHAR(255),
ADD COLUMN IF NOT EXISTS search_intent VARCHAR(50) DEFAULT 'informational',
ADD COLUMN IF NOT EXISTS target_word_count INTEGER DEFAULT 1500,
ADD COLUMN IF NOT EXISTS faq_schema JSONB,
ADD COLUMN IF NOT EXISTS howto_schema JSONB,
ADD COLUMN IF NOT EXISTS internal_links TEXT[];