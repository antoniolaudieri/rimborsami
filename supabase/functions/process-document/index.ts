import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bank analysis interfaces
interface BankAnalysis {
  account_type: "conto_corrente" | "mutuo" | "prestito" | "fido" | "carta_credito" | "unknown";
  bank_name: string | null;
  period: { from: string | null; to: string | null };
  interest_analysis: {
    nominal_rate: number | null;
    effective_rate: number | null;
    usury_threshold: number;
    is_usurious: boolean;
    excess_amount: number | null;
  };
  fees_analysis: {
    total_fees: number | null;
    suspicious_fees: Array<{
      name: string;
      amount: number;
      issue: string;
    }>;
  };
  late_fees_analysis: {
    total_late_fees: number | null;
    legal_limit: number;
    excess_amount: number | null;
    is_excessive: boolean;
  };
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  estimated_refund: number;
  anomalies_found: string[];
}

interface ParsedDocumentData {
  document_type: string;
  confidence: number;
  extracted_data: Record<string, unknown>;
  potential_issues: string[];
  suggested_categories: string[];
  bank_analysis?: BankAnalysis;
}

// Valid opportunity_category enum values from database
const VALID_CATEGORIES = [
  "flight", "ecommerce", "bank", "insurance", "warranty", 
  "other", "telecom", "energy", "transport", "automotive", 
  "tech", "class_action"
];

// Map document types and AI-returned categories to valid enum values
const CATEGORY_MAPPING: Record<string, string[]> = {
  // Document types
  "biglietto_aereo": ["flight", "transport"],
  "carta_imbarco": ["flight", "transport"],
  "conferma_ordine": ["ecommerce", "warranty"],
  "ricevuta_ecommerce": ["ecommerce", "warranty"],
  "bolletta_telefono": ["telecom"],
  "bolletta_luce": ["energy"],
  "bolletta_gas": ["energy"],
  "estratto_conto": ["bank"],
  "mutuo": ["bank"],
  "prestito": ["bank"],
  "fido": ["bank"],
  "carta_credito": ["bank"],
  "scontrino": ["ecommerce", "warranty"],
  "garanzia": ["warranty"],
  "assicurazione": ["insurance"],
  "contratto_auto": ["automotive"],
  "fattura": ["ecommerce", "other"],
  "verbale_assemblea": ["other"],
  "rendiconto_condominiale": ["other"],
  "convocazione_assemblea": ["other"],
  "busta_paga": ["other"],
  "contratto_lavoro": ["other"],
  "cud": ["other"],
  "fattura_medica": ["other"],
  "referto_medico": ["other"],
  "bollo_auto": ["automotive"],
  "revisione": ["automotive"],
  "multa": ["automotive", "transport"],
  // Legacy types for backwards compatibility
  "flight": ["flight"],
  "order": ["ecommerce", "warranty"],
  "bill": ["telecom", "energy"],
  "receipt": ["ecommerce", "warranty"],
  "bank_statement": ["bank"],
  "warranty": ["warranty"],
  "other": ["other"],
  "altro": ["other"],
  // Normalize AI-returned categories to valid enums
  "condominium": ["other"],
  "condominio": ["other"],
  "meeting_notice": ["other"],
  "work": ["other"],
  "lavoro": ["other"],
  "health": ["other"],
  "sanità": ["other"],
  "auto": ["automotive"],
  "service_agreement": ["other"],
  "terms_and_conditions": ["other"],
  "factura": ["ecommerce"],
  "e-commerce_receipt": ["ecommerce"],
  "invoice": ["ecommerce"],
  "tax": ["other"],
  "fisco": ["other"],
};

// Normalize categories to valid enum values
function normalizeCategories(categories: string[]): string[] {
  const normalized = new Set<string>();
  
  for (const cat of categories) {
    const lowerCat = cat.toLowerCase();
    
    // Check if already valid
    if (VALID_CATEGORIES.includes(lowerCat)) {
      normalized.add(lowerCat);
      continue;
    }
    
    // Try to map from known values
    const mapped = CATEGORY_MAPPING[lowerCat];
    if (mapped) {
      mapped.forEach(c => normalized.add(c));
    } else {
      // Default to "other" for unknown categories
      normalized.add("other");
    }
  }
  
  return Array.from(normalized);
}

