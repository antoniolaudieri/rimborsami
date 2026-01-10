import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedDocumentData {
  document_type: "flight" | "order" | "bill" | "receipt" | "bank_statement" | "warranty" | "other";
  confidence: number;
  extracted_data: Record<string, unknown>;
  potential_issues: string[];
  suggested_categories: string[];
}

// Category matching based on document type and extracted data
const CATEGORY_MAPPING: Record<string, string[]> = {
  flight: ["flight"],
  order: ["ecommerce", "warranty"],
  bill: ["telecom", "energy"],
  receipt: ["ecommerce", "warranty"],
  bank_statement: ["bank", "insurance"],
  warranty: ["warranty", "tech", "automotive"],
  other: ["other"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { document_id } = await req.json();

    if (!document_id) {
      return new Response(
        JSON.stringify({ error: "document_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing document: ${document_id}`);

    // Fetch document record
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to processing
    await supabase
      .from("documents")
      .update({ processing_status: "processing" })
      .eq("id", document_id);

    console.log(`Document status updated to processing for: ${document.file_name}`);

    let parsedData: ParsedDocumentData | null = null;

    // Check if we have Lovable AI available
    if (lovableApiKey && document.file_url) {
      try {
        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(document.file_url);

        if (downloadError) {
          console.error("Error downloading file:", downloadError);
          throw new Error("Failed to download file");
        }

        // Convert to base64 for AI analysis
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = document.type === "pdf" ? "application/pdf" : "image/jpeg";

        console.log(`Analyzing document with AI: ${document.file_name}`);

        // Use Gemini Vision to analyze the document
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analizza questo documento italiano e estrai informazioni strutturate per identificare potenziali rimborsi.

Identifica:
1. Tipo documento: biglietto aereo, conferma ordine, bolletta telefonica/energia, scontrino, estratto conto, garanzia, altro
2. Dati rilevanti per rimborsi (date, importi, numeri riferimento, aziende)
3. Potenziali problemi (ritardi, addebiti anomali, commissioni non dovute, difetti)
4. Categorie opportunità suggerite

Rispondi SOLO con JSON valido in questo formato esatto:
{
  "document_type": "flight|order|bill|receipt|bank_statement|warranty|other",
  "confidence": 0.0-1.0,
  "extracted_data": {
    "company": "nome azienda",
    "date": "YYYY-MM-DD",
    "amount": 123.45,
    "reference_number": "ABC123",
    "additional_fields": {}
  },
  "potential_issues": ["descrizione problema 1", "descrizione problema 2"],
  "suggested_categories": ["flight", "telecom", "ecommerce", ...]
}`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiResult = await aiResponse.json();
          const content = aiResult.choices?.[0]?.message?.content;

          if (content) {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                parsedData = JSON.parse(jsonMatch[0]);
                console.log("AI parsing successful:", parsedData?.document_type);
              } catch (parseError) {
                console.error("Failed to parse AI JSON response:", parseError);
              }
            }
          }
        } else {
          const errorText = await aiResponse.text();
          console.error("AI API error:", aiResponse.status, errorText);
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Fallback parsing based on file name if AI didn't work
    if (!parsedData) {
      parsedData = getFallbackParsedData(document.file_name || "", document.type);
      console.log("Using fallback parsing:", parsedData.document_type);
    }

    // Update document with parsed data
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        processing_status: "completed",
        parsed_data: parsedData,
      })
      .eq("id", document_id);

    if (updateError) {
      console.error("Error updating document:", updateError);
      throw updateError;
    }

    console.log("Document parsing completed successfully");

    // Match with opportunities
    const matchedOpportunities = await matchOpportunities(
      supabaseUrl,
      supabaseServiceKey,
      document.user_id,
      parsedData
    );

    // Create notification if opportunities found
    if (matchedOpportunities.length > 0) {
      await supabase.from("notifications").insert({
        user_id: document.user_id,
        type: "new_opportunity",
        title: `${matchedOpportunities.length} nuove opportunità trovate!`,
        message: `Abbiamo trovato ${matchedOpportunities.length} potenziali rimborsi analizzando il tuo documento "${document.file_name}"`,
        action_url: "/dashboard/opportunities",
      });

      console.log(`Created notification for ${matchedOpportunities.length} opportunities`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        parsed_data: parsedData,
        matched_opportunities: matchedOpportunities.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process document error:", error);

    // Try to update document status to error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { document_id } = await req.json().catch(() => ({}));
      
      if (document_id) {
        await supabase
          .from("documents")
          .update({ processing_status: "error" })
          .eq("id", document_id);
      }
    } catch {
      // Ignore cleanup errors
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getFallbackParsedData(fileName: string, docType: string): ParsedDocumentData {
  const lowerName = fileName.toLowerCase();

  // Try to determine type from filename
  if (lowerName.includes("volo") || lowerName.includes("flight") || lowerName.includes("boarding")) {
    return {
      document_type: "flight",
      confidence: 0.6,
      extracted_data: { source: "filename_analysis" },
      potential_issues: ["Verifica ritardi o cancellazioni"],
      suggested_categories: ["flight"],
    };
  }

  if (lowerName.includes("ordine") || lowerName.includes("order") || lowerName.includes("conferma")) {
    return {
      document_type: "order",
      confidence: 0.6,
      extracted_data: { source: "filename_analysis" },
      potential_issues: ["Verifica diritto di recesso o prodotti difettosi"],
      suggested_categories: ["ecommerce", "warranty"],
    };
  }

  if (lowerName.includes("bolletta") || lowerName.includes("fattura") || lowerName.includes("bill")) {
    return {
      document_type: "bill",
      confidence: 0.6,
      extracted_data: { source: "filename_analysis" },
      potential_issues: ["Verifica addebiti anomali"],
      suggested_categories: ["telecom", "energy"],
    };
  }

  if (lowerName.includes("scontrino") || lowerName.includes("receipt") || lowerName.includes("ricevuta")) {
    return {
      document_type: "receipt",
      confidence: 0.6,
      extracted_data: { source: "filename_analysis" },
      potential_issues: ["Verifica garanzia prodotto"],
      suggested_categories: ["ecommerce", "warranty"],
    };
  }

  if (lowerName.includes("banca") || lowerName.includes("bank") || lowerName.includes("estratto")) {
    return {
      document_type: "bank_statement",
      confidence: 0.6,
      extracted_data: { source: "filename_analysis" },
      potential_issues: ["Verifica commissioni non dovute"],
      suggested_categories: ["bank"],
    };
  }

  // Default fallback
  return {
    document_type: "other",
    confidence: 0.3,
    extracted_data: { source: "fallback" },
    potential_issues: ["Documento da analizzare manualmente"],
    suggested_categories: ["other"],
  };
}

async function matchOpportunities(
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string,
  parsedData: ParsedDocumentData
): Promise<string[]> {
  const matchedIds: string[] = [];
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get categories to search based on parsed data
    const categories = parsedData.suggested_categories.length > 0
      ? parsedData.suggested_categories
      : CATEGORY_MAPPING[parsedData.document_type] || ["other"];

    console.log(`Searching opportunities for categories: ${categories.join(", ")}`);

    // Find matching opportunities
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("id, title, category")
      .eq("active", true)
      .in("category", categories);

    if (error) {
      console.error("Error fetching opportunities:", error);
      return [];
    }

    const opps = opportunities as { id: string; title: string; category: string }[] | null;
    console.log(`Found ${opps?.length || 0} matching opportunities`);

    // Check if user already has these opportunities
    for (const opp of opps || []) {
      const { data: existing } = await supabase
        .from("user_opportunities")
        .select("id")
        .eq("user_id", userId)
        .eq("opportunity_id", opp.id)
        .maybeSingle();

      if (!existing) {
        // Create user_opportunity
        const { error: insertError } = await supabase
          .from("user_opportunities")
          .insert({
            user_id: userId,
            opportunity_id: opp.id,
            status: "found",
            matched_data: {
              source: "document_analysis",
              document_type: parsedData.document_type,
              confidence: parsedData.confidence,
              extracted_data: parsedData.extracted_data,
            },
            estimated_amount: null,
          } as Record<string, unknown>);

        if (!insertError) {
          matchedIds.push(opp.id);
          console.log(`Created user_opportunity for: ${opp.title}`);
        }
      }
    }
  } catch (error) {
    console.error("Error matching opportunities:", error);
  }

  return matchedIds;
}
