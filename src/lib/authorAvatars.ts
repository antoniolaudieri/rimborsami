// Author avatar images - local assets for consistent loading
import alessandroFerrante from '@/assets/authors/alessandro-ferrante.jpg';
import chiaraMantovani from '@/assets/authors/chiara-mantovani.jpg';
import federicoColombo from '@/assets/authors/federico-colombo.jpg';
import martinaGalli from '@/assets/authors/martina-galli.jpg';
import lucaBenedetti from '@/assets/authors/luca-benedetti.jpg';
import saraMarchetti from '@/assets/authors/sara-marchetti.jpg';

// Map author slugs to their local avatar images
export const authorAvatars: Record<string, string> = {
  'alessandro-ferrante': alessandroFerrante,
  'chiara-mantovani': chiaraMantovani,
  'federico-colombo': federicoColombo,
  'martina-galli': martinaGalli,
  'luca-benedetti': lucaBenedetti,
  'sara-marchetti': saraMarchetti,
};

// Get avatar for author, fallback to database URL or undefined
export const getAuthorAvatar = (slug: string, dbAvatarUrl?: string | null): string | undefined => {
  return authorAvatars[slug] || dbAvatarUrl || undefined;
};
