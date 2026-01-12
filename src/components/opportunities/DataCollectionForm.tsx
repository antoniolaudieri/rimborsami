import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, HelpCircle, Lightbulb, Info } from 'lucide-react';
import { DocumentFormFiller } from './DocumentFormFiller';

interface DataCollectionFormProps {
  category: string;
  userOpportunityId: string;
  existingData?: Record<string, unknown>;
  onComplete: (data: Record<string, unknown>) => void;
  opportunityTitle?: string;
}

// Definizione campi dinamici per ogni categoria
interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  help?: string;
  tip?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: z.ZodTypeAny;
  gridSpan?: 1 | 2;
}

interface CategoryConfig {
  title: string;
  description: string;
  helpMessage: string;
  fields: FieldConfig[];
}

// Opzioni predefinite
const airlines = [
  { value: 'Ryanair', label: 'Ryanair' },
  { value: 'Wizz Air', label: 'Wizz Air' },
  { value: 'ITA Airways', label: 'ITA Airways' },
  { value: 'EasyJet', label: 'EasyJet' },
  { value: 'Vueling', label: 'Vueling' },
  { value: 'Volotea', label: 'Volotea' },
  { value: 'Lufthansa', label: 'Lufthansa' },
  { value: 'Air France', label: 'Air France' },
  { value: 'British Airways', label: 'British Airways' },
  { value: 'Altro', label: 'Altra compagnia' },
];

const flightIssueTypes = [
  { value: 'delay_3h', label: '✈️ Ritardo oltre 3 ore' },
  { value: 'cancelled', label: '❌ Volo cancellato' },
  { value: 'overbooking', label: '🚫 Overbooking / Negato imbarco' },
  { value: 'luggage_delayed', label: '🧳 Bagaglio in ritardo' },
  { value: 'luggage_lost', label: '📦 Bagaglio smarrito' },
  { value: 'luggage_damaged', label: '💔 Bagaglio danneggiato' },
];

const ecommerceVendors = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Zalando', label: 'Zalando' },
  { value: 'eBay', label: 'eBay' },
  { value: 'Shein', label: 'Shein' },
  { value: 'Temu', label: 'Temu' },
  { value: 'MediaWorld', label: 'MediaWorld' },
  { value: 'Unieuro', label: 'Unieuro' },
  { value: 'Altro', label: 'Altro venditore' },
];

const ecommerceIssueTypes = [
  { value: 'not_delivered', label: '📦 Prodotto non consegnato' },
  { value: 'wrong_product', label: '🔄 Prodotto errato' },
  { value: 'defective', label: '⚠️ Prodotto difettoso' },
  { value: 'not_refunded', label: '💰 Reso non rimborsato' },
  { value: 'partial_refund', label: '➗ Rimborso parziale' },
  { value: 'counterfeit', label: '🏷️ Prodotto contraffatto' },
];

const banks = [
  { value: 'Intesa Sanpaolo', label: 'Intesa Sanpaolo' },
  { value: 'UniCredit', label: 'UniCredit' },
  { value: 'Banco BPM', label: 'Banco BPM' },
  { value: 'Fineco', label: 'Fineco' },
  { value: 'ING', label: 'ING' },
  { value: 'Hype', label: 'Hype' },
  { value: 'N26', label: 'N26' },
  { value: 'Revolut', label: 'Revolut' },
  { value: 'BNL', label: 'BNL' },
  { value: 'Mediolanum', label: 'Mediolanum' },
  { value: 'Altro', label: 'Altra banca' },
];

const bankIssueTypes = [
  { value: 'commissioni_illegittime', label: '💳 Commissioni illegittime' },
  { value: 'anatocismo', label: '📈 Anatocismo (interessi su interessi)' },
  { value: 'usura', label: '⚠️ Interessi usurari' },
  { value: 'cms_illegittima', label: '📊 CMS illegittima' },
  { value: 'doppio_addebito', label: '💸 Doppio addebito' },
  { value: 'carta_clonata', label: '🔒 Carta clonata/frode' },
  { value: 'altro', label: '📋 Altro' },
];

const telecomOperators = [
  { value: 'TIM', label: 'TIM' },
  { value: 'Vodafone', label: 'Vodafone' },
  { value: 'WindTre', label: 'WindTre' },
  { value: 'Fastweb', label: 'Fastweb' },
  { value: 'Iliad', label: 'Iliad' },
  { value: 'PosteMobile', label: 'PosteMobile' },
  { value: 'Sky', label: 'Sky' },
  { value: 'Altro', label: 'Altro operatore' },
];

