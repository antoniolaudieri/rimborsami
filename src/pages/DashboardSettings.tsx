import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Paywall } from '@/components/Paywall';
import { useSubscription } from '@/hooks/useSubscription';
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Crown,
  Check,
  Shield,
  Bell,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface Profile {
  full_name: string;
  email: string;
  phone: string;
}

export default function DashboardSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, isPremium, syncing, syncWithStripe } = useSubscription();

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Salvato!',
        description: 'Il tuo profilo è stato aggiornato',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le modifiche',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aprire il portale di gestione. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setOpeningPortal(false);
    }
  };

  const planLabels: Record<string, string> = {
    free: 'Free',
    monthly: 'Premium Mensile',
    annual: 'Premium Annuale',
  };

  const planFeatures: Record<string, string[]> = {
    free: [
      '3 opportunità visibili',
      'Generatore richieste base',
      'Email di supporto',
    ],
    monthly: [
      'Opportunità illimitate',
      'Template email + PEC',
      'Notifiche personalizzate',
      'Supporto prioritario',
    ],
    annual: [
      'Tutto incluso in Premium',
      'Sconto 40% sul prezzo mensile',
      'Garanzia soddisfatti o rimborsati',
      'Consulenza personalizzata',
    ],
  };

  const currentPlan = subscription?.plan || 'free';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci il tuo profilo e abbonamento
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profilo
              </CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni personali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Mario Rossi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  L'email non può essere modificata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono (opzionale)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+39 333 1234567"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salva modifiche
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Abbonamento
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={syncWithStripe}
                  disabled={syncing}
                  title="Aggiorna stato abbonamento"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Piano attuale</span>
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                  {planLabels[currentPlan]}
                </Badge>
              </div>

              <ul className="space-y-2">
                {planFeatures[currentPlan].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === 'free' ? (
                <Button className="w-full" onClick={() => setShowPaywall(true)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Passa a Premium
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                >
                  {openingPortal ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gestisci abbonamento
                </Button>
              )}

              {subscription?.ends_at && (
                <p className="text-sm text-muted-foreground text-center">
                  Prossimo rinnovo: {new Date(subscription.ends_at).toLocaleDateString('it-IT')}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifiche
              </CardTitle>
              <CardDescription>
                Gestisci le tue preferenze di notifica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Le impostazioni delle notifiche saranno disponibili a breve.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy e Sicurezza
              </CardTitle>
              <CardDescription>
                I tuoi dati sono al sicuro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Crittografia end-to-end</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Server in Europa</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          opportunitiesCount={0}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
