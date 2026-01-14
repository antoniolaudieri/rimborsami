import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticleOpportunity {
  id: string;
  title: string;
  short_description: string | null;
  min_amount: number | null;
  max_amount: number | null;
  category: string;
  legal_reference: string | null;
  deadline_days: number | null;
}

export interface NewsAuthorBasic {
  id: string;
  slug: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string[];
  featured_image_url: string | null;
  reading_time_minutes: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  views_count: number;
  opportunity_id?: string | null;
  author_id?: string | null;
  opportunities?: NewsArticleOpportunity | null;
  news_authors?: NewsAuthorBasic | null;
}

export const useNewsArticles = (category?: string, limit = 12) => {
  return useQuery({
    queryKey: ['news-articles', category, limit],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select(`
          *,
          news_authors (
            id,
            slug,
            name,
            role,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news articles:', error);
        throw error;
      }

      return data as NewsArticle[];
    },
  });
};

export const useNewsArticle = (slug: string) => {
  return useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          opportunities (
            id,
            title,
            short_description,
            min_amount,
            max_amount,
            category,
            legal_reference,
            deadline_days
          ),
          news_authors (
            id,
            slug,
            name,
            role,
            avatar_url
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching news article:', error);
        throw error;
      }

      // Increment view count using RPC function (fire and forget)
      supabase.rpc('increment_article_views', { article_slug: slug }).then(() => {});

      return data as NewsArticle;
    },
    enabled: !!slug,
  });
};

export const useRecentNews = (excludeSlug?: string, limit = 3) => {
  return useQuery({
    queryKey: ['recent-news', excludeSlug, limit],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('id, slug, title, excerpt, category, published_at, reading_time_minutes')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit + 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recent news:', error);
        throw error;
      }

      // Filter out current article and limit
      const filtered = excludeSlug 
        ? data.filter(a => a.slug !== excludeSlug).slice(0, limit)
        : data.slice(0, limit);

      return filtered as Pick<NewsArticle, 'id' | 'slug' | 'title' | 'excerpt' | 'category' | 'published_at' | 'reading_time_minutes'>[];
    },
  });
};