const telecomIssueTypes = [
  { value: 'fatturazione_errata', label: '📃 Fatturazione errata' },
  { value: 'servizi_non_richiesti', label: '🚫 Servizi non richiesti' },
  { value: 'disservizio', label: '📵 Disservizio prolungato' },
  { value: 'penali_illegittime', label: '⚖️ Penali illegittime' },
  { value: 'portabilita', label: '🔄 Problemi portabilità' },
  { value: 'fibra_non_attivata', label: '🌐 Fibra non attivata' },
];

const energySuppliers = [
  { value: 'Enel Energia', label: 'Enel Energia' },
  { value: 'Eni Plenitude', label: 'Eni Plenitude' },
  { value: 'A2A Energia', label: 'A2A Energia' },
  { value: 'Hera Comm', label: 'Hera Comm' },
  { value: 'Edison Energia', label: 'Edison Energia' },
  { value: 'Sorgenia', label: 'Sorgenia' },
  { value: 'Altro', label: 'Altro fornitore' },
];

const energyIssueTypes = [
  { value: 'conguaglio_errato', label: '📊 Conguaglio errato' },
  { value: 'doppia_fatturazione', label: '📄 Doppia fatturazione' },
  { value: 'bonus_non_applicato', label: '🎁 Bonus non applicato' },
  { value: 'contratto_non_richiesto', label: '📝 Contratto non richiesto' },
  { value: 'lettura_errata', label: '🔢 Lettura errata' },
  { value: 'voltura_negata', label: '🔄 Voltura/Subentro negato' },
];

const insurances = [
  { value: 'Generali', label: 'Generali' },
  { value: 'Allianz', label: 'Allianz' },
  { value: 'UnipolSai', label: 'UnipolSai' },
  { value: 'AXA', label: 'AXA' },
  { value: 'Zurich', label: 'Zurich' },
  { value: 'Cattolica', label: 'Cattolica' },
  { value: 'Altro', label: 'Altra compagnia' },
];