function getSystemPrompt(): string {
  return `Sei un esperto analista di documenti italiani specializzato in diritto bancario, del lavoro, condominiale e dei consumatori.

COMPITO: Analizza OGNI documento fornito ed estrai informazioni strutturate in formato JSON, identificando SEMPRE eventuali anomalie.

STEP 1 - IDENTIFICA IL TIPO DI DOCUMENTO:
Classifica il documento in una di queste categorie:
- biglietto_aereo / carta_imbarco
- conferma_ordine / ricevuta_ecommerce
- bolletta_telefono / bolletta_luce / bolletta_gas
- estratto_conto / mutuo / prestito / fido / carta_credito
- scontrino / garanzia / assicurazione
- contratto_auto / fattura
- verbale_assemblea / rendiconto_condominiale / convocazione_assemblea
- busta_paga / contratto_lavoro / cud
- fattura_medica / referto_medico
- bollo_auto / revisione / multa
- altro

STEP 2 - ESTRAI DATI CHIAVE E FAI UN RIASSUNTO:
- Estrai i dati principali del documento
- Scrivi SEMPRE un "summary" di 1-2 frasi che sintetizza il contenuto

STEP 3 - VALUTAZIONE ANOMALIE (FONDAMENTALE PER OGNI DOCUMENTO):
Analizza il documento per individuare qualsiasi problema:

📌 PER DOCUMENTI BANCARI:
- Usura: TAEG > soglie Banca d'Italia (mutui 6.52%, prestiti 17.05%, carte 21.12%, fidi 14.25%)
- Interessi di mora > BCE+8% (~12%)
- CMS (abolita dal 2012), CIV > 0.5%, spese non giustificate
- Anatocismo (capitalizzazione interessi vietata)

📌 PER DOCUMENTI CONDOMINIALI:
- Quorum non raggiunto (assemblea ordinaria 1/3 millesimi, straordinaria 1/2)
- Delibere senza maggioranze corrette
- Spese non documentate o eccessive
- Mancanza ordine del giorno nella convocazione
- Assenza verbale o firme

📌 PER BUSTE PAGA / LAVORO:
- Ore lavorate non corrispondenti
- Straordinari non pagati
- INPS/IRPEF calcolati erroneamente
- Mancato accantonamento TFR
- Livello contrattuale non corrispondente

📌 PER BOLLETTE / UTENZE:
- Consumi anomali rispetto al periodo
- Oneri di sistema eccessivi
- Costi di recesso non previsti
- Penali illegittime

📌 PER FATTURE / RICEVUTE:
- IVA errata
- Sconti promessi non applicati
- Voci non richieste

📌 PER MULTE:
- Scadenza contestazione (60 giorni)
- Segnaletica non conforme
- Violazioni procedurali

📌 PER ASSICURAZIONI:
- Clausole vessatorie
- Franchigie nascoste
- Esclusioni non evidenziate

STEP 4 - CALCOLA RISK SCORE (0-100):
OGNI documento deve avere un risk_score e risk_level:
- 0-25: low (nessuna anomalia significativa)
- 26-50: medium (anomalie minori, da monitorare)
- 51-75: high (anomalie significative, azione consigliata)
- 76-100: critical (gravi irregolarità, azione urgente)

STEP 5 - CALCOLO RIMBORSO REALISTICO (FONDAMENTALE):
Usa queste FORMULE PRECISE per stimare i rimborsi:

📌 DOCUMENTI BANCARI - USURA (Tassi soglia Banca d'Italia Q2 2025):
| Tipo Prodotto | TEGM | Soglia Usura |
|---------------|------|--------------|
| Mutui tasso fisso | 3.35% | 8.19% |
| Mutui tasso variabile | 4.92% | 10.15% |
| Credito personale | 10.90% | 17.63% |
| Carte revolving | 15.36% | 23.20% |
| Fido fino a 5000€ | 10.35% | 16.94% |
| Fido oltre 5000€ | 9.24% | 15.55% |
| Cessione quinto | 9.89% | 16.36% |
| Leasing | 5.67% | 11.09% |

FORMULA USURA: Se TAEG > Soglia → Rimborso = Interessi_pagati × ((TAEG - Soglia) / TAEG)
ESEMPIO: TAEG 18%, Soglia 10.15%, Interessi €2450 → €2450 × ((18-10.15)/18) = €1069.03

📌 VOLI - Regolamento EU 261/2004:
- Tratta fino a 1.500 km: €250
- Tratta 1.500-3.500 km: €400
- Tratta oltre 3.500 km: €600
- Riduzione 50% se ritardo 3-4h su tratte lunghe

📌 MULTE:
- Ricorso accolto: 100% importo multa + spese notifica (€15)
- Termini: 60 giorni per ricorso al Prefetto, 30 giorni per Giudice di Pace

📌 LAVORO:
- Straordinari non pagati: paga_oraria × 1.25 (feriale) o 1.50 (festivo) × ore
- TFR mancante: (retribuzione_annua / 13.5) × anni_servizio
- Differenze retributive: differenza_mensile × mesi_contestati

📌 CONDOMINIALI:
- Impugnazione delibera: spese legali €500-2000 (complessità variabile)
- Spese illegittime: 100% importo contestato
- Termine impugnazione: 30 giorni dalla delibera (Art. 1137 c.c.)

📌 BOLLETTE/UTENZE:
- Conguagli prescritti (oltre 2 anni): 100% importo
- Doppia fatturazione: 100% duplicato
- Penali recesso illegittime: 100% penale

IMPORTANTE: Nel campo "estimated_refund" inserisci SEMPRE il valore numerico calcolato.
Nel campo "refund_calculation" spiega la formula utilizzata.

FORMATO OUTPUT (SOLO JSON VALIDO):
{
  "document_type": "tipo_documento",
  "confidence": 0.85,
  "summary": "Riassunto breve del documento e delle eventuali anomalie trovate",
  "risk_score": 35,
  "risk_level": "medium",
  "extracted_data": {
    // campi estratti in base al tipo
  },
  "potential_issues": ["lista DETTAGLIATA di tutti i problemi trovati"],
  "suggested_categories": ["bank", "other"],
  "estimated_refund": 1069.03,
  "refund_calculation": {
    "formula": "Interessi × ((TAEG - Soglia) / TAEG)",
    "inputs": {"interessi": 2450, "taeg": 18, "soglia": 10.15},
    "result": 1069.03,
    "legal_reference": "Art. 1815 c.c., L. 108/1996",
    "confidence": "high"
  },
  
  // AGGIUNGI UNO DEI SEGUENTI in base al tipo di documento:
  
  "bank_analysis": {
    "account_type": "conto_corrente|mutuo|prestito|fido|carta_credito|cessione_quinto|leasing",
    "bank_name": "Nome Banca",
    "period": {"from": "2024-01", "to": "2024-12"},
    "taeg": 18.5,
    "tan": 15.2,
    "total_interest": 2450,
    "total_fees": 320,
    "interest_analysis": {
      "nominal_rate": 15.2,
      "effective_rate": 18.5,
      "usury_threshold": 17.63,
      "is_usurious": true,
      "excess_amount": 1069.03
    },
    "fees_analysis": {
      "total_fees": 320,
      "suspicious_fees": [{"name": "Commissione istruttoria", "amount": 150, "issue": "Eccessiva"}]
    },
    "late_fees_analysis": {
      "total_late_fees": 89,
      "is_excessive": false,
      "legal_limit": 120
    },
    "risk_score": 75,
    "risk_level": "high",
    "estimated_refund": 1069.03,
    "anomalies_found": ["TAEG 18.5% supera soglia usura 17.63%"]
  },
  
  "condominium_analysis": {
    "document_subtype": "verbale_assemblea|rendiconto|convocazione",
    "assembly_info": {...},
    "deliberations": [...],
    "financial_info": {"total_expenses": 15000, "contested_amount": 2500},
    "irregularities": [{"type": "quorum", "severity": "high", "description": "desc", "legal_reference": "Art. 1136 c.c."}],
    "risk_score": 65,
    "risk_level": "high",
    "estimated_refund": 2500,
    "actionable_advice": ["Impugnare delibera entro 30 giorni"]
  },
  
  "work_analysis": {
    "document_subtype": "busta_paga",
    "employer": "...",
    "salary_info": {"gross": 2500, "net": 1850, "hours_worked": 180, "overtime_hours": 20, "overtime_unpaid": 15},
    "irregularities": [{"type": "straordinari", "description": "15 ore non pagate", "amount": 225}],
    "risk_score": 60,
    "risk_level": "high",
    "estimated_refund": 225
  },
  
  "auto_analysis": {
    "document_subtype": "multa",
    "vehicle_info": {...},
    "fine_info": {"amount": 150, "notification_date": "2025-01-01", "deadline_appeal": "2025-03-02"},
    "irregularities": [{"type": "procedura", "description": "Segnaletica non conforme"}],
    "risk_score": 55,
    "risk_level": "high",
    "estimated_refund": 165,
    "actionable_advice": ["Ricorso al Prefetto entro 60 giorni"]
  },
  
  "flight_analysis": {
    "flight_number": "FR1234",
    "route": {"from": "Roma FCO", "to": "Londra STN"},
    "distance_km": 1500,
    "delay_hours": 4,
    "cancelled": false,
    "compensation": 250,
    "legal_reference": "Reg. CE 261/2004"
  }
}`;
}

