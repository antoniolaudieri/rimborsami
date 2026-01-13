import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NewsCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string | null;
  readingTime: number;
}

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  ecommerce: 'E-commerce',
  class_action: 'Class Action',
  insurance: 'Assicurazioni',
};

const categoryColors: Record<string, string> = {
  flight: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  telecom: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  energy: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
  bank: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  ecommerce: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20',
  class_action: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
  insurance: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20',
};

export function NewsCard({ slug, title, excerpt, category, publishedAt, readingTime }: NewsCardProps) {
  const timeAgo = publishedAt 
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: it })
    : '';

  return (
    <Link to={`/news/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={categoryColors[category] || 'bg-muted text-muted-foreground'}
            >
              {categoryLabels[category] || category}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min
            </span>
            {timeAgo && <span>{timeAgo}</span>}
          </div>
          <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Leggi <ArrowRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
