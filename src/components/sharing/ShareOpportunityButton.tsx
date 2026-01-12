import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ShareButtons } from './ShareButtons';
import { useReferral } from '@/hooks/useReferral';
import { Share2, Users } from 'lucide-react';

interface ShareOpportunityButtonProps {
  opportunityId: string;
  opportunityTitle: string;
  company?: string;
  estimatedAmount?: number;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareOpportunityButton({
  opportunityId,
  opportunityTitle,
  company,
  estimatedAmount,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ShareOpportunityButtonProps) {
  const [open, setOpen] = useState(false);
  const { getShareUrl, trackShare } = useReferral();

  const shareUrl = getShareUrl(opportunityId);
  
  const getMessage = () => {
    if (company && estimatedAmount) {
      return `💰 Ho scoperto che posso recuperare fino a ${estimatedAmount}€ da ${company}! Controlla se anche tu hai diritto:`;
    }
    if (company) {
      return `💰 Hai avuto problemi con ${company}? Potresti avere diritto a un rimborso! Scopri di più:`;
    }
    return `💰 Ho trovato un'opportunità di rimborso che potrebbe interessarti: ${opportunityTitle}`;
  };

  const handleShare = (platform: string) => {
    trackShare(platform, opportunityId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Condividi</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Condividi con un amico</p>
              <p className="text-xs text-muted-foreground">
                Conosci qualcuno che potrebbe beneficiarne?
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="text-muted-foreground line-clamp-2">
              {getMessage()}
            </p>
          </div>

          <ShareButtons
            url={shareUrl}
            message={getMessage()}
            onShare={handleShare}
          />

          <p className="text-xs text-center text-muted-foreground">
            Guadagna punti per ogni amico che si registra!
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
