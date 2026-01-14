import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuthorBylineProps {
  name: string;
  slug: string;
  avatarUrl?: string | null;
  role?: string;
  publishedAt?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md';
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const AuthorByline = ({
  name,
  slug,
  avatarUrl,
  role,
  publishedAt,
  showAvatar = true,
  size = 'md',
}: AuthorBylineProps) => {
  const avatarSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <Link to={`/news/autore/${slug}`}>
          <Avatar className={avatarSize}>
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
      <div className="flex flex-col">
        <Link 
          to={`/news/autore/${slug}`}
          className={`font-medium text-foreground hover:text-primary transition-colors ${textSize}`}
        >
          {name}
        </Link>
        {(role || publishedAt) && (
          <span className={`text-muted-foreground ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
            {role}
            {role && publishedAt && ' · '}
            {publishedAt && new Date(publishedAt).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        )}
      </div>
    </div>
  );
};
