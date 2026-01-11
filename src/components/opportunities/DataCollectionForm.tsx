import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface DataCollectionFormProps {
  category: string;
  userOpportunityId: string;
  existingData?: Record<string, unknown>;
  onComplete: (data: Record<string, unknown>) => void;
}

// Schema per ogni categoria
const flightSchema = z.object({
  flight_number: z.string().min(2, 'Inserisci il numero del volo (es: FR1234)'),
  flight_date: z.string().min(1, 'Inserisci la data del volo'),
  departure_airport: z.string().min(2, 'Inserisci aeroporto di partenza'),
  arrival_airport: z.string().min(2, 'Inserisci aeroporto di arrivo'),
  delay_hours: z.string().optional(),
  issue_type: z.string().min(1, 'Seleziona il tipo di problema'),
  airline: z.string().min(1, 'Seleziona la compagnia aerea'),
});

const ecommerceSchema = z.object({
  order_number: z.string().min(1, 'Inserisci il numero ordine'),
  order_date: z.string().min(1, 'Inserisci la data dell\'ordine'),
  seller_name: z.string().min(1, 'Inserisci il nome del venditore'),
  product_name: z.string().min(1, 'Inserisci il nome del prodotto'),
  amount: z.string().min(1, 'Inserisci l\'importo'),
  issue_type: z.string().min(1, 'Seleziona il tipo di problema'),
});

const bankSchema = z.object({
  bank_name: z.string().min(1, 'Inserisci il nome della banca'),
  account_type: z.string().min(1, 'Seleziona il tipo di conto'),
  issue_type: z.string().min(1, 'Seleziona il tipo di problema'),
  period_start: z.string().min(1, 'Inserisci la data inizio periodo'),
  period_end: z.string().min(1, 'Inserisci la data fine periodo'),
  estimated_amount: z.string().optional(),
  details: z.string().optional(),
});

const insuranceSchema = z.object({
  insurance_company: z.string().min(1, 'Inserisci il nome dell\'assicurazione'),
  policy_number: z.string().min(1, 'Inserisci il numero della polizza'),
  policy_type: z.string().min(1, 'Seleziona il tipo di polizza'),
  claim_date: z.string().min(1, 'Inserisci la data del sinistro'),
  claim_amount: z.string().min(1, 'Inserisci l\'importo richiesto'),
  details: z.string().optional(),
});

const warrantySchema = z.object({
  product_name: z.string().min(1, 'Inserisci il nome del prodotto'),
  purchase_date: z.string().min(1, 'Inserisci la data di acquisto'),
  seller_name: z.string().min(1, 'Inserisci il nome del venditore'),
  issue_description: z.string().min(10, 'Descrivi il difetto (min. 10 caratteri)'),
  purchase_amount: z.string().optional(),
});

const telecomSchema = z.object({
  operator_name: z.string().min(1, 'Seleziona l\'operatore'),
  phone_number: z.string().min(1, 'Inserisci il numero di telefono'),
  issue_type: z.string().min(1, 'Seleziona il tipo di problema'),
  issue_date: z.string().min(1, 'Inserisci la data del problema'),
  amount: z.string().optional(),
  details: z.string().optional(),
});

const energySchema = z.object({
  supplier_name: z.string().min(1, 'Seleziona il fornitore'),
  contract_type: z.string().min(1, 'Seleziona il tipo di contratto'),
  issue_type: z.string().min(1, 'Seleziona il tipo di problema'),
  billing_period: z.string().min(1, 'Inserisci il periodo di fatturazione'),
  disputed_amount: z.string().optional(),
  pod_pdr: z.string().optional(),
});

const genericSchema = z.object({
  company_name: z.string().min(1, 'Inserisci il nome dell\'azienda'),
  issue_date: z.string().min(1, 'Inserisci la data del problema'),
  issue_description: z.string().min(10, 'Descrivi il problema (min. 10 caratteri)'),
  amount: z.string().optional(),
});

const getSchemaForCategory = (category: string) => {
  switch (category) {
    case 'flight': return flightSchema;
    case 'ecommerce': return ecommerceSchema;
    case 'bank': return bankSchema;
    case 'insurance': return insuranceSchema;
    case 'warranty': return warrantySchema;
    case 'telecom': return telecomSchema;
    case 'energy': return energySchema;
    default: return genericSchema;
  }
};

