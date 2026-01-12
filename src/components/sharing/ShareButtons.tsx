import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Send, 
  Facebook, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  Twitter
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  url: string;
  message: string;
  onShare?: (platform: string) => void;
  size?: 'sm' | 'default' | 'lg';
  showLabels?: boolean;
}

export function ShareButtons({ 
  url, 
  message, 
  onShare, 
  size = 'default',
  showLabels = false 
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedMessage = encodeURIComponent(`${message} ${url}`);
  const encodedUrl = encodeURIComponent(url);

  const platforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedMessage}`,
      key: 'whatsapp',
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message)}`,
      key: 'telegram',
    },
    {
      name: 'X',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      key: 'twitter',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(message)}`,
      key: 'facebook',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      key: 'linkedin',
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent('Scopri se hai diritto a rimborsi!')}&body=${encodedMessage}`,
      key: 'email',
    },
  ];

  const handleShare = (platform: typeof platforms[0]) => {
    window.open(platform.url, '_blank', 'width=600,height=400');
    onShare?.(platform.key);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${message} ${url}`);
      setCopied(true);
      toast({
        title: 'Link copiato!',
        description: 'Ora puoi incollarlo dove vuoi',
      });
      onShare?.('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Non è stato possibile copiare il link',
        variant: 'destructive',
      });
    }
  };

  const buttonSize = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {platforms.map((platform) => (
        <Button
          key={platform.key}
          variant="ghost"
          size="icon"
          className={`${buttonSize} ${platform.color} text-white rounded-full transition-transform hover:scale-110`}
          onClick={() => handleShare(platform)}
          title={platform.name}
        >
          <platform.icon className={iconSize} />
          {showLabels && <span className="sr-only">{platform.name}</span>}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSize} bg-muted hover:bg-muted/80 rounded-full transition-transform hover:scale-110`}
        onClick={handleCopy}
        title="Copia link"
      >
        {copied ? (
          <Check className={`${iconSize} text-green-500`} />
        ) : (
          <Copy className={iconSize} />
        )}
      </Button>
    </div>
  );
}
