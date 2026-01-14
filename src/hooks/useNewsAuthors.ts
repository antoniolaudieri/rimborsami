import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsAuthor {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  expertise: string[];
  articles_count: number;
  created_at: string;
}

export const useNewsAuthors = () => {
  return useQuery({
    queryKey: ['news-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_authors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching news authors:', error);
        throw error;
      }

      return data as NewsAuthor[];
    },
  });
};

export const useNewsAuthor = (slug: string) => {
  return useQuery({
    queryKey: ['news-author', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_authors')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching news author:', error);
        throw error;
      }

      return data as NewsAuthor;
    },
    enabled: !!slug,
  });
};

export const useAuthorArticles = (authorId: string, limit = 10) => {
  return useQuery({
    queryKey: ['author-articles', authorId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, slug, title, excerpt, category, published_at, reading_time_minutes, featured_image_url')
        .eq('author_id', authorId)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching author articles:', error);
        throw error;
      }

      return data;
    },
    enabled: !!authorId,
  });
};
