import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import type { NewsAuthor } from '@/hooks/useNewsAuthors';
import { getAuthorAvatar } from '@/lib/authorAvatars';

interface AuthorCardProps {
  author: NewsAuthor;
  showFullBio?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const roleColors: Record<string, string> = {
  'Direttore Responsabile': 'bg-primary text-primary-foreground',
  'Caporedattore': 'bg-secondary text-secondary-foreground',
  'Redattore Senior': 'bg-accent text-accent-foreground',
  'Redattrice': 'bg-muted text-muted-foreground',
  'Redattore': 'bg-muted text-muted-foreground',
  'Contributor': 'bg-muted text-muted-foreground',
};

export const AuthorCard = ({ author, showFullBio = false }: AuthorCardProps) => {
  const roleColor = roleColors[author.role] || 'bg-muted text-muted-foreground';
  const avatarSrc = getAuthorAvatar(author.slug, author.avatar_url);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Link to={`/news/autore/${author.slug}`}>
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={avatarSrc} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link 
              to={`/news/autore/${author.slug}`}
              className="hover:underline"
            >
              <h3 className="font-semibold text-lg text-foreground">
                {author.name}
              </h3>
            </Link>
            <Badge className={`mt-1 ${roleColor}`}>
              {author.role}
            </Badge>

            {author.bio && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                {showFullBio ? author.bio : author.bio.substring(0, 150) + (author.bio.length > 150 ? '...' : '')}
              </p>
            )}

            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {author.expertise.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              {author.linkedin_url && (
                <a 
                  href={author.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {author.twitter_url && (
                <a 
                  href={author.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {author.email && (
                <a 
                  href={`mailto:${author.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {author.articles_count > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {author.articles_count} articoli
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