// Company names matching company_contacts table for proper lookup
const airlines = [
  'Ryanair', 'Wizz Air', 'ITA Airways', 'EasyJet', 'Vueling', 'Volotea', 'Altro'
];

const telecomOperators = ['TIM', 'Vodafone', 'WindTre', 'Fastweb', 'Iliad', 'Altro'];
const energySuppliers = ['Enel Energia', 'Eni Plenitude', 'A2A Energia', 'Hera Comm', 'Edison Energia', 'Altro'];
const banks = ['Intesa Sanpaolo', 'UniCredit', 'Banco BPM', 'Fineco', 'ING', 'Hype', 'Altro'];
const insurances = ['Generali', 'Allianz', 'UnipolSai', 'AXA', 'Altro'];
const ecommerceVendors = ['Amazon', 'Zalando', 'eBay', 'Shein', 'Temu', 'Altro'];

export default function DataCollectionForm({
  category,
  userOpportunityId,
  existingData,
  onComplete,
}: DataCollectionFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const schema = getSchemaForCategory(category);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: existingData as any || {},
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_opportunities')
        .update({ matched_data: data as any })
        .eq('id', userOpportunityId);

      if (error) throw error;

      setSaved(true);
      toast({
        title: 'Dati salvati!',
        description: 'I tuoi dati sono stati salvati correttamente',
      });
      onComplete(data);
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFlightForm = () => (
    <>
      <FormField
        control={form.control}
        name="airline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compagnia aerea</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona compagnia" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {airlines.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="flight_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numero volo</FormLabel>
            <FormControl>
              <Input placeholder="es: FR1234" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="flight_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data del volo</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="departure_airport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aeroporto partenza</FormLabel>
              <FormControl>
                <Input placeholder="es: FCO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="arrival_airport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aeroporto arrivo</FormLabel>
              <FormControl>
                <Input placeholder="es: MXP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di problema</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="delay_3h">Ritardo oltre 3 ore</SelectItem>
                <SelectItem value="cancelled">Volo cancellato</SelectItem>
                <SelectItem value="overbooking">Overbooking / Negato imbarco</SelectItem>
                <SelectItem value="luggage_delayed">Bagaglio in ritardo</SelectItem>
                <SelectItem value="luggage_lost">Bagaglio smarrito</SelectItem>
                <SelectItem value="luggage_damaged">Bagaglio danneggiato</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="delay_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ore di ritardo (se applicabile)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="es: 4" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderEcommerceForm = () => (
    <>
      <FormField
        control={form.control}
        name="seller_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venditore/Piattaforma</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona venditore" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ecommerceVendors.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="order_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numero ordine</FormLabel>
            <FormControl>
              <Input placeholder="es: 123-456789-0123456" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="order_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data ordine</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="product_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome prodotto</FormLabel>
            <FormControl>
              <Input placeholder="Descrivi il prodotto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="es: 99.99" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di problema</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="not_delivered">Prodotto non consegnato</SelectItem>
                <SelectItem value="wrong_product">Prodotto errato</SelectItem>
                <SelectItem value="defective">Prodotto difettoso</SelectItem>
                <SelectItem value="not_refunded">Reso non rimborsato</SelectItem>
                <SelectItem value="partial_refund">Rimborso parziale</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderBankForm = () => (
    <>
      <FormField
        control={form.control}
        name="bank_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome banca</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona banca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="account_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di conto</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="conto_corrente">Conto corrente</SelectItem>
                <SelectItem value="carta_credito">Carta di credito</SelectItem>
                <SelectItem value="mutuo">Mutuo</SelectItem>
                <SelectItem value="prestito">Prestito personale</SelectItem>
                <SelectItem value="investimenti">Conto investimenti</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di problema</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="commissioni_illegittime">Commissioni illegittime</SelectItem>
                <SelectItem value="anatocismo">Anatocismo</SelectItem>
                <SelectItem value="usura">Interessi usurari</SelectItem>
                <SelectItem value="cms_illegittima">CMS illegittima</SelectItem>
                <SelectItem value="doppio_addebito">Doppio addebito</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="period_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periodo da</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="period_end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periodo a</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="estimated_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo stimato (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Se conosciuto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dettagli aggiuntivi</FormLabel>
            <FormControl>
              <Textarea placeholder="Descrivi la situazione..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderTelecomForm = () => (
    <>
      <FormField
        control={form.control}
        name="operator_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operatore</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona operatore" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {telecomOperators.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numero di telefono</FormLabel>
            <FormControl>
              <Input placeholder="es: 3331234567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di problema</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fatturazione_errata">Fatturazione errata</SelectItem>
                <SelectItem value="servizi_non_richiesti">Servizi non richiesti</SelectItem>
                <SelectItem value="disservizio">Disservizio prolungato</SelectItem>
                <SelectItem value="penali_illegittime">Penali illegittime</SelectItem>
                <SelectItem value="portabilita">Problemi portabilità</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data del problema</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo contestato (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Se applicabile" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderEnergyForm = () => (
    <>
      <FormField
        control={form.control}
        name="supplier_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fornitore</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona fornitore" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {energySuppliers.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contract_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo contratto</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="luce">Luce</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="dual">Luce + Gas</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di problema</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="conguaglio_errato">Conguaglio errato</SelectItem>
                <SelectItem value="doppia_fatturazione">Doppia fatturazione</SelectItem>
                <SelectItem value="bonus_non_applicato">Bonus non applicato</SelectItem>
                <SelectItem value="contratto_non_richiesto">Contratto non richiesto</SelectItem>
                <SelectItem value="lettura_errata">Lettura errata</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="billing_period"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Periodo fatturazione</FormLabel>
            <FormControl>
              <Input placeholder="es: Gen-Mar 2024" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="disputed_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo contestato (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Se conosciuto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pod_pdr"
        render={({ field }) => (
          <FormItem>
            <FormLabel>POD/PDR (opzionale)</FormLabel>
            <FormControl>
              <Input placeholder="Codice punto di fornitura" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderInsuranceForm = () => (
    <>
      <FormField
        control={form.control}
        name="insurance_company"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compagnia assicurativa</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona compagnia" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {insurances.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="policy_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numero polizza</FormLabel>
            <FormControl>
              <Input placeholder="es: 123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="policy_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo polizza</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="auto">RC Auto</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="vita">Vita</SelectItem>
                <SelectItem value="salute">Salute</SelectItem>
                <SelectItem value="viaggio">Viaggio</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="claim_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data sinistro</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="claim_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo richiesto (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Importo del danno" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrizione sinistro</FormLabel>
            <FormControl>
              <Textarea placeholder="Descrivi cosa è successo..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderWarrantyForm = () => (
    <>
      <FormField
        control={form.control}
        name="product_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome prodotto</FormLabel>
            <FormControl>
              <Input placeholder="es: iPhone 14 Pro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="purchase_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data acquisto</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="seller_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venditore</FormLabel>
            <FormControl>
              <Input placeholder="es: MediaWorld, Amazon" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="purchase_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prezzo di acquisto (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="es: 599" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrizione del difetto</FormLabel>
            <FormControl>
              <Textarea placeholder="Descrivi il problema riscontrato..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderGenericForm = () => (
    <>
      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome azienda</FormLabel>
            <FormControl>
              <Input placeholder="Nome dell'azienda" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data del problema</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Importo (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Se applicabile" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="issue_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrizione del problema</FormLabel>
            <FormControl>
              <Textarea placeholder="Descrivi la situazione..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderFormFields = () => {
    switch (category) {
      case 'flight': return renderFlightForm();
      case 'ecommerce': return renderEcommerceForm();
      case 'bank': return renderBankForm();
      case 'insurance': return renderInsuranceForm();
      case 'warranty': return renderWarrantyForm();
      case 'telecom': return renderTelecomForm();
      case 'energy': return renderEnergyForm();
      default: return renderGenericForm();
    }
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Dati salvati!</h3>
        <p className="text-muted-foreground">
          Ora puoi generare la tua richiesta personalizzata
        </p>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Inserisci i tuoi dati
        </CardTitle>
        <CardDescription>
          Compila i campi per generare una richiesta personalizzata con i tuoi dati reali
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFormFields()}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva e continua'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
