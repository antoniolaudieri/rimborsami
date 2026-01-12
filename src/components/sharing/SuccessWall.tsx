import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

interface SharedSuccess {
  id: string;
  amount_recovered: number;
  company_name: string;
  category: string;
  anonymous_name: string;
  message: string | null;
  created_at: string;
}

const categoryEmojis: Record<string, string> = {
  travel: '✈️',
  banking: '🏦',
  telecom: '📱',
  ecommerce: '🛒',
  utilities: '💡',
  insurance: '🛡️',
  automotive: '🚗',
  entertainment: '🎬',
  other: '📋',
};

export function SuccessWall() {
  const [successes, setSuccesses] = useState<SharedSuccess[]>([]);
  const [totalRecovered, setTotalRecovered] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchSuccesses();
    fetchStats();
  }, []);

  // Auto-rotate through successes
  useEffect(() => {
    if (successes.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % successes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [successes.length]);

  const fetchSuccesses = async () => {
    const { data } = await supabase
      .from('shared_successes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setSuccesses(data);
    }
  };

  const fetchStats = async () => {
    // Get total recovered from shared successes
    const { data: successData } = await supabase
      .from('shared_successes')
      .select('amount_recovered');

    if (successData) {
      const total = successData.reduce((sum, s) => sum + Number(s.amount_recovered), 0);
      setTotalRecovered(total);
    }

    // Get total users count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (count) {
      setTotalUsers(count);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
    return `${Math.floor(diffDays / 30)} mesi fa`;
  };

  if (successes.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Storie di Successo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bacheca dei Rimborsi Ottenuti
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Utenti reali che hanno già recuperato i loro soldi
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatAmount(totalRecovered)}
            </p>
            <p className="text-sm text-muted-foreground">Totale recuperato</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalUsers.toLocaleString()}+
            </p>
            <p className="text-sm text-muted-foreground">Utenti attivi</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 col-span-2 md:col-span-1">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {successes.length}
            </p>
            <p className="text-sm text-muted-foreground">Storie condivise</p>
          </Card>
        </div>

        {/* Success cards carousel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {successes[activeIndex] && (
                <>
                  <div className="text-5xl mb-4">
                    {categoryEmojis[successes[activeIndex].category] || '💰'}
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mb-2">
                    <span className="text-primary">{successes[activeIndex].anonymous_name}</span>
                    {' '}ha recuperato{' '}
                    <span className="text-green-500">
                      {formatAmount(successes[activeIndex].amount_recovered)}
                    </span>
                  </p>
                  <p className="text-lg text-muted-foreground mb-4">
                    da <span className="font-semibold">{successes[activeIndex].company_name}</span>
                  </p>
                  {successes[activeIndex].message && (
                    <p className="italic text-muted-foreground max-w-lg mx-auto">
                      "{successes[activeIndex].message}"
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-4">
                    {formatDate(successes[activeIndex].created_at)}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {successes.slice(0, 10).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Recent successes grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {successes.slice(0, 6).map((success, i) => (
            <motion.div
              key={success.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {categoryEmojis[success.category] || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{success.anonymous_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {success.company_name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    +{formatAmount(success.amount_recovered)}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
