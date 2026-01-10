import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  Truck,
  CreditCard,
  Wifi,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  Euro,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  icon: React.ReactNode;
  question: string;
  description: string;
  options: { label: string; value: string; points: number }[];
  category: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'flights',
    icon: <Plane className="w-6 h-6" />,
    question: 'Hai avuto problemi con voli negli ultimi 2 anni?',
    description: 'Ritardi, cancellazioni, overbooking, bagagli smarriti',
    category: 'flight',
    options: [
      { label: 'Sì, più volte', value: 'multiple', points: 800 },
      { label: 'Sì, una volta', value: 'once', points: 400 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'ecommerce',
    icon: <ShoppingCart className="w-6 h-6" />,
    question: 'Acquisti spesso online?',
    description: 'Amazon, Zalando, eBay e altri e-commerce',
    category: 'ecommerce',
    options: [
      { label: 'Sì, ogni settimana', value: 'weekly', points: 200 },
      { label: 'Sì, ogni mese', value: 'monthly', points: 100 },
      { label: 'Raramente', value: 'rarely', points: 30 },
      { label: 'Mai', value: 'never', points: 0 },
    ],
  },
  {
    id: 'returns',
    icon: <Truck className="w-6 h-6" />,
    question: 'Hai avuto problemi con resi o rimborsi?',
    description: 'Resi non rimborsati, prodotti non conformi, mancate consegne',
    category: 'ecommerce',
    options: [
      { label: 'Sì, spesso', value: 'often', points: 300 },
      { label: 'Sì, qualche volta', value: 'sometimes', points: 150 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'bank',
    icon: <Landmark className="w-6 h-6" />,
    question: 'Hai notato addebiti sospetti sul conto?',
    description: 'Commissioni non riconosciute, doppi addebiti, interessi errati',
    category: 'bank',
    options: [
      { label: 'Sì, più volte', value: 'multiple', points: 200 },
      { label: 'Sì, una volta', value: 'once', points: 80 },
      { label: 'Non controllo spesso', value: 'unsure', points: 50 },
      { label: 'No, mai', value: 'no', points: 0 },
    ],
  },
  {
    id: 'cards',
    icon: <CreditCard className="w-6 h-6" />,
    question: 'Quante carte di credito/debito hai?',
    description: 'Più carte = più probabilità di addebiti errati',
    category: 'bank',
    options: [
      { label: '3 o più', value: 'many', points: 150 },
      { label: '2', value: 'two', points: 80 },
      { label: '1', value: 'one', points: 40 },
      { label: 'Nessuna', value: 'none', points: 0 },
    ],
  },
  {
    id: 'insurance',
    icon: <Shield className="w-6 h-6" />,
    question: 'Hai polizze assicurative attive?',
    description: 'Auto, casa, vita, salute, viaggio',
    category: 'insurance',
    options: [
      { label: 'Sì, più di 2', value: 'multiple', points: 300 },
      { label: 'Sì, 1-2', value: 'few', points: 150 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'claims',
    icon: <Shield className="w-6 h-6" />,
    question: 'Hai avuto sinistri non rimborsati o in ritardo?',
    description: 'Richieste di rimborso ignorate o liquidate parzialmente',
    category: 'insurance',
    options: [
      { label: 'Sì, più di uno', value: 'multiple', points: 500 },
      { label: 'Sì, uno', value: 'once', points: 250 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'electronics',
    icon: <Package className="w-6 h-6" />,
    question: 'Hai acquistato elettronica negli ultimi 2 anni?',
    description: 'Smartphone, PC, TV, elettrodomestici',
    category: 'warranty',
    options: [
      { label: 'Sì, più prodotti', value: 'multiple', points: 200 },
      { label: 'Sì, 1-2 prodotti', value: 'few', points: 100 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'defects',
    icon: <Package className="w-6 h-6" />,
    question: 'Hai avuto prodotti difettosi non sostituiti?',
    description: 'Entro 24 mesi hai diritto alla garanzia legale',
    category: 'warranty',
    options: [
      { label: 'Sì, più volte', value: 'multiple', points: 400 },
      { label: 'Sì, una volta', value: 'once', points: 200 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'telecom',
    icon: <Wifi className="w-6 h-6" />,
    question: 'Hai avuto problemi con operatori telefonici/internet?',
    description: 'Fatturazione errata, servizi non richiesti, disservizi',
    category: 'telecom',
    options: [
      { label: 'Sì, spesso', value: 'often', points: 150 },
      { label: 'Sì, qualche volta', value: 'sometimes', points: 80 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'energy',
    icon: <Wifi className="w-6 h-6" />,
    question: 'Hai notato anomalie nelle bollette luce/gas?',
    description: 'Importi eccessivi, conguagli sproporzionati, bonus non applicati',
    category: 'energy',
    options: [
      { label: 'Sì, spesso', value: 'often', points: 300 },
      { label: 'Sì, qualche volta', value: 'sometimes', points: 150 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'transport',
    icon: <Truck className="w-6 h-6" />,
    question: 'Usi spesso treni o autobus?',
    description: 'Ritardi, cancellazioni, bagagli smarriti',
    category: 'transport',
    options: [
      { label: 'Sì, ogni settimana', value: 'weekly', points: 100 },
      { label: 'Sì, ogni mese', value: 'monthly', points: 50 },
      { label: 'Raramente', value: 'rarely', points: 20 },
      { label: 'Mai', value: 'never', points: 0 },
    ],
  },
  {
    id: 'auto',
    icon: <Truck className="w-6 h-6" />,
    question: 'Possiedi un\'auto acquistata negli ultimi 5 anni?',
    description: 'Potrebbero esserci richiami o class action attive',
    category: 'automotive',
    options: [
      { label: 'Sì, nuova', value: 'new', points: 200 },
      { label: 'Sì, usata', value: 'used', points: 150 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'tech_accounts',
    icon: <Wifi className="w-6 h-6" />,
    question: 'Hai account su piattaforme come ePrice, InfoCert, Apple?',
    description: 'Ci sono class action attive per data breach e obsolescenza',
    category: 'tech',
    options: [
      { label: 'Sì, più di una', value: 'multiple', points: 200 },
      { label: 'Sì, una', value: 'once', points: 100 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
  {
    id: 'class_actions',
    icon: <Wifi className="w-6 h-6" />,
    question: 'Sei interessato a partecipare a class action?',
    description: 'Azioni legali collettive contro grandi aziende',
    category: 'class_action',
    options: [
      { label: 'Sì, molto', value: 'very', points: 500 },
      { label: 'Sì, se non costa nulla', value: 'free', points: 300 },
      { label: 'No', value: 'no', points: 0 },
    ],
  },
];

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchedOpportunities, setMatchedOpportunities] = useState(0);

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: string, points: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Calculate total estimated amount
    const total = Object.entries(newAnswers).reduce((sum, [questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.value === answer);
      return sum + (option?.points || 0);
    }, 0);
    setEstimatedAmount(total);

    // Move to next question or show results
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveResultsAndMatch = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setSaving(true);

    try {
      // Save quiz answers to profile
      await supabase
        .from('profiles')
        .update({
          quiz_answers: answers,
          onboarding_completed: true,
          estimated_total_recovery: estimatedAmount,
        })
        .eq('user_id', user.id);

      // Match opportunities based on answers
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('*')
        .eq('active', true);

      if (opportunities) {
        // Create user_opportunities based on quiz answers
        const matchedOps = [];
        
        for (const opp of opportunities) {
          let shouldMatch = false;
          let amount = Math.floor((opp.min_amount + opp.max_amount) / 2);

          // Simple matching logic based on category and answers
          switch (opp.category) {
            case 'flight':
              if (answers.flights && answers.flights !== 'no') {
                shouldMatch = true;
                amount = answers.flights === 'multiple' ? 600 : 400;
              }
              break;
            case 'ecommerce':
              if ((answers.ecommerce && answers.ecommerce !== 'never') || 
                  (answers.returns && answers.returns !== 'no')) {
                shouldMatch = true;
              }
              break;
            case 'bank':
              if ((answers.bank && answers.bank !== 'no') || 
                  (answers.cards && answers.cards !== 'none')) {
                shouldMatch = true;
              }
              break;
            case 'insurance':
              if ((answers.insurance && answers.insurance !== 'no') || 
                  (answers.claims && answers.claims !== 'no')) {
                shouldMatch = true;
              }
              break;
            case 'warranty':
              if ((answers.electronics && answers.electronics !== 'no') || 
                  (answers.defects && answers.defects !== 'no')) {
                shouldMatch = true;
              }
              break;
            case 'telecom':
              if (answers.telecom && answers.telecom !== 'no') {
                shouldMatch = true;
              }
              break;
            case 'energy':
              if (answers.energy && answers.energy !== 'no') {
                shouldMatch = true;
              }
              break;
            case 'transport':
              if (answers.transport && answers.transport !== 'never') {
                shouldMatch = true;
              }
              break;
            case 'automotive':
              if (answers.auto && answers.auto !== 'no') {
                shouldMatch = true;
              }
              break;
            case 'tech':
              if (answers.tech_accounts && answers.tech_accounts !== 'no') {
                shouldMatch = true;
              }
              break;
            case 'class_action':
              if (answers.class_actions && answers.class_actions !== 'no') {
                shouldMatch = true;
              }
              break;
          }

          if (shouldMatch) {
            matchedOps.push({
              user_id: user.id,
              opportunity_id: opp.id,
              status: 'found',
              estimated_amount: amount,
              matched_data: { quiz_answers: answers },
            });
          }
        }

        if (matchedOps.length > 0) {
          await supabase.from('user_opportunities').insert(matchedOps);
          setMatchedOpportunities(matchedOps.length);
        }

        // Create welcome notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'new_opportunity',
          title: `${matchedOps.length} opportunità trovate!`,
          message: `Abbiamo trovato ${matchedOps.length} potenziali rimborsi per te. Vai alla dashboard per scoprirli.`,
          action_url: '/dashboard/opportunities',
        });
      }

      toast({
        title: 'Quiz completato!',
        description: 'Le tue opportunità sono pronte nella dashboard',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i risultati. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-hero-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-hero text-white p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-10 h-10" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Ottima notizia!</h2>
              <p className="text-white/90">Ecco quanto potresti recuperare</p>
            </div>
            
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 text-5xl font-bold text-primary mb-2">
                  <Euro className="w-10 h-10" />
                  <span>{estimatedAmount.toLocaleString('it-IT')}</span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Stima basata sulle tue risposte
                </p>

                <div className="space-y-3 text-left mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Analisi completata al 100%</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Opportunità trovate in base al tuo profilo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Richieste pre-compilate pronte per l'invio</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={saveResultsAndMatch}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Vai alla dashboard
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  I tuoi dati sono protetti e non condivisi con terze parti
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Domanda {currentStep + 1} di {questions.length}</span>
            <span>{Math.round(progress)}% completato</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {currentQuestion.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{currentQuestion.question}</h2>
                    <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value, option.points)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mt-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Indietro
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Estimated amount preview */}
        {estimatedAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">Stima parziale</p>
            <p className="text-2xl font-bold text-primary">
              €{estimatedAmount.toLocaleString('it-IT')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
