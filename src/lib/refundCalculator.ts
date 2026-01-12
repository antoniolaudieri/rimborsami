/**
 * Realistic Refund Calculator
 * Based on official rates from Banca d'Italia and EU regulations
 */

// Tassi soglia usura Q2 2025 (Banca d'Italia - D.M. 31/03/2025)
export const USURY_THRESHOLDS: Record<string, { tegm: number; soglia: number; label: string }> = {
  mutuo_fisso: { tegm: 3.35, soglia: 8.1875, label: 'Mutuo a tasso fisso' },
  mutuo_variabile: { tegm: 4.92, soglia: 10.15, label: 'Mutuo a tasso variabile' },
  credito_personale: { tegm: 10.90, soglia: 17.625, label: 'Credito personale' },
  carta_revolving: { tegm: 15.36, soglia: 23.20, label: 'Carta di credito revolving' },
  fido_5000: { tegm: 10.35, soglia: 16.9375, label: 'Apertura credito fino a €5.000' },
  fido_oltre_5000: { tegm: 9.24, soglia: 15.55, label: 'Apertura credito oltre €5.000' },
  credito_finalizzato: { tegm: 10.36, soglia: 16.95, label: 'Credito finalizzato' },
  cessione_quinto: { tegm: 9.89, soglia: 16.3625, label: 'Cessione del quinto' },
  leasing: { tegm: 5.67, soglia: 11.0875, label: 'Leasing' },
  factoring: { tegm: 5.88, soglia: 11.35, label: 'Factoring' },
  prestito: { tegm: 10.90, soglia: 17.625, label: 'Prestito' },
};

// EU Flight Compensation (Reg. CE 261/2004)
export const FLIGHT_COMPENSATION = {
  short: { maxKm: 1500, amount: 250, label: 'Tratta breve (fino a 1.500 km)' },
  medium: { maxKm: 3500, amount: 400, label: 'Tratta media (1.500-3.500 km)' },
  long: { maxKm: Infinity, amount: 600, label: 'Tratta lunga (oltre 3.500 km)' },
};

export interface RefundEstimate {
  amount: number;
  formula: string;
  legalReference: string;
  confidence: 'high' | 'medium' | 'low';
  breakdown?: RefundBreakdownItem[];
  source?: string;
  validPeriod?: string;
}

export interface RefundBreakdownItem {
  label: string;
  value: string | number;
  unit?: string;
}

/**
 * Calculate bank refund for usury (tassi usurari)
 */
