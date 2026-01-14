import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { getAuthorAvatar } from '@/lib/authorAvatars';

interface NewsCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string | null;
  readingTime: number;
  featuredImageUrl?: string | null;
  author?: {
    name: string;
    slug: string;
    avatar_url?: string | null;
  } | null;
  variant?: 'default' | 'featured' | 'compact';
}

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  ecommerce: 'E-commerce',
  class_action: 'Class Action',
  insurance: 'Assicurazioni',
  transport: 'Trasporti',
  automotive: 'Auto',
  tech: 'Tech',
  warranty: 'Garanzie',
};

const categoryColors: Record<string, string> = {
  flight: 'bg-blue-600 text-white hover:bg-blue-700',
  telecom: 'bg-purple-600 text-white hover:bg-purple-700',
  energy: 'bg-amber-500 text-white hover:bg-amber-600',
  bank: 'bg-emerald-600 text-white hover:bg-emerald-700',
  ecommerce: 'bg-orange-600 text-white hover:bg-orange-700',
  class_action: 'bg-red-600 text-white hover:bg-red-700',
  insurance: 'bg-cyan-600 text-white hover:bg-cyan-700',
  transport: 'bg-indigo-600 text-white hover:bg-indigo-700',
  automotive: 'bg-slate-600 text-white hover:bg-slate-700',
  tech: 'bg-pink-600 text-white hover:bg-pink-700',
  warranty: 'bg-teal-600 text-white hover:bg-teal-700',
};

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
};

export function NewsCard({ 
  slug, 
  title, 
  excerpt, 
  category, 
  publishedAt, 
  readingTime, 
  featuredImageUrl,
  author,
  variant = 'default'
}: NewsCardProps) {
  const timeAgo = publishedAt 
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: it })
    : '';

  const authorAvatarSrc = author ? getAuthorAvatar(author.slug, author.avatar_url) : undefined;

  if (variant === 'featured') {
    return (
      <Link to={`/news/${slug}`} className="block">
        <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="grid md:grid-cols-2 gap-0">
            {featuredImageUrl && (
              <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden">
                <img
                  src={featuredImageUrl}
                  alt={title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <Badge 
                variant="secondary" 
                className={`w-fit mb-4 ${categoryColors[category] || 'bg-muted text-muted-foreground'}`}
              >
                {categoryLabels[category] || category}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-snug break-words hyphens-auto">
                {title}
              </h2>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto">
                {author && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={authorAvatarSrc} alt={author.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {readingTime} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/news/${slug}`} className="block">
        <div className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
          {featuredImageUrl && (
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={featuredImageUrl}
                alt={title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Badge 
              variant="secondary" 
              className={`mb-2 text-xs ${categoryColors[category] || 'bg-muted text-muted-foreground'}`}
            >
              {categoryLabels[category] || category}
            </Badge>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors break-words hyphens-auto">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{readingTime} min</span>
              {timeAgo && <span>· {timeAgo}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/news/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
        {featuredImageUrl && (
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={featuredImageUrl}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <Badge 
              variant="secondary" 
              className={`absolute top-3 left-3 ${categoryColors[category] || 'bg-muted text-muted-foreground'}`}
            >
              {categoryLabels[category] || category}
            </Badge>
          </div>
        )}
        
        <CardHeader className={featuredImageUrl ? "pb-2 pt-4" : "pb-3"}>
          {!featuredImageUrl && (
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={categoryColors[category] || 'bg-muted text-muted-foreground'}
              >
                {categoryLabels[category] || category}
              </Badge>
            </div>
          )}
          <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors break-words hyphens-auto">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {author && (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={authorAvatarSrc} alt={author.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {getInitials(author.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{author.name.split(' ')[0]}</span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {readingTime} min
            </span>
          </div>
          <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Leggi <ArrowRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
