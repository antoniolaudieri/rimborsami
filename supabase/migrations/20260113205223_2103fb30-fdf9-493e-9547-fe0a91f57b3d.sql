-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access
CREATE POLICY "Public read access for news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

-- Policy for service role to upload images (edge functions)
CREATE POLICY "Service role can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images');