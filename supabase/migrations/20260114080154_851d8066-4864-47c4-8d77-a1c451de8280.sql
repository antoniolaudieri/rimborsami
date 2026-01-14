-- Add columns to track auto-discovered opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_discovered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

-- Update existing opportunities to mark as manually added
UPDATE public.opportunities 
SET auto_discovered = false, needs_review = false 
WHERE auto_discovered IS NULL;