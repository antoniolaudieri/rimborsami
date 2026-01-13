import { Link } from 'react-router-dom';
import { useRecentNews } from '@/hooks/useNewsArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface RelatedArticlesProps {
  currentSlug: string;
}

export function RelatedArticles({ currentSlug }: RelatedArticlesProps) {
  const { data: articles, isLoading } = useRecentNews(currentSlug, 3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Articoli correlati</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Articoli correlati</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link key={article.id} to={`/news/${article.slug}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{article.reading_time_minutes} min</span>
                  {article.published_at && (
                    <span>
                      · {formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: it })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