// Configurazione campi per categoria
const getCategoryConfig = (category: string, opportunityTitle?: string): CategoryConfig => {
  const configs: Record<string, CategoryConfig> = {
    flight: {
      title: '✈️ Dati del volo',
      description: 'Inserisci i dettagli del volo per cui richiedi il rimborso',
      helpMessage: 'Trovi queste informazioni nella conferma di prenotazione o carta d\'imbarco. Il numero del volo è composto da 2 lettere + numeri (es. FR1234).',
      fields: [
        {
          name: 'airline',
          label: 'Compagnia aerea',
          type: 'select',
          options: airlines,
          required: true,
          help: 'La compagnia con cui hai volato',
          tip: 'Seleziona la compagnia che ha operato il volo, non quella con cui hai prenotato',
        },
        {
          name: 'flight_number',
          label: 'Numero volo',
          type: 'text',
          placeholder: 'es: FR1234, AZ610',
          required: true,
          help: 'Codice identificativo del volo',
          tip: 'Lo trovi sulla carta d\'imbarco o email di conferma',
        },
        {
          name: 'flight_date',
          label: 'Data del volo',
          type: 'date',
          required: true,
          help: 'Quando doveva partire il volo',
        },
        {
          name: 'departure_airport',
          label: 'Aeroporto partenza',
          type: 'text',
          placeholder: 'es: Roma Fiumicino (FCO)',
          required: true,
          help: 'Aeroporto di partenza',
          tip: 'Puoi inserire nome o codice IATA',
          gridSpan: 1,
        },
        {
          name: 'arrival_airport',
          label: 'Aeroporto arrivo',
          type: 'text',
          placeholder: 'es: Milano Malpensa (MXP)',
          required: true,
          help: 'Aeroporto di destinazione',
          gridSpan: 1,
        },
        {
          name: 'issue_type',
          label: 'Tipo di problema',
          type: 'select',
          options: flightIssueTypes,
          required: true,
          help: 'Cosa è successo al tuo volo?',
        },
        {
          name: 'delay_hours',
          label: 'Ore di ritardo',
          type: 'number',
          placeholder: 'es: 4',
          help: 'Solo per ritardi: quante ore di ritardo?',
          tip: 'Per ritardi superiori a 3 ore hai diritto a €250-600',
        },
        {
          name: 'booking_reference',
          label: 'Codice prenotazione (PNR)',
          type: 'text',
          placeholder: 'es: ABC123',
          help: 'Codice di 6 caratteri della prenotazione',
          tip: 'Lo trovi nell\'email di conferma della prenotazione',
        },
      ],
    },
    ecommerce: {
      title: '🛒 Dati dell\'ordine',
      description: 'Inserisci i dettagli dell\'acquisto online',
      helpMessage: 'Recupera numero ordine e importo dall\'email di conferma dell\'acquisto o dal tuo account sul sito.',
      fields: [
        {
          name: 'seller_name',
          label: 'Venditore / Piattaforma',
          type: 'select',
          options: ecommerceVendors,
          required: true,
          help: 'Dove hai effettuato l\'acquisto?',
        },
        {
          name: 'order_number',
          label: 'Numero ordine',
          type: 'text',
          placeholder: 'es: 123-4567890-1234567',
          required: true,
          help: 'Codice identificativo dell\'ordine',
          tip: 'Lo trovi nell\'email di conferma ordine',
        },
        {
          name: 'order_date',
          label: 'Data ordine',
          type: 'date',
          required: true,
          help: 'Quando hai effettuato l\'acquisto',
        },
        {
          name: 'product_name',
          label: 'Prodotto acquistato',
          type: 'text',
          placeholder: 'es: Smartphone Samsung Galaxy S24',
          required: true,
          help: 'Nome del prodotto',
        },
        {
          name: 'amount',
          label: 'Importo pagato (€)',
          type: 'number',
          placeholder: 'es: 299.99',
          required: true,
          help: 'Quanto hai pagato',
        },
        {
          name: 'issue_type',
          label: 'Tipo di problema',
          type: 'select',
          options: ecommerceIssueTypes,
          required: true,
          help: 'Cosa è successo?',
        },
        {
          name: 'issue_description',
          label: 'Descrizione del problema',
          type: 'textarea',
          placeholder: 'Descrivi nel dettaglio cosa è successo...',
          help: 'Più dettagli fornisci, più efficace sarà la richiesta',
          tip: 'Includi date, comunicazioni con il venditore e tentativi di risoluzione',
        },
      ],
    },
    bank: {
      title: '🏦 Dati bancari',
      description: 'Inserisci i dettagli del tuo rapporto bancario',
      helpMessage: 'Trovi questi dati negli estratti conto o nel contratto. Il periodo è importante per calcolare il rimborso.',
      fields: [
        {
          name: 'bank_name',
          label: 'Banca',
          type: 'select',
          options: banks,
          required: true,
          help: 'La tua banca',
        },
        {
          name: 'account_type',
          label: 'Tipo di rapporto',
          type: 'select',
          options: [
            { value: 'conto_corrente', label: '💳 Conto corrente' },
            { value: 'carta_credito', label: '💰 Carta di credito' },
            { value: 'mutuo', label: '🏠 Mutuo' },
            { value: 'prestito', label: '📋 Prestito personale' },
            { value: 'investimenti', label: '📈 Conto investimenti' },
          ],
          required: true,
          help: 'Tipo di prodotto bancario',
        },
        {
          name: 'issue_type',
          label: 'Tipo di problema',
          type: 'select',
          options: bankIssueTypes,
          required: true,
          help: 'Motivo del reclamo',
        },
        {
          name: 'period_start',
          label: 'Periodo da',
          type: 'date',
          required: true,
          help: 'Inizio del periodo contestato',
          gridSpan: 1,
        },
        {
          name: 'period_end',
          label: 'Periodo a',
          type: 'date',
          required: true,
          help: 'Fine del periodo contestato',
          gridSpan: 1,
        },
        {
          name: 'estimated_amount',
          label: 'Importo contestato (€)',
          type: 'number',
          placeholder: 'Se conosciuto',
          help: 'Importo delle commissioni/interessi illegittimi',
          tip: 'Anche un importo approssimativo va bene',
        },
        {
          name: 'account_number',
          label: 'IBAN o numero conto',
          type: 'text',
          placeholder: 'es: IT60X0542811101000000123456',
          help: 'Per identificare il rapporto',
        },
        {
          name: 'details',
          label: 'Dettagli aggiuntivi',
          type: 'textarea',
          placeholder: 'Descrivi la situazione...',
          help: 'Eventuali dettagli utili',
        },
      ],
    },
    telecom: {
      title: '📱 Dati telecomunicazioni',
      description: 'Inserisci i dettagli del tuo contratto telefonico/internet',
      helpMessage: 'Numero di telefono e data del problema sono fondamentali. L\'importo lo trovi sulle fatture.',
      fields: [
        {
          name: 'operator_name',
          label: 'Operatore',
          type: 'select',
          options: telecomOperators,
          required: true,
          help: 'Il tuo operatore telefonico/internet',
        },
        {
          name: 'phone_number',
          label: 'Numero di telefono',
          type: 'text',
          placeholder: 'es: 3331234567',
          required: true,
          help: 'Numero associato al problema',
          tip: 'Se riguarda la linea fissa, inserisci quel numero',
        },
        {
          name: 'issue_type',
          label: 'Tipo di problema',
          type: 'select',
          options: telecomIssueTypes,
          required: true,
          help: 'Cosa è successo?',
        },
        {
          name: 'issue_date',
          label: 'Data del problema',
          type: 'date',
          required: true,
          help: 'Quando è iniziato il problema',
        },
        {
          name: 'amount',
          label: 'Importo contestato (€)',
          type: 'number',
          placeholder: 'Se applicabile',
          help: 'Importo addebitato ingiustamente',
        },
        {
          name: 'contract_code',
          label: 'Codice cliente/contratto',
          type: 'text',
          placeholder: 'es: CL123456789',
          help: 'Lo trovi sulle fatture',
        },
        {
          name: 'details',
          label: 'Descrizione del problema',
          type: 'textarea',
          placeholder: 'Descrivi cosa è successo...',
          help: 'Dettagli del disservizio o addebito',
        },
      ],
    },
    energy: {
      title: '⚡ Dati fornitura energia',
      description: 'Inserisci i dettagli della tua fornitura luce/gas',
      helpMessage: 'POD (luce) e PDR (gas) sono codici univoci sulla bolletta. Il periodo di fatturazione è nelle prime pagine.',
      fields: [
        {
          name: 'supplier_name',
          label: 'Fornitore',
          type: 'select',
          options: energySuppliers,
          required: true,
          help: 'Il tuo fornitore di energia',
        },
        {
          name: 'contract_type',
          label: 'Tipo fornitura',
          type: 'select',
          options: [
            { value: 'luce', label: '💡 Luce' },
            { value: 'gas', label: '🔥 Gas' },
            { value: 'dual', label: '⚡ Luce + Gas' },
          ],
          required: true,
          help: 'Tipo di contratto',
        },
        {
          name: 'issue_type',
          label: 'Tipo di problema',
          type: 'select',
          options: energyIssueTypes,
          required: true,
          help: 'Motivo del reclamo',
        },
        {
          name: 'billing_period',
          label: 'Periodo fatturazione',
          type: 'text',
          placeholder: 'es: Gennaio - Marzo 2024',
          required: true,
          help: 'Periodo contestato',
        },
        {
          name: 'disputed_amount',
          label: 'Importo contestato (€)',
          type: 'number',
          placeholder: 'Se conosciuto',
          help: 'Importo della bolletta contestata',
        },
        {
          name: 'pod_pdr',
          label: 'Codice POD/PDR',
          type: 'text',
          placeholder: 'es: IT001E12345678',
          help: 'Codice punto di fornitura',
          tip: 'POD per luce (IT001E...), PDR per gas (numeri)',
        },
        {
          name: 'details',
          label: 'Dettagli aggiuntivi',
          type: 'textarea',
          placeholder: 'Descrivi il problema...',
          help: 'Eventuali dettagli utili',
        },
      ],
    },
    insurance: {
      title: '🛡️ Dati assicurativi',
      description: 'Inserisci i dettagli della tua polizza',
      helpMessage: 'Numero polizza e data sinistro sono sulla documentazione della compagnia.',
      fields: [
        {
          name: 'insurance_company',
          label: 'Compagnia assicurativa',
          type: 'select',
          options: insurances,
          required: true,
          help: 'La tua compagnia assicurativa',
        },
        {
          name: 'policy_number',
          label: 'Numero polizza',
          type: 'text',
          placeholder: 'es: 123456789',
          required: true,
          help: 'Numero della polizza',
          tip: 'Lo trovi sul contratto o certificato',
        },
        {
          name: 'policy_type',
          label: 'Tipo polizza',
          type: 'select',
          options: [
            { value: 'auto', label: '🚗 RC Auto' },
            { value: 'casa', label: '🏠 Casa' },
            { value: 'vita', label: '❤️ Vita' },
            { value: 'salute', label: '🏥 Salute' },
            { value: 'viaggio', label: '✈️ Viaggio' },
            { value: 'altro', label: '📋 Altro' },
          ],
          required: true,
          help: 'Tipo di assicurazione',
        },
        {
          name: 'claim_date',
          label: 'Data sinistro/evento',
          type: 'date',
          required: true,
          help: 'Quando è avvenuto il sinistro',
        },
        {
          name: 'claim_amount',
          label: 'Importo richiesto (€)',
          type: 'number',
          placeholder: 'Importo del danno',
          required: true,
          help: 'Valore del risarcimento richiesto',
        },
        {
          name: 'details',
          label: 'Descrizione dell\'evento',
          type: 'textarea',
          placeholder: 'Descrivi cosa è successo...',
          help: 'Dettagli del sinistro',
        },
      ],
    },
    warranty: {
      title: '📦 Dati prodotto in garanzia',
      description: 'Inserisci i dettagli del prodotto difettoso',
      helpMessage: 'La garanzia legale è di 2 anni. Conserva scontrino e documentazione d\'acquisto.',
      fields: [
        {
          name: 'product_name',
          label: 'Nome prodotto',
          type: 'text',
          placeholder: 'es: Lavatrice Samsung WW90...',
          required: true,
          help: 'Prodotto difettoso',
        },
        {
          name: 'purchase_date',
          label: 'Data acquisto',
          type: 'date',
          required: true,
          help: 'Quando hai comprato il prodotto',
          tip: 'La garanzia legale dura 2 anni dall\'acquisto',
        },
        {
          name: 'seller_name',
          label: 'Venditore',
          type: 'text',
          placeholder: 'es: MediaWorld, Unieuro...',
          required: true,
          help: 'Dove hai acquistato',
        },
        {
          name: 'purchase_amount',
          label: 'Prezzo pagato (€)',
          type: 'number',
          placeholder: 'es: 599.99',
          help: 'Importo dell\'acquisto',
        },
        {
          name: 'issue_description',
          label: 'Descrizione del difetto',
          type: 'textarea',
          placeholder: 'Descrivi il difetto nel dettaglio...',
          required: true,
          help: 'Cosa non funziona?',
          tip: 'Sii specifico: quando è comparso il difetto, come si manifesta',
        },
      ],
    },
    class_action: {
      title: '⚖️ Adesione ad azione collettiva',
      description: 'Inserisci i tuoi dati per aderire',
      helpMessage: 'Per le azioni collettive servono dati che dimostrano il tuo diritto a partecipare.',
      fields: [
        {
          name: 'full_name',
          label: 'Nome e Cognome',
          type: 'text',
          placeholder: 'es: Mario Rossi',
          required: true,
          help: 'Il tuo nome completo',
        },
        {
          name: 'fiscal_code',
          label: 'Codice Fiscale',
          type: 'text',
          placeholder: 'es: RSSMRA80A01H501U',
          required: true,
          help: 'Il tuo codice fiscale',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'text',
          placeholder: 'es: mario.rossi@email.it',
          required: true,
          help: 'Per comunicazioni sull\'azione',
        },
        {
          name: 'phone',
          label: 'Telefono',
          type: 'text',
          placeholder: 'es: 3331234567',
          help: 'Numero di telefono',
        },
        {
          name: 'affected_period',
          label: 'Periodo interessato',
          type: 'text',
          placeholder: 'es: 2020-2023',
          help: 'Quando sei stato cliente/utente',
        },
        {
          name: 'proof_description',
          label: 'Documentazione in possesso',
          type: 'textarea',
          placeholder: 'Descrivi i documenti che hai...',
          help: 'Quali prove puoi fornire?',
          tip: 'Es: estratti conto, contratti, fatture, email',
        },
      ],
    },
  };

  // Default config per categorie non mappate
  const defaultConfig: CategoryConfig = {
    title: '📋 Dati della richiesta',
    description: opportunityTitle ? `Inserisci i dati per: ${opportunityTitle}` : 'Inserisci i dati necessari per la tua richiesta',
    helpMessage: 'Fornisci tutti i dettagli disponibili per rendere la richiesta più efficace.',
    fields: [
      {
        name: 'company_name',
        label: 'Azienda/Ente interessato',
        type: 'text',
        placeholder: 'Nome dell\'azienda',
        required: true,
        help: 'L\'azienda a cui inviare la richiesta',
      },
      {
        name: 'issue_date',
        label: 'Data del problema',
        type: 'date',
        required: true,
        help: 'Quando è avvenuto il problema',
      },
      {
        name: 'reference_number',
        label: 'Numero di riferimento',
        type: 'text',
        placeholder: 'es: ordine, contratto, pratica...',
        help: 'Qualsiasi codice identificativo',
      },
      {
        name: 'amount',
        label: 'Importo (€)',
        type: 'number',
        placeholder: 'Se applicabile',
        help: 'Importo coinvolto',
      },
      {
        name: 'issue_description',
        label: 'Descrizione del problema',
        type: 'textarea',
        placeholder: 'Descrivi nel dettaglio la situazione...',
        required: true,
        help: 'Spiega cosa è successo',
      },
    ],
  };

  return configs[category] || defaultConfig;
};

