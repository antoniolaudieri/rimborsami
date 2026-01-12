import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Opportunity categories mapping based on sender domains
const DOMAIN_CATEGORIES: Record<string, string> = {
  // Airlines -> flight
  "ryanair.com": "flight", "easyjet.com": "flight", "alitalia.com": "flight",
  "ita-airways.com": "flight", "vueling.com": "flight", "wizzair.com": "flight",
  "lufthansa.com": "flight", "airfrance.com": "flight", "klm.com": "flight",
  "britishairways.com": "flight", "emirates.com": "flight",
  // Trains -> transport
  "trenitalia.com": "transport", "italotreno.it": "transport", "lefrecce.it": "transport",
  // E-commerce -> ecommerce
  "amazon.it": "ecommerce", "amazon.com": "ecommerce", "ebay.it": "ecommerce",
  "zalando.it": "ecommerce", "mediaworld.it": "ecommerce", "unieuro.it": "ecommerce",
  // Banks -> bank
  "unicredit.it": "bank", "intesasanpaolo.com": "bank", "bancobpm.it": "bank",
  "fineco.it": "bank", "n26.com": "bank", "revolut.com": "bank",
  // Utilities -> energy/telecom
  "enel.it": "energy", "eni.it": "energy", "a2a.it": "energy",
  "tim.it": "telecom", "vodafone.it": "telecom", "windtre.it": "telecom",
  "fastweb.it": "telecom", "iliad.it": "telecom",
  // Insurance -> insurance
  "generali.it": "insurance", "allianz.it": "insurance", "axa.it": "insurance",
  // Booking -> flight/other
  "booking.com": "other", "hotels.com": "other", "airbnb.com": "other",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token non valido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { connectionId, limit = 50 } = body;

    // Get unanalyzed emails
    let query = supabase
      .from("scanned_emails")
      .select("*")
      .eq("user_id", user.id)
      .eq("analyzed", false)
      .order("received_at", { ascending: false })
      .limit(limit);

    if (connectionId) {
      query = query.eq("connection_id", connectionId);
    }

    const { data: emails, error: emailsError } = await query;

    if (emailsError) {
      console.error("Error fetching emails:", emailsError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Errore nel recupero email" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Nessuna email da analizzare",
        analyzed: 0,
        opportunitiesFound: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get available opportunities to match against
    const { data: opportunities } = await supabase
      .from("opportunities")
      .select("id, title, category, short_description, rules")
      .eq("active", true);

    let analyzedCount = 0;
    let opportunitiesCreated = 0;

    // Analyze each email with AI
    for (const email of emails) {
      try {
        // Determine category from domain
        const category = DOMAIN_CATEGORIES[email.sender_domain] || "other";
        
        // Find matching opportunities by category
        const matchingOpps = opportunities?.filter(o => o.category === category) || [];
        
        let analysisResult: any = {
          category,
          potentialOpportunity: false,
          reason: null,
          matchedOpportunityId: null,
        };

        // Use AI to analyze if this email could be a refund opportunity
        if (lovableApiKey && matchingOpps.length > 0) {
          const prompt = `Analizza questa email e determina se potrebbe essere un'opportunità di rimborso.

Email:
- Mittente: ${email.sender}
- Oggetto: ${email.subject}
- Data: ${email.received_at}
- Dominio: ${email.sender_domain}

Opportunità di rimborso disponibili in questa categoria (${category}):
${matchingOpps.map(o => `- ${o.title}: ${o.short_description}`).join('\n')}

Rispondi SOLO con un JSON valido:
{
  "isPotentialOpportunity": boolean,
  "confidence": "high" | "medium" | "low",
  "reason": "breve spiegazione",
  "matchedOpportunityTitle": "titolo opportunità se match" | null,
  "suggestedAction": "cosa fare"
}`;

          try {
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  { role: "system", content: "Sei un esperto di rimborsi e tutela del consumatore italiano. Analizza le email per identificare potenziali opportunità di rimborso." },
                  { role: "user", content: prompt }
                ],
                temperature: 0.3,
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const content = aiData.choices?.[0]?.message?.content;
              
              if (content) {
                // Extract JSON from response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  analysisResult = {
                    category,
                    potentialOpportunity: parsed.isPotentialOpportunity,
                    confidence: parsed.confidence,
                    reason: parsed.reason,
                    suggestedAction: parsed.suggestedAction,
                    matchedOpportunityTitle: parsed.matchedOpportunityTitle,
                  };

                  // Find matched opportunity ID
                  if (parsed.matchedOpportunityTitle) {
                    const matched = matchingOpps.find(o => 
                      o.title.toLowerCase().includes(parsed.matchedOpportunityTitle.toLowerCase()) ||
                      parsed.matchedOpportunityTitle.toLowerCase().includes(o.title.toLowerCase())
                    );
                    if (matched) {
                      analysisResult.matchedOpportunityId = matched.id;
                    }
                  }
                }
              }
            }
          } catch (aiError) {
            console.error("AI analysis error:", aiError);
          }
        }

        // Update email with analysis result
        await supabase
          .from("scanned_emails")
          .update({
            analyzed: true,
            analysis_result: analysisResult,
            opportunity_id: analysisResult.matchedOpportunityId,
          })
          .eq("id", email.id);

        analyzedCount++;

        // Create user_opportunity if high confidence match found
        if (analysisResult.potentialOpportunity && 
            analysisResult.confidence === "high" && 
            analysisResult.matchedOpportunityId) {
          
          // Check if already exists
          const { data: existing } = await supabase
            .from("user_opportunities")
            .select("id")
            .eq("user_id", user.id)
            .eq("opportunity_id", analysisResult.matchedOpportunityId)
            .maybeSingle();

          if (!existing) {
            const { data: newOpp, error: oppError } = await supabase
              .from("user_opportunities")
              .insert({
                user_id: user.id,
                opportunity_id: analysisResult.matchedOpportunityId,
                status: "found",
                matched_data: {
                  source: "email_scan",
                  email_subject: email.subject,
                  email_sender: email.sender,
                  email_date: email.received_at,
                  analysis_reason: analysisResult.reason,
                },
              })
              .select("id")
              .single();

            if (!oppError && newOpp) {
              // Link email to user_opportunity
              await supabase
                .from("scanned_emails")
                .update({ user_opportunity_id: newOpp.id })
                .eq("id", email.id);
              
              opportunitiesCreated++;
            }
          }
        }

      } catch (emailError) {
        console.error(`Error analyzing email ${email.id}:`, emailError);
      }
    }

    // Update connection stats
    if (connectionId) {
      const { data: oppCount } = await supabase
        .from("scanned_emails")
        .select("id", { count: "exact" })
        .eq("connection_id", connectionId)
        .not("user_opportunity_id", "is", null);

      await supabase
        .from("email_connections")
        .update({ 
          opportunities_found: oppCount?.length || 0 
        })
        .eq("id", connectionId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Analizzate ${analyzedCount} email, trovate ${opportunitiesCreated} opportunità`,
      analyzed: analyzedCount,
      opportunitiesFound: opportunitiesCreated
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
