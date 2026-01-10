import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, CheckCircle2, AlertTriangle, Sparkles, FileText, Scan, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcessingAnimationProps {
  status: 'pending' | 'processing' | 'completed' | 'error';
  documentType?: string;
  hasAnomalies?: boolean;
}

const steps = [
  { id: 'upload', label: 'Caricamento...', icon: FileText },
  { id: 'scan', label: 'Scansione documento...', icon: Scan },
  { id: 'analyze', label: 'Analisi contenuto...', icon: FileSearch },
  { id: 'match', label: 'Ricerca opportunità...', icon: Target },
  { id: 'complete', label: 'Completato!', icon: CheckCircle2 },
];

export function ProcessingAnimation({ status, documentType, hasAnomalies }: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === 'pending') {
      setCurrentStep(0);
    } else if (status === 'processing') {
      // Animate through steps
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setCurrentStep(4);
    } else if (status === 'error') {
      setCurrentStep(-1);
    }
  }, [status]);

  if (status === 'completed' && !hasAnomalies) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative flex flex-col items-center gap-4 p-6"
        >
          {/* Scanning animation */}
          <div className="relative w-20 h-24">
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(var(--primary), 0)',
                  '0 0 20px 10px rgba(var(--primary), 0.1)',
                  '0 0 0 0 rgba(var(--primary), 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Document icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary/60" />
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-4">
            {steps.slice(0, 4).map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <motion.div
                  key={step.id}
                  className="flex items-center"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: isActive || isComplete ? 1 : 0.5 }}
                >
                  <motion.div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                      ${isActive ? 'bg-primary/20 text-primary' : ''}
                      ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
                    `}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </motion.div>
                  {index < 3 && (
                    <motion.div
                      className={`w-8 h-0.5 ${isComplete ? 'bg-primary' : 'bg-muted'}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isComplete ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Current step label */}
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            {steps[currentStep]?.label || 'Elaborazione...'}
          </motion.p>
        </motion.div>
      )}

      {status === 'completed' && hasAnomalies && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </motion.div>
          <div>
            <p className="font-medium text-destructive">Anomalie rilevate!</p>
            <p className="text-sm text-muted-foreground">
              Espandi per vedere i dettagli dell'analisi
            </p>
          </div>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Errore durante l'elaborazione. Riprova.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Confetti animation for successful matches
export function SuccessConfetti() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            top: '50%',
            left: '50%',
            scale: 0,
          }}
          animate={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: [0, 1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        >
          <Sparkles
            className="h-4 w-4"
            style={{
              color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'][i % 4],
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