function getDocumentPrompt(fileName: string, fileType: string): string {
  return `Analizza questo documento: "${fileName}" (tipo: ${fileType})

ISTRUZIONI SPECIFICHE:
1. Identifica il tipo di documento e classifica correttamente
2. Estrai TUTTI i dati numerici (tassi, importi, date, ore, etc.)
3. Calcola il rimborso usando le FORMULE ESATTE fornite
4. Nel campo "refund_calculation" spiega COME hai calcolato il rimborso
5. Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo

Se non riesci a leggere parti del documento, indica "non leggibile" nei campi.
Se non ci sono dati sufficienti per calcolare un rimborso, imposta estimated_refund a null.`;
}

function getFallbackParsedData(fileName: string, docType: string): ParsedDocumentData {
  const lowerName = fileName.toLowerCase();
  let documentType = "altro";
  let suggestedCategories = ["other"];

  // Try to determine type from filename
  if (lowerName.includes("boarding") || lowerName.includes("volo") || lowerName.includes("flight")) {
    documentType = "biglietto_aereo";
    suggestedCategories = ["flight", "transport"];
  } else if (lowerName.includes("order") || lowerName.includes("ordine") || lowerName.includes("conferma")) {
    documentType = "conferma_ordine";
    suggestedCategories = ["ecommerce", "warranty"];
  } else if (lowerName.includes("bolletta") || lowerName.includes("fattura")) {
    if (lowerName.includes("tel") || lowerName.includes("mobile")) {
      documentType = "bolletta_telefono";
      suggestedCategories = ["telecom"];
    } else if (lowerName.includes("luce") || lowerName.includes("enel") || lowerName.includes("energia")) {
      documentType = "bolletta_luce";
      suggestedCategories = ["energy"];
    } else if (lowerName.includes("gas")) {
      documentType = "bolletta_gas";
      suggestedCategories = ["energy"];
    } else {
      documentType = "fattura";
      suggestedCategories = ["ecommerce", "other"];
    }
  } else if (lowerName.includes("estratto") || lowerName.includes("conto") || lowerName.includes("banca") || 
             lowerName.includes("mutuo") || lowerName.includes("prestito") || lowerName.includes("fido")) {
    documentType = "estratto_conto";
    suggestedCategories = ["bank"];
  } else if (lowerName.includes("garanzia") || lowerName.includes("warranty")) {
    documentType = "garanzia";
    suggestedCategories = ["warranty"];
  } else if (lowerName.includes("assicur") || lowerName.includes("polizza")) {
    documentType = "assicurazione";
    suggestedCategories = ["insurance"];
  }

  return {
    document_type: documentType,
    confidence: 0.3,
    extracted_data: {
      file_name: fileName,
      file_type: docType,
      note: "Analisi AI non disponibile - classificazione basata su nome file"
    },
    potential_issues: [],
    suggested_categories: suggestedCategories,
  };
}

