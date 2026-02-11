import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleShareCTAProps {
  title: string;
  excerpt: string;
  url?: string;
}

export function ArticleShareCTA({ title, excerpt, url }: ArticleShareCTAProps) {
  const shareUrl = url || window.location.href;
  const shareText = `${title} - Scopri se ti spetta un rimborso!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        toast.success('Grazie per aver condiviso!');
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiato! Condividilo con chi potrebbe averne bisogno.');
      } catch {
        toast.error('Impossibile copiare il link');
      }
    }
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 md:p-6 my-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-primary/10 rounded-full p-2 mt-0.5">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-base md:text-lg">
            Aiuta un amico a recuperare i suoi soldi
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Conosci qualcuno che potrebbe avere diritto a un rimborso? Condividi questa guida.
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleWhatsApp} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <MessageCircle className="h-4 w-4" />
          Invia su WhatsApp
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Condividi
        </Button>
      </div>
    </div>
  );
}
