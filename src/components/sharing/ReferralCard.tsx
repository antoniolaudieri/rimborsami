import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShareButtons } from './ShareButtons';
import { useReferral } from '@/hooks/useReferral';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Gift, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ReferralCard() {
  const { userStats, loading, getShareUrl, getShareMessage, trackShare, getBadgeInfo, BADGE_THRESHOLDS } = useReferral();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (loading || !userStats) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const shareUrl = getShareUrl();
  const shareMessage = getShareMessage();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userStats.referral_code);
      setCopied(true);
      toast({
        title: 'Codice copiato!',
        description: 'Condividilo con i tuoi amici',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Non è stato possibile copiare il codice',
        variant: 'destructive',
      });
    }
  };

  const handleShare = (platform: string) => {
    trackShare(platform);
  };

  // Calculate progress to next badge
  const getNextBadge = () => {
    const thresholds = [
      { key: 'pioneer', count: 1 },
      { key: 'influencer', count: 5 },
      { key: 'champion', count: 10 },
      { key: 'legend', count: 25 },
    ];

    for (const t of thresholds) {
      if (userStats.successful_referrals < t.count) {
        const info = getBadgeInfo(t.key);
        return {
          ...info,
          key: t.key,
          target: t.count,
          progress: (userStats.successful_referrals / t.count) * 100,
        };
      }
    }
    return null;
  };

  const nextBadge = getNextBadge();

  // Get earned badges
  const earnedBadges = userStats.badges.map(b => getBadgeInfo(b)).filter(Boolean);

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Invita Amici</CardTitle>
              <CardDescription>Guadagna premi per ogni invito</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Referral code */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Il tuo codice</p>
            <p className="font-mono font-bold text-lg tracking-wider">{userStats.referral_code}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyCode}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{userStats.successful_referrals}</p>
            <p className="text-xs text-muted-foreground">Amici invitati</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{earnedBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badge ottenuti</p>
          </div>
        </div>

        {/* Next badge progress */}
        {nextBadge && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prossimo badge</span>
              <span className="font-medium flex items-center gap-1">
                <span>{nextBadge.icon}</span>
                <span>{nextBadge.label}</span>
              </span>
            </div>
            <Progress value={nextBadge.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {userStats.successful_referrals}/{nextBadge.target} inviti
            </p>
          </div>
        )}

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Badge variant="secondary" className="gap-1">
                  <span>{badge?.icon}</span>
                  <span>{badge?.label}</span>
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-t"
          >
            {/* Share buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Condividi con:</p>
              <ShareButtons
                url={shareUrl}
                message={shareMessage}
                onShare={handleShare}
              />
            </div>

            {/* Rewards info */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Premi disponibili</p>
                  <ul className="text-muted-foreground mt-1 space-y-0.5">
                    <li>• 1 mese Premium gratis ogni 3 amici</li>
                    <li>• Badge esclusivi da collezionare</li>
                    <li>• Posizione in classifica</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* All badges */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tutti i badge</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(BADGE_THRESHOLDS).map(([key, badge]) => {
                  const earned = userStats.badges.includes(key);
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-lg border ${
                        earned 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted/30 opacity-50'
                      }`}
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <span className="ml-1 font-medium">{badge.label}</span>
                      <p className="text-xs text-muted-foreground">
                        {'referrals' in badge 
                          ? `${badge.referrals} inviti` 
                          : `${badge.recovered}€ recuperati`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {!expanded && (
          <Button className="w-full" onClick={() => setExpanded(true)}>
            <Gift className="w-4 h-4 mr-2" />
            Invita amici e guadagna
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
