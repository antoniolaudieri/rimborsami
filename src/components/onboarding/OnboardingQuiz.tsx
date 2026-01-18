import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ArrowLeft, 
  Plane, 
  Receipt, 
  CreditCard, 
  Home, 
  Car, 
  Shield,
  CheckCircle2,
  Sparkles,
  Clock,
  Users
} from "lucide-react";

interface QuizOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface QuizStep {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
  multiple?: boolean;
}

const quizSteps: QuizStep[] = [
  {
    id: "travel",
    question: "Hai viaggiato in aereo negli ultimi 3 anni?",
    subtitle: "Voli cancellati o in ritardo danno diritto a rimborsi fino a €600",
    options: [
      { id: "often", label: "Sì, spesso", icon: <Plane className="w-6 h-6" />, description: "Più di 5 voli" },
      { id: "sometimes", label: "Qualche volta", icon: <Plane className="w-6 h-6" />, description: "1-5 voli" },
      { id: "never", label: "Mai o raramente", icon: <Plane className="w-6 h-6" /> },
    ],
  },
  {
    id: "utilities",
    question: "Hai bollette di luce, gas o telefono?",
    subtitle: "Errori di fatturazione sono più comuni di quanto pensi",
    options: [
      { id: "all", label: "Tutte", icon: <Receipt className="w-6 h-6" />, description: "Luce, gas, telefono" },
      { id: "some", label: "Solo alcune", icon: <Receipt className="w-6 h-6" /> },
      { id: "none", label: "Nessuna a mio nome", icon: <Receipt className="w-6 h-6" /> },
    ],
  },
  {
    id: "subscriptions",
    question: "Hai abbonamenti o servizi ricorrenti?",
    subtitle: "Palestre, streaming, app: spesso addebitano anche dopo la disdetta",
    multiple: true,
    options: [
      { id: "gym", label: "Palestra", icon: <CreditCard className="w-6 h-6" /> },
      { id: "streaming", label: "Streaming", icon: <CreditCard className="w-6 h-6" /> },
      { id: "apps", label: "App/Software", icon: <CreditCard className="w-6 h-6" /> },
      { id: "other", label: "Altro", icon: <CreditCard className="w-6 h-6" /> },
    ],
  },
  {
    id: "insurance",
    question: "Hai polizze assicurative attive?",
    subtitle: "Molti rimborsi assicurativi non vengono mai richiesti",
    multiple: true,
    options: [
      { id: "car", label: "Auto", icon: <Car className="w-6 h-6" /> },
      { id: "home", label: "Casa", icon: <Home className="w-6 h-6" /> },
      { id: "health", label: "Salute", icon: <Shield className="w-6 h-6" /> },
      { id: "none", label: "Nessuna", icon: <Shield className="w-6 h-6" /> },
    ],
  },
];

const OnboardingQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isComplete, setIsComplete] = useState(false);

  const step = quizSteps[currentStep];
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  const handleSelect = (optionId: string) => {
    const stepId = step.id;
    if (step.multiple) {
      const current = answers[stepId] || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [stepId]: current.filter((id) => id !== optionId) });
      } else {
        setAnswers({ ...answers, [stepId]: [...current, optionId] });
      }
    } else {
      setAnswers({ ...answers, [stepId]: [optionId] });
    }
  };

  const isSelected = (optionId: string) => {
    return (answers[step.id] || []).includes(optionId);
  };

  const canContinue = (answers[step.id] || []).length > 0;

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate estimated refund based on answers
  const calculateEstimate = () => {
    let min = 0;
    let max = 0;
    
    if (answers.travel?.includes("often")) { min += 200; max += 1800; }
    else if (answers.travel?.includes("sometimes")) { min += 100; max += 600; }
    
    if (answers.utilities?.includes("all")) { min += 50; max += 400; }
    else if (answers.utilities?.includes("some")) { min += 20; max += 200; }
    
    if ((answers.subscriptions || []).length > 0) {
      min += (answers.subscriptions?.length || 0) * 30;
      max += (answers.subscriptions?.length || 0) * 150;
    }
    
    if ((answers.insurance || []).filter(a => a !== "none").length > 0) {
      min += 100;
      max += 500;
    }
    
    return { min, max };
  };

  if (isComplete) {
    const estimate = calculateEstimate();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 max-w-md mx-auto text-center"
      >
        <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h3 className="font-display text-2xl font-bold mb-2">
          Ottima notizia!
        </h3>
        
        <p className="text-muted-foreground mb-6">
          In base alle tue risposte, potresti recuperare:
        </p>
        
        <div className="bg-gradient-hero-bg rounded-2xl p-6 mb-6">
          <div className="font-display text-4xl font-bold text-gradient-hero mb-1">
            €{estimate.min} - €{estimate.max}
          </div>
          <div className="text-sm text-muted-foreground">
            Stima basata su dati storici
          </div>
        </div>

        {/* Urgenza e social proof */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Verifica in 2 min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            <span>127K+ utenti</span>
          </div>
        </div>
        
        <Button variant="hero" size="xl" className="w-full group" asChild>
          <Link to={`/auth?mode=signup&estimate=${estimate.min}-${estimate.max}`}>
            Sblocca i tuoi rimborsi gratis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          ✓ Gratuito • ✓ Senza impegno • ✓ 100% sicuro
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border/50 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Domanda {currentStep + 1} di {quizSteps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-hero rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
            {step.question}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {step.subtitle}
          </p>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {step.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected(option.id)
                    ? "bg-gradient-hero text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  )}
                </div>
                {isSelected(option.id) && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          {step.multiple && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              Puoi selezionare più opzioni
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
        )}
        <Button
          variant="hero"
          onClick={handleNext}
          disabled={!canContinue}
          className="flex-1"
        >
          {currentStep < quizSteps.length - 1 ? "Continua" : "Vedi risultati"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
