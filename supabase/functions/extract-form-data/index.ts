import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedFormData {
  [key: string]: string | undefined;
}

interface ExtractionResult {
  success: boolean;
  data: ExtractedFormData;
  document_type: string;
  confidence: number;
  message?: string;
}

// Prompt per estrarre dati in base alla categoria
function getExtractionPrompt(category: string): string {
  const prompts: Record<string, string> = {
    flight: `Estrai i seguenti dati dal documento di volo:
- airline: nome compagnia aerea
- flight_number: numero volo (es: FR1234)
- flight_date: data del volo (formato YYYY-MM-DD)
- departure_airport: aeroporto di partenza (nome o codice)
- arrival_airport: aeroporto di arrivo (nome o codice)
- booking_reference: codice prenotazione/PNR se presente
- passenger_name: nome passeggero se presente`,

    ecommerce: `Estrai i seguenti dati dal documento di acquisto online:
- seller_name: nome venditore/piattaforma
- order_number: numero ordine
- order_date: data ordine (formato YYYY-MM-DD)
- product_name: nome prodotto/i acquistato/i
- amount: importo totale (solo numero, es: 99.99)`,

    bank: `Estrai i seguenti dati dal documento bancario:
- bank_name: nome della banca
- account_type: tipo conto (conto_corrente, carta_credito, mutuo, prestito, investimenti)
- period_start: data inizio periodo (formato YYYY-MM-DD)
- period_end: data fine periodo (formato YYYY-MM-DD)
- estimated_amount: importo totale commissioni/interessi se rilevabile
- account_number: IBAN o numero conto se presente`,

    telecom: `Estrai i seguenti dati dalla bolletta telefonica:
- operator_name: nome operatore (TIM, Vodafone, WindTre, Fastweb, Iliad, etc.)
- phone_number: numero di telefono
- billing_period: periodo fatturazione
- amount: importo bolletta (solo numero)
- contract_code: codice cliente se presente`,

    energy: `Estrai i seguenti dati dalla bolletta luce/gas:
- supplier_name: nome fornitore energia
- contract_type: tipo fornitura (luce, gas, dual)
- billing_period: periodo fatturazione
- disputed_amount: importo bolletta (solo numero)
- pod_pdr: codice POD o PDR se presente`,

    insurance: `Estrai i seguenti dati dal documento assicurativo:
- insurance_company: nome compagnia assicurativa
- policy_number: numero polizza
- policy_type: tipo polizza (auto, casa, vita, salute, viaggio)
- claim_date: data evento/sinistro se presente (formato YYYY-MM-DD)
- claim_amount: importo se presente`,

    warranty: `Estrai i seguenti dati dallo scontrino/documento garanzia:
- product_name: nome prodotto
- purchase_date: data acquisto (formato YYYY-MM-DD)
- seller_name: nome venditore/negozio
- purchase_amount: prezzo pagato (solo numero)`,

    class_action: `Estrai i seguenti dati dal documento:
- full_name: nome e cognome se presente
- fiscal_code: codice fiscale se presente
- email: email se presente
- phone: telefono se presente
- affected_period: periodo interessato`,
  };

  return prompts[category] || `Estrai tutti i dati rilevanti dal documento:
- company_name: nome azienda/ente
- issue_date: data (formato YYYY-MM-DD)
- reference_number: numero di riferimento/ordine
- amount: importo (solo numero)`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "other";

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracting form data from: ${file.name}, category: ${category}`);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
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
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".png")) {
      mediaType = "image/png";
    } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      mediaType = "image/jpeg";
    } else if (fileName.endsWith(".webp")) {
      mediaType = "image/webp";
    } else if (fileName.endsWith(".gif")) {
      mediaType = "image/gif";
    }

    const systemPrompt = `Sei un esperto di estrazione dati da documenti italiani con OCR.

COMPITO: Analizza il documento e estrai i dati richiesti in formato JSON.

REGOLE IMPORTANTI:
1. Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo
2. Usa null per campi non trovati
3. Le date devono essere in formato YYYY-MM-DD
4. Gli importi devono essere solo numeri (es: 99.99, non "€99,99")
5. Sii preciso e usa OCR per leggere il testo

FORMATO OUTPUT:
{
  "document_type": "tipo rilevato",
  "confidence": 0.85,
  "extracted_fields": {
    // campi estratti
  }
}`;

    const userPrompt = `${getExtractionPrompt(category)}

Analizza questo documento e restituisci i dati in formato JSON.
Se un campo non è presente, usa null.`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2048,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite richieste raggiunto, riprova tra poco" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Crediti AI esauriti" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    console.log("AI response received, parsing...");

    // Parse JSON from response
    let jsonStr = content;
    if (content.includes("```json")) {
      jsonStr = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      jsonStr = content.split("```")[1].split("```")[0].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Clean up extracted fields - convert to strings for form
    const extractedFields: ExtractedFormData = {};
    const fields = parsed.extracted_fields || parsed.data || parsed;
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== null && value !== undefined && key !== "document_type" && key !== "confidence") {
        extractedFields[key] = String(value);
      }
    }

    const result: ExtractionResult = {
      success: true,
      data: extractedFields,
      document_type: parsed.document_type || "unknown",
      confidence: parsed.confidence || 0.7,
      message: `Trovati ${Object.keys(extractedFields).length} campi`,
    };

    console.log(`Extraction complete: ${JSON.stringify(result)}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Extraction error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Errore nell'estrazione",
        data: {}
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