// Genera schema Zod dinamico
const generateSchema = (fields: FieldConfig[]) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    let validator: z.ZodTypeAny;

    if (field.type === 'number') {
      validator = z.string().optional();
    } else if (field.type === 'date') {
      validator = field.required
        ? z.string().min(1, `${field.label} è obbligatorio`)
        : z.string().optional();
    } else if (field.type === 'textarea') {
      validator = field.required
        ? z.string().min(10, `${field.label} richiede almeno 10 caratteri`)
        : z.string().optional();
    } else {
      validator = field.required
        ? z.string().min(1, `${field.label} è obbligatorio`)
        : z.string().optional();
    }

    schemaFields[field.name] = validator;
  });

  return z.object(schemaFields);
};

export default function DataCollectionForm({
  category,
  userOpportunityId,
  existingData,
  onComplete,
  opportunityTitle,
}: DataCollectionFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = useMemo(() => getCategoryConfig(category, opportunityTitle), [category, opportunityTitle]);
  const schema = useMemo(() => generateSchema(config.fields), [config.fields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: (existingData as Record<string, string>) || {},
  });

  // Estrai il nome dell'azienda in base alla categoria
  const extractCompanyName = (data: Record<string, unknown>, cat: string): string | null => {
    const companyFields: Record<string, string> = {
      flight: 'airline',
      ecommerce: 'seller_name',
      bank: 'bank_name',
      telecom: 'operator_name',
      energy: 'supplier_name',
      insurance: 'insurance_company',
      warranty: 'seller_name',
      transport: 'company_name',
      automotive: 'company_name',
      tech: 'company_name',
      class_action: 'company_name',
      other: 'company_name',
    };
    
    const fieldName = companyFields[cat];
    if (fieldName && data[fieldName]) {
      return String(data[fieldName]);
    }
    return null;
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      // Estrai e salva il nome dell'azienda in un campo standardizzato
      const companyName = extractCompanyName(data, category);
      const dataWithCompany = {
        ...data,
        ...(companyName && { company_name: companyName }),
      };

      const { error } = await supabase
        .from('user_opportunities')
        .update({ matched_data: dataWithCompany as any })
        .eq('id', userOpportunityId);

      if (error) throw error;

      setSaved(true);
      toast({
        title: 'Dati salvati!',
        description: 'Ora puoi generare la richiesta',
      });
      onComplete(dataWithCompany);
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

  // Handle data extracted from document OCR
  const handleDataExtracted = useCallback((extractedData: Record<string, string>) => {
    // Update form fields with extracted data
    Object.entries(extractedData).forEach(([key, value]) => {
      if (value && config.fields.some(f => f.name === key)) {
        form.setValue(key, value, { shouldValidate: true });
      }
    });
  }, [form, config.fields]);

  const renderField = (field: FieldConfig) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.gridSpan === 1 ? '' : 'col-span-2 md:col-span-1'}>
            <div className="flex items-center gap-2">
              <FormLabel className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </FormLabel>
              {field.tip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{field.tip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <FormControl>
              {field.type === 'select' ? (
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Seleziona ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea 
                  placeholder={field.placeholder} 
                  {...formField} 
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
            </FormControl>
            {field.help && (
              <FormDescription className="text-xs">
                {field.help}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700">Dati salvati con successo!</h3>
            <p className="text-green-600 mt-2">
              Vai alla scheda "Richiesta" per generare il documento
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document OCR upload for auto-fill */}
          <DocumentFormFiller 
            category={category} 
            onDataExtracted={handleDataExtracted}
          />

          {/* Help message */}
          <Alert className="bg-primary/5 border-primary/20">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              {config.helpMessage}
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields.map(renderField)}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  I campi con * sono obbligatori
                </p>
                <Button type="submit" disabled={saving} size="lg">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Salva e continua
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