export function calculateBankUsury(params: {
  taegApplicato: number;
  tipoProdotto: string;
  interessiTotali: number;
  capitale?: number;
  periodoMesi?: number;
}): RefundEstimate {
  // Find the matching product type
  const productKey = Object.keys(USURY_THRESHOLDS).find(
    key => params.tipoProdotto.toLowerCase().includes(key.replace('_', ' ')) ||
           key.includes(params.tipoProdotto.toLowerCase().replace(' ', '_'))
  ) || 'credito_personale'; // Default to personal credit if unknown

  const threshold = USURY_THRESHOLDS[productKey];
  
  if (params.taegApplicato <= threshold.soglia) {
    return {
      amount: 0,
      formula: `TAEG ${params.taegApplicato}% ≤ Soglia usura ${threshold.soglia}%`,
      legalReference: 'Art. 1815 c.c., L. 108/1996',
      confidence: 'high',
      breakdown: [
        { label: 'TAEG applicato', value: params.taegApplicato, unit: '%' },
        { label: 'TEGM di riferimento', value: threshold.tegm, unit: '%' },
        { label: 'Soglia usura', value: threshold.soglia, unit: '%' },
        { label: 'Esito', value: 'Non usurario' },
      ],
      source: 'Banca d\'Italia - D.M. 31/03/2025',
      validPeriod: 'Q2 2025 (1 aprile - 30 giugno)',
    };
  }

  // Formula: Rimborso = Interessi × ((TAEG - Soglia) / TAEG)
  // This represents the portion of interest that exceeds the legal threshold
  const eccedenzaPercentuale = (params.taegApplicato - threshold.soglia) / params.taegApplicato;
  const rimborso = params.interessiTotali * eccedenzaPercentuale;

  return {
    amount: Math.round(rimborso * 100) / 100,
    formula: `€${params.interessiTotali.toLocaleString('it-IT')} × ((${params.taegApplicato}% - ${threshold.soglia}%) / ${params.taegApplicato}%)`,
    legalReference: 'Art. 1815 c.c. - In caso di usura, non sono dovuti interessi',
    confidence: 'high',
    breakdown: [
      { label: 'Tipo prodotto', value: threshold.label },
      { label: 'TAEG applicato', value: params.taegApplicato, unit: '%' },
      { label: 'TEGM di riferimento', value: threshold.tegm, unit: '%' },
      { label: 'Soglia usura (TEGM × 1.25 + 4%)', value: threshold.soglia, unit: '%' },
      { label: 'Eccedenza', value: `${(eccedenzaPercentuale * 100).toFixed(2)}%` },
      { label: 'Interessi pagati', value: `€${params.interessiTotali.toLocaleString('it-IT')}` },
      { label: 'Rimborso calcolato', value: `€${rimborso.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
    ],
    source: 'Banca d\'Italia - D.M. 31/03/2025',
    validPeriod: 'Q2 2025 (1 aprile - 30 giugno)',
  };
}

/**
 * Calculate flight compensation under EU Regulation 261/2004
 */
export function calculateFlightCompensation(params: {
  distanzaKm: number;
  ritardoOre: number;
  cancellato: boolean;
  preavvisoGiorni?: number;
}): RefundEstimate {
  // Check if flight qualifies for compensation
  if (!params.cancellato && params.ritardoOre < 3) {
    return {
      amount: 0,
      formula: 'Ritardo inferiore a 3 ore',
      legalReference: 'Reg. CE 261/2004 - Art. 7',
      confidence: 'high',
      breakdown: [
        { label: 'Ritardo', value: params.ritardoOre, unit: 'ore' },
        { label: 'Soglia minima', value: 3, unit: 'ore' },
        { label: 'Esito', value: 'Non compensabile' },
      ],
    };
  }

  // If cancelled with sufficient notice, no compensation
  if (params.cancellato && params.preavvisoGiorni && params.preavvisoGiorni >= 14) {
    return {
      amount: 0,
      formula: 'Preavviso superiore a 14 giorni',
      legalReference: 'Reg. CE 261/2004 - Art. 5(1)(c)',
      confidence: 'high',
      breakdown: [
        { label: 'Preavviso ricevuto', value: params.preavvisoGiorni, unit: 'giorni' },
        { label: 'Soglia esenzione', value: 14, unit: 'giorni' },
        { label: 'Esito', value: 'Compagnia esente' },
      ],
    };
  }

  // Determine compensation based on distance
  let compensation = FLIGHT_COMPENSATION.short;
  if (params.distanzaKm > 1500 && params.distanzaKm <= 3500) {
    compensation = FLIGHT_COMPENSATION.medium;
  } else if (params.distanzaKm > 3500) {
    compensation = FLIGHT_COMPENSATION.long;
  }

  let amount = compensation.amount;

  // 50% reduction for delays between 3-4 hours on long-haul flights
  if (!params.cancellato && params.ritardoOre >= 3 && params.ritardoOre < 4 && params.distanzaKm > 3500) {
    amount = amount * 0.5;
  }

  return {
    amount,
    formula: `Distanza ${params.distanzaKm.toLocaleString('it-IT')} km → Compensazione €${amount}`,
    legalReference: 'Reg. CE 261/2004 - Art. 7',
    confidence: 'high',
    breakdown: [
      { label: 'Distanza volo', value: params.distanzaKm.toLocaleString('it-IT'), unit: 'km' },
      { label: 'Fascia', value: compensation.label },
      { label: params.cancellato ? 'Volo cancellato' : 'Ritardo all\'arrivo', value: params.cancellato ? 'Sì' : `${params.ritardoOre} ore` },
      { label: 'Compensazione base', value: `€${compensation.amount}` },
      { label: 'Compensazione finale', value: `€${amount}` },
    ],
    source: 'Regolamento CE 261/2004',
  };
}

/**
 * Calculate fine/multa refund for successful appeal
 */
export function calculateFineRefund(params: {
  importoMulta: number;
  speseNotifica?: number;
  probabilitaAccoglimento: 'alta' | 'media' | 'bassa';
}): RefundEstimate {
  const speseNotifica = params.speseNotifica || 15;
  const totalePotenziale = params.importoMulta + speseNotifica;

  const probabilitaMap = {
    alta: { factor: 1, label: 'Alta (>70%)', confidence: 'high' as const },
    media: { factor: 0.5, label: 'Media (40-70%)', confidence: 'medium' as const },
    bassa: { factor: 0.3, label: 'Bassa (<40%)', confidence: 'low' as const },
  };

  const prob = probabilitaMap[params.probabilitaAccoglimento];
  const stimaRimborso = totalePotenziale * prob.factor;

  return {
    amount: Math.round(stimaRimborso * 100) / 100,
    formula: `(€${params.importoMulta} + €${speseNotifica}) × ${(prob.factor * 100)}%`,
    legalReference: 'Art. 203 CdS, L. 689/1981',
    confidence: prob.confidence,
    breakdown: [
      { label: 'Importo multa', value: `€${params.importoMulta.toLocaleString('it-IT')}` },
      { label: 'Spese notifica', value: `€${speseNotifica}` },
      { label: 'Totale potenziale', value: `€${totalePotenziale.toLocaleString('it-IT')}` },
      { label: 'Probabilità accoglimento', value: prob.label },
      { label: 'Stima rimborso ponderata', value: `€${stimaRimborso.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
    ],
  };
}

/**
 * Calculate work-related refund (unpaid overtime, TFR, etc.)
 */
export function calculateWorkRefund(params: {
  tipo: 'straordinario' | 'tfr' | 'differenze_retributive';
  retribuzioneMensile: number;
  oreStraordinario?: number;
  pagaOraria?: number;
  anniServizio?: number;
  mesiContestati?: number;
  importoMensileContestato?: number;
}): RefundEstimate {
  if (params.tipo === 'straordinario') {
    const pagaOraria = params.pagaOraria || (params.retribuzioneMensile / 173); // 40h/week * 4.33
    const maggiorazione = 1.25; // 25% base overtime
    const importoOrario = pagaOraria * maggiorazione;
    const totale = importoOrario * (params.oreStraordinario || 0);

    return {
      amount: Math.round(totale * 100) / 100,
      formula: `€${pagaOraria.toFixed(2)}/h × 1.25 × ${params.oreStraordinario} ore`,
      legalReference: 'CCNL di riferimento, Art. 2108 c.c.',
      confidence: 'medium',
      breakdown: [
        { label: 'Paga oraria base', value: `€${pagaOraria.toFixed(2)}` },
        { label: 'Maggiorazione straordinario', value: '25%' },
        { label: 'Paga oraria straordinario', value: `€${importoOrario.toFixed(2)}` },
        { label: 'Ore non pagate', value: params.oreStraordinario || 0, unit: 'ore' },
        { label: 'Totale dovuto', value: `€${totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
      ],
    };
  }

  if (params.tipo === 'tfr') {
    const retribuzioneAnnua = params.retribuzioneMensile * 13; // Including 13th month
    const tfr = (retribuzioneAnnua / 13.5) * (params.anniServizio || 1);

    return {
      amount: Math.round(tfr * 100) / 100,
      formula: `(€${params.retribuzioneMensile} × 13) / 13.5 × ${params.anniServizio} anni`,
      legalReference: 'Art. 2120 c.c.',
      confidence: 'high',
      breakdown: [
        { label: 'Retribuzione mensile', value: `€${params.retribuzioneMensile.toLocaleString('it-IT')}` },
        { label: 'Retribuzione annua (con 13ª)', value: `€${retribuzioneAnnua.toLocaleString('it-IT')}` },
        { label: 'Divisore TFR', value: 13.5 },
        { label: 'Anni di servizio', value: params.anniServizio || 1 },
        { label: 'TFR maturato', value: `€${tfr.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
      ],
    };
  }

  if (params.tipo === 'differenze_retributive') {
    const totale = (params.importoMensileContestato || 0) * (params.mesiContestati || 1);

    return {
      amount: Math.round(totale * 100) / 100,
      formula: `€${params.importoMensileContestato}/mese × ${params.mesiContestati} mesi`,
      legalReference: 'CCNL di riferimento, Art. 2103 c.c.',
      confidence: 'medium',
      breakdown: [
        { label: 'Differenza mensile', value: `€${params.importoMensileContestato?.toLocaleString('it-IT')}` },
        { label: 'Mesi contestati', value: params.mesiContestati || 1 },
        { label: 'Totale differenze', value: `€${totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
      ],
    };
  }

  return {
    amount: 0,
    formula: 'Tipo non riconosciuto',
    legalReference: '',
    confidence: 'low',
  };
}

/**
 * Calculate condominium-related refund
 */
export function calculateCondominiumRefund(params: {
  tipo: 'impugnazione_delibera' | 'spese_illegittime' | 'rivalsa_amministratore';
  importoContestato?: number;
  complessita?: 'semplice' | 'media' | 'complessa';
}): RefundEstimate {
  if (params.tipo === 'impugnazione_delibera') {
    const speseLegali = {
      semplice: { min: 500, max: 1000 },
      media: { min: 1000, max: 1500 },
      complessa: { min: 1500, max: 2500 },
    };
    
    const comp = params.complessita || 'media';
    const spese = speseLegali[comp];
    const media = (spese.min + spese.max) / 2;

    return {
      amount: media,
      formula: `Spese legali impugnazione: €${spese.min}-${spese.max}`,
      legalReference: 'Art. 1137 c.c., D.M. 55/2014 (Parametri forensi)',
      confidence: 'medium',
      breakdown: [
        { label: 'Tipo procedura', value: 'Impugnazione delibera' },
        { label: 'Complessità', value: comp.charAt(0).toUpperCase() + comp.slice(1) },
        { label: 'Spese legali minime', value: `€${spese.min}` },
        { label: 'Spese legali massime', value: `€${spese.max}` },
        { label: 'Termine per impugnazione', value: '30 giorni', unit: 'dalla delibera' },
      ],
    };
  }

  if (params.tipo === 'spese_illegittime') {
    return {
      amount: params.importoContestato || 0,
      formula: `Rimborso 100% spese illegittime: €${params.importoContestato}`,
      legalReference: 'Art. 1130-bis c.c., Art. 1135 c.c.',
      confidence: 'high',
      breakdown: [
        { label: 'Importo contestato', value: `€${(params.importoContestato || 0).toLocaleString('it-IT')}` },
        { label: 'Percentuale recuperabile', value: '100%' },
        { label: 'Rimborso', value: `€${(params.importoContestato || 0).toLocaleString('it-IT')}` },
      ],
    };
  }

  return {
    amount: params.importoContestato || 0,
    formula: `Rivalsa su amministratore: €${params.importoContestato}`,
    legalReference: 'Art. 1218 c.c., Art. 1129 c.c.',
    confidence: 'medium',
    breakdown: [
      { label: 'Danni documentati', value: `€${(params.importoContestato || 0).toLocaleString('it-IT')}` },
    ],
  };
}

/**
 * Get the usury threshold for a product type
 */
export function getUsuryThreshold(productType: string): { tegm: number; soglia: number; label: string } | null {
  const normalizedType = productType.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  for (const [key, value] of Object.entries(USURY_THRESHOLDS)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value;
    }
  }
  
  // Default to personal credit if we can detect it's a bank product
  if (normalizedType.includes('credit') || normalizedType.includes('prest') || normalizedType.includes('finanziament')) {
    return USURY_THRESHOLDS.credito_personale;
  }
  
  return null;
}

/**
 * Calculate refund from BankAnalysis data
 */
export function calculateRefundFromBankAnalysis(analysis: {
  taeg?: number;
  tan?: number;
  accountType?: string;
  totalInterest?: number;
  totalFees?: number;
  suspiciousRates?: Array<{ description: string; value: number }>;
  usuriousRates?: Array<{ description: string; value: number; threshold: number }>;
  estimatedRefund?: number;
}): RefundEstimate {
  // If we have usurious rates detected, calculate based on those
  if (analysis.usuriousRates && analysis.usuriousRates.length > 0) {
    const usury = analysis.usuriousRates[0];
    const taeg = usury.value;
    const soglia = usury.threshold;
    
    // Calculate interest paid (estimate if not available)
    const interessiTotali = analysis.totalInterest || analysis.estimatedRefund || 0;
    
    if (interessiTotali > 0 && taeg > soglia) {
      const eccedenza = (taeg - soglia) / taeg;
      const rimborso = interessiTotali * eccedenza;
      
      return {
        amount: Math.round(rimborso * 100) / 100,
        formula: `€${interessiTotali.toLocaleString('it-IT')} × ((${taeg}% - ${soglia}%) / ${taeg}%)`,
        legalReference: 'Art. 1815 c.c. - Interessi usurari nulli',
        confidence: 'high',
        breakdown: [
          { label: 'Tasso applicato', value: taeg, unit: '%' },
          { label: 'Soglia usura', value: soglia, unit: '%' },
          { label: 'Eccedenza percentuale', value: `${(eccedenza * 100).toFixed(2)}%` },
          { label: 'Interessi totali pagati', value: `€${interessiTotali.toLocaleString('it-IT')}` },
          { label: 'Rimborso calcolato', value: `€${rimborso.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` },
        ],
        source: 'Banca d\'Italia - Tassi soglia usura',
      };
    }
  }

  // If we have a TAEG, check against thresholds
  if (analysis.taeg) {
    const threshold = getUsuryThreshold(analysis.accountType || 'credito_personale');
    if (threshold && analysis.taeg > threshold.soglia) {
      const interessiTotali = analysis.totalInterest || analysis.estimatedRefund || 0;
      
      return calculateBankUsury({
        taegApplicato: analysis.taeg,
        tipoProdotto: analysis.accountType || 'credito_personale',
        interessiTotali,
      });
    }
  }

  // Return the AI-estimated amount if available, but with lower confidence
  if (analysis.estimatedRefund && analysis.estimatedRefund > 0) {
    return {
      amount: analysis.estimatedRefund,
      formula: 'Stima basata su analisi documento',
      legalReference: 'Art. 1815 c.c., L. 108/1996',
      confidence: 'medium',
      breakdown: [
        { label: 'Stima AI', value: `€${analysis.estimatedRefund.toLocaleString('it-IT')}` },
        { label: 'Nota', value: 'Verificare con documenti originali' },
      ],
    };
  }

  return {
    amount: 0,
    formula: 'Dati insufficienti per il calcolo',
    legalReference: '',
    confidence: 'low',
  };
}
