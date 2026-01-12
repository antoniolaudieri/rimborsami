import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShareSuccessModal } from '@/components/sharing/ShareSuccessModal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  PartyPopper,
  ThumbsDown,
} from 'lucide-react';

interface OutcomeFeedbackProps {
  userOpportunityId: string;
  currentOutcome?: string;
  estimatedAmount?: number;
  companyName?: string;
  category?: string;
  onUpdate: (outcome: string, actualAmount?: number) => void;
}

const outcomeOptions = [
  {
    value: 'success',
    label: 'Rimborso ottenuto!',
    description: 'Ho ricevuto il rimborso completo',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    value: 'partial',
    label: 'Rimborso parziale',
    description: 'Ho ricevuto un rimborso parziale',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    value: 'pending',
    label: 'In attesa',
    description: 'La richiesta è ancora in lavorazione',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    value: 'rejected',
    label: 'Richiesta rifiutata',
    description: 'La richiesta è stata respinta',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
];

export default function OutcomeFeedback({
  userOpportunityId,
  currentOutcome = 'pending',
  estimatedAmount,
  companyName = 'Azienda',
  category = 'other',
  onUpdate,
}: OutcomeFeedbackProps) {
  const { toast } = useToast();
  const [outcome, setOutcome] = useState(currentOutcome);
  const [actualAmount, setActualAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        outcome,
        notes: notes || null,
      };

      if (outcome === 'success' || outcome === 'partial') {
        updateData.actual_amount = actualAmount ? parseInt(actualAmount) : null;
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_opportunities')
        .update(updateData)
        .eq('id', userOpportunityId);

      if (error) throw error;

      setSaved(true);
      toast({
        title: 'Feedback salvato!',
        description: 'Grazie per aver condiviso l\'esito della tua richiesta',
      });
      onUpdate(outcome, actualAmount ? parseInt(actualAmount) : undefined);
      
      // Show share modal for successful outcomes
      if (outcome === 'success' || outcome === 'partial') {
        setTimeout(() => setShowShareModal(true), 500);
      }
    } catch (error) {
      console.error('Error saving outcome:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare il feedback',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    const isSuccess = outcome === 'success' || outcome === 'partial';
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isSuccess ? 'bg-green-100' : 'bg-muted'
          }`}>
            {isSuccess ? (
              <PartyPopper className="w-8 h-8 text-green-600" />
            ) : (
              <ThumbsDown className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isSuccess ? 'Fantastico!' : 'Grazie per il feedback'}
          </h3>
          <p className="text-muted-foreground">
            {isSuccess
              ? `Complimenti per aver recuperato i tuoi soldi!`
              : 'Il tuo feedback ci aiuta a migliorare il servizio'}
          </p>
          {isSuccess && actualAmount && (
            <p className="mt-2 text-2xl font-bold text-primary">
              €{parseInt(actualAmount).toLocaleString('it-IT')} recuperati
            </p>
          )}
        </motion.div>
        
        <ShareSuccessModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          amount={actualAmount ? parseInt(actualAmount) : estimatedAmount || 0}
          company={companyName}
          category={category}
          userOpportunityId={userOpportunityId}
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Com'è andata la richiesta?</CardTitle>
        <CardDescription>
          Aiutaci a tracciare l'esito della tua pratica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={outcome} onValueChange={setOutcome}>
          <div className="grid gap-3">
            {outcomeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = outcome === option.value;
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `${option.borderColor} ${option.bgColor}`
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className={`w-10 h-10 rounded-full ${option.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </Label>
              );
            })}
          </div>
        </RadioGroup>

        {(outcome === 'success' || outcome === 'partial') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="amount">Importo ricevuto (€)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={estimatedAmount ? `Stimato: €${estimatedAmount}` : 'Inserisci l\'importo'}
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
              />
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Note (opzionale)</Label>
          <Textarea
            id="notes"
            placeholder="Racconta brevemente come è andata..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvataggio...
            </>
          ) : (
            'Conferma esito'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
