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

const CATEGORY_MAPPING: Record<string, string[]> = {
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
  // Legacy types for backwards compatibility
  "flight": ["flight"],
  "order": ["ecommerce", "warranty"],
  "bill": ["telecom", "energy"],
  "receipt": ["ecommerce", "warranty"],
  "bank_statement": ["bank"],
  "warranty": ["warranty"],
  "other": ["other"],
};

function getSystemPrompt(): string {
  return `Sei un esperto analista di documenti italiani specializzato in diritto bancario e dei consumatori.

COMPITO: Analizza il documento fornito ed estrai informazioni strutturate in formato JSON.

STEP 1 - IDENTIFICA IL TIPO DI DOCUMENTO:
Classifica il documento in una di queste categorie:
- biglietto_aereo / carta_imbarco
- conferma_ordine / ricevuta_ecommerce
- bolletta_telefono / bolletta_luce / bolletta_gas
- estratto_conto / mutuo / prestito / fido / carta_credito
- scontrino / garanzia / assicurazione
- contratto_auto / fattura
- altro

STEP 2 - ESTRAI DATI CHIAVE:
In base al tipo, estrai:
- Per voli: compagnia, numero volo, data, tratta, passeggero
- Per ordini: negozio, prodotti, importo, data, numero ordine
- Per bollette: gestore, periodo, importo, scadenza
- Per documenti bancari: banca, tipo conto, periodo, saldo, tassi, commissioni, spese
- Per garanzie: prodotto, marca, durata, scadenza

STEP 3 - ANALISI ANOMALIE (CRITICO per documenti bancari):
Se il documento è bancario, effettua queste verifiche:

A) USURA:
- Calcola il TAEG effettivo (tasso + commissioni + spese accessorie)
- Confronta con soglie usura Banca d'Italia Q4 2024:
  * Mutui: 6.52%
  * Prestiti personali: 17.05%
  * Carte credito: 21.12%
  * Fidi: 14.25%
- Segnala se supera la soglia

B) INTERESSI DI MORA:
- Verifica se gli interessi di mora superano BCE+8% (attualmente ~12%)
- Calcola l'importo eccedente se applicabile

C) COMMISSIONI SOSPETTE:
- Commissione Massimo Scoperto (CMS): abolita dal 2012 per privati
- Commissione Istruttoria Veloce (CIV) > 0.5%
- Spese non previste da contratto o non giustificate
- Spese tenuta conto eccessive (> €50/anno senza servizi premium)
- Spese incasso > €1/operazione

D) ANATOCISMO:
- Verifica capitalizzazione interessi illegittima (vietato dal 2000)

STEP 4 - CALCOLA RISK SCORE (0-100):
- 0-25: Basso rischio (nessuna anomalia)
- 26-50: Medio rischio (anomalie minori)
- 51-75: Alto rischio (anomalie significative)
- 76-100: Critico (usura o gravi irregolarità)

STEP 5 - STIMA RIMBORSO POTENZIALE:
Calcola l'importo stimato recuperabile in base alle anomalie trovate.

FORMATO OUTPUT (SOLO JSON, nessun testo aggiuntivo):
{
  "document_type": "tipo_documento",
  "confidence": 0.85,
  "extracted_data": {
    // campi estratti in base al tipo
  },
  "potential_issues": ["lista problemi trovati"],
  "suggested_categories": ["bank", "other"],
  "bank_analysis": {
    // SOLO per documenti bancari
    "account_type": "conto_corrente",
    "bank_name": "Nome Banca",
    "period": {"from": "2024-01", "to": "2024-12"},
    "interest_analysis": {
      "nominal_rate": 5.5,
      "effective_rate": 8.2,
      "usury_threshold": 12.0,
      "is_usurious": false,
      "excess_amount": null
    },
    "fees_analysis": {
      "total_fees": 150,
      "suspicious_fees": [
        {"name": "Commissione Massimo Scoperto", "amount": 45, "issue": "abolita dal 2012"}
      ]
    },
    "late_fees_analysis": {
      "total_late_fees": 80,
      "legal_limit": 12.0,
      "excess_amount": 20,
      "is_excessive": true
    },
    "risk_score": 65,
    "risk_level": "high",
    "estimated_refund": 120,
    "anomalies_found": ["CMS illegittima", "More eccessive"]
  }
}`;
}

function getDocumentPrompt(fileName: string, fileType: string): string {
  return `Analizza questo documento: "${fileName}" (tipo: ${fileType})

Ricorda:
- Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo
- Per documenti bancari, effettua l'analisi completa delle anomalie
- Sii preciso nell'identificazione del tipo documento
- Se non riesci a leggere parti del documento, indica "non leggibile" nei campi`;
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
  
  const categories = parsedData.suggested_categories || [];
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

        // Add categories from mapping if not present
        if (!parsedData.suggested_categories || parsedData.suggested_categories.length === 0) {
          parsedData.suggested_categories = CATEGORY_MAPPING[parsedData.document_type] || ["other"];
        }

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