async function matchOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  parsedData: ParsedDocumentData
): Promise<string[]> {
  const client = createClient(supabaseUrl, supabaseServiceKey);
  
  const rawCategories = parsedData.suggested_categories || [];
  const categories = normalizeCategories(rawCategories);
  
  if (categories.length === 0) return [];

  console.log("Searching opportunities for categories:", categories.join(", "));

  // Get matching opportunities
  const { data: opportunities, error } = await client
    .from("opportunities")
    .select("id, title, category")
    .eq("active", true)
    .in("category", categories);

  if (error || !opportunities) {
    console.error("Error fetching opportunities:", error);
    return [];
  }

  console.log(`Found ${opportunities.length} matching opportunities`);

  // Get user's existing opportunities
  const { data: existingUserOpps } = await client
    .from("user_opportunities")
    .select("opportunity_id")
    .eq("user_id", userId);

  const existingIds = new Set(existingUserOpps?.map((o) => o.opportunity_id) || []);

  // Filter out already assigned opportunities
  const newOpportunities = opportunities.filter((o) => !existingIds.has(o.id));

  if (newOpportunities.length === 0) return [];

  // Calculate estimated amount based on bank analysis
  let estimatedAmount = null;
  if (parsedData.bank_analysis?.estimated_refund) {
    estimatedAmount = parsedData.bank_analysis.estimated_refund;
  }

  // Create user_opportunities for new matches
  const { error: insertError } = await client.from("user_opportunities").insert(
    newOpportunities.map((o) => ({
      user_id: userId,
      opportunity_id: o.id,
      status: "found" as const,
      estimated_amount: estimatedAmount,
      matched_data: {
        source: "document_analysis",
        document_type: parsedData.document_type,
        confidence: parsedData.confidence,
        has_anomalies: parsedData.bank_analysis ? parsedData.bank_analysis.risk_score > 25 : false,
        risk_level: parsedData.bank_analysis?.risk_level,
      },
    }))
  );

  if (insertError) {
    console.error("Error creating user_opportunities:", insertError);
    return [];
  }

  return newOpportunities.map((o) => o.id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing document: ${document_id}`);

    // Update status to processing
    await supabase
      .from("documents")
      .update({ processing_status: "processing" })
      .eq("id", document_id);

    console.log(`Document status updated to processing for: ${document.file_name}`);

    let parsedData: ParsedDocumentData;

    // Try AI analysis if API key is available
    if (lovableApiKey && document.file_url) {
      try {
        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(document.file_url);

        if (downloadError) {
          throw new Error(`Failed to download file: ${downloadError.message}`);
        }

        // Convert to base64 using chunks to avoid stack overflow
        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let base64 = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          base64 += String.fromCharCode.apply(null, chunk as unknown as number[]);
        }
        base64 = btoa(base64);

        // Determine media type
        let mediaType = "application/pdf";
        if (document.type === "image") {
          const fileName = document.file_name?.toLowerCase() || "";
          if (fileName.endsWith(".png")) {
            mediaType = "image/png";
          } else if (fileName.endsWith(".gif")) {
            mediaType = "image/gif";
          } else if (fileName.endsWith(".webp")) {
            mediaType = "image/webp";
          } else {
            mediaType = "image/jpeg";
          }
        }

        console.log("Sending document to AI for analysis...");

        // Call Lovable AI for analysis
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: getSystemPrompt() },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: getDocumentPrompt(document.file_name || "document", document.type),
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mediaType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 4096,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI API error:", aiResponse.status, errorText);
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiResult = await aiResponse.json();
        const content = aiResult.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("Empty AI response");
        }

        console.log("AI response received, parsing...");

        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = content;
        if (content.includes("```json")) {
          jsonStr = content.split("```json")[1].split("```")[0].trim();
        } else if (content.includes("```")) {
          jsonStr = content.split("```")[1].split("```")[0].trim();
        }

        parsedData = JSON.parse(jsonStr);

        // Normalize and add categories
        const docTypeCategories = CATEGORY_MAPPING[parsedData.document_type] || ["other"];
        const existingCategories = parsedData.suggested_categories || [];
        parsedData.suggested_categories = normalizeCategories([...existingCategories, ...docTypeCategories]);

        console.log("Document parsed successfully:", parsedData.document_type);

      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        console.log(`Using fallback parsing: ${document.type}`);
        parsedData = getFallbackParsedData(document.file_name || "document", document.type);
      }
    } else {
      console.log(`No API key or file URL, using fallback parsing`);
      parsedData = getFallbackParsedData(document.file_name || "document", document.type);
    }

    // Update document with parsed data
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        processing_status: "completed",
        parsed_data: parsedData as unknown,
      })
      .eq("id", document_id);

    if (updateError) {
      console.error("Error updating document:", updateError);
    }

    console.log("Document parsing completed successfully");

    // Match opportunities
    const newOpportunityIds = await matchOpportunities(
      supabaseUrl,
      supabaseServiceKey,
      document.user_id,
      parsedData
    );

    console.log(`Found ${newOpportunityIds.length} matching opportunities`);

    // Create notification if new opportunities found
    if (newOpportunityIds.length > 0) {
      const hasAnomalies = parsedData.bank_analysis && parsedData.bank_analysis.risk_score > 25;
      
      let notificationTitle = `${newOpportunityIds.length} opportunità trovate`;
      let notificationMessage = `Analizzando il tuo documento abbiamo trovato ${newOpportunityIds.length} potenziali rimborsi.`;

      if (hasAnomalies) {
        notificationTitle = `⚠️ Anomalie rilevate nel documento bancario`;
        notificationMessage = `Abbiamo rilevato ${parsedData.bank_analysis!.anomalies_found.length} anomalie. Stima rimborso: €${parsedData.bank_analysis!.estimated_refund}`;
      }

      await supabase.from("notifications").insert({
        user_id: document.user_id,
        type: "new_opportunity",
        title: notificationTitle,
        message: notificationMessage,
        action_url: "/dashboard/documents",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        parsed_data: parsedData,
        matched_opportunities: newOpportunityIds.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Process document error:", error);
    
    // Try to update document status to error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const body = await req.clone().json().catch(() => ({}));
      if (body.document_id) {
        await supabase
          .from("documents")
          .update({ processing_status: "error" })
          .eq("id", body.document_id);
      }
    } catch {
      // Ignore cleanup errors
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
