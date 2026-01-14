import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sources to scan for opportunities
const SOURCES = [
  {
    name: "Altroconsumo Class Actions",
    url: "https://www.altroconsumo.it/azioni",
    category: "class_action",
    type: "html"
  },
  {
    name: "ENAC Diritti Passeggeri",
    url: "https://www.enac.gov.it/passeggeri/diritti-dei-passeggeri",
    category: "flight",
    type: "html"
  },
  {
    name: "AGCM Provvedimenti",
    url: "https://www.agcm.it/competenze/tutela-del-consumatore/provvedimenti-tutela-del-consumatore/",
    category: "ecommerce",
    type: "html"
  }
];

interface DiscoveredOpportunity {
  title: string;
  description: string;
  short_description: string;
  category: string;
  min_amount: number | null;
  max_amount: number | null;
  deadline_days: number | null;
  source_url: string;
  legal_reference: string | null;
}

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.8"
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    // Extract text content, removing scripts and styles
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 15000); // Limit content size
    
    return textContent;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function analyzeWithAI(
  content: string, 
  sourceName: string, 
  category: string,
  sourceUrl: string
): Promise<DiscoveredOpportunity[]> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!lovableApiKey) {
    console.error("LOVABLE_API_KEY not configured");
    return [];
  }

  const prompt = `Analizza il seguente contenuto estratto da "${sourceName}" e identifica opportunità di rimborso per consumatori italiani.

Per ogni opportunità trovata, estrai:
- Titolo chiaro e descrittivo
- Descrizione completa (max 500 caratteri)
- Breve descrizione (max 150 caratteri)
- Importo minimo stimato (in euro, null se non specificato)
- Importo massimo stimato (in euro, null se non specificato)
- Giorni di scadenza dalla scoperta (null se non specificato)
- Riferimento legale se presente

Rispondi SOLO con un array JSON valido. Se non trovi opportunità, rispondi con [].

Formato risposta:
[
  {
    "title": "Titolo opportunità",
    "description": "Descrizione completa...",
    "short_description": "Breve descrizione...",
    "min_amount": 100,
    "max_amount": 500,
    "deadline_days": 30,
    "legal_reference": "Art. 123 Codice Consumo"
  }
]

Contenuto da analizzare:
${content}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Sei un esperto di diritti dei consumatori italiani. Analizza contenuti web per identificare opportunità di rimborso reali e attive. Rispondi solo con JSON valido."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      return [];
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "[]";
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("No JSON array found in AI response");
      return [];
    }

    const opportunities = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      description: string;
      short_description: string;
      min_amount: number | null;
      max_amount: number | null;
      deadline_days: number | null;
      legal_reference: string | null;
    }>;

    return opportunities.map(opp => ({
      ...opp,
      category,
      source_url: sourceUrl
    }));
  } catch (error) {
    console.error("Error analyzing with AI:", error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting opportunity discovery...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allDiscovered: DiscoveredOpportunity[] = [];
    const errors: string[] = [];

    // Process each source
    for (const source of SOURCES) {
      console.log(`Processing source: ${source.name}`);
      
      const content = await fetchPageContent(source.url);
      if (!content) {
        errors.push(`Failed to fetch ${source.name}`);
        continue;
      }

      const opportunities = await analyzeWithAI(
        content, 
        source.name, 
        source.category,
        source.url
      );
      
      console.log(`Found ${opportunities.length} opportunities from ${source.name}`);
      allDiscovered.push(...opportunities);
    }

    // Get existing opportunity titles to avoid duplicates
    const { data: existingOpportunities } = await supabase
      .from("opportunities")
      .select("title, source_url");

    const existingTitles = new Set(
      existingOpportunities?.map(o => o.title.toLowerCase()) || []
    );
    const existingUrls = new Set(
      existingOpportunities?.map(o => o.source_url).filter(Boolean) || []
    );

    // Filter out duplicates
    const newOpportunities = allDiscovered.filter(opp => {
      const titleLower = opp.title.toLowerCase();
      const isDuplicate = existingTitles.has(titleLower) || 
                         (opp.source_url && existingUrls.has(opp.source_url));
      if (isDuplicate) {
        console.log(`Skipping duplicate: ${opp.title}`);
      }
      return !isDuplicate;
    });

    console.log(`New unique opportunities to insert: ${newOpportunities.length}`);

    // Insert new opportunities
    const insertedCount = { success: 0, failed: 0 };

    for (const opp of newOpportunities) {
      const { error } = await supabase.from("opportunities").insert({
        title: opp.title,
        description: opp.description,
        short_description: opp.short_description,
        category: opp.category,
        min_amount: opp.min_amount,
        max_amount: opp.max_amount,
        deadline_days: opp.deadline_days,
        legal_reference: opp.legal_reference,
        source_url: opp.source_url,
        active: false, // Start inactive, needs review
        auto_discovered: true,
        needs_review: true,
        discovered_at: new Date().toISOString()
      });

      if (error) {
        console.error(`Failed to insert opportunity: ${opp.title}`, error);
        insertedCount.failed++;
      } else {
        console.log(`Inserted: ${opp.title}`);
        insertedCount.success++;
      }
    }

    // Create notification for admins about new opportunities
    if (insertedCount.success > 0) {
      // Get admin users
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      for (const admin of adminRoles || []) {
        await supabase.from("notifications").insert({
          user_id: admin.user_id,
          type: "system",
          title: "Nuove opportunità scoperte",
          message: `Sono state scoperte ${insertedCount.success} nuove opportunità da revisionare.`,
          action_url: "/admin/opportunities"
        });
      }
    }

    const result = {
      success: true,
      sourcesProcessed: SOURCES.length,
      totalDiscovered: allDiscovered.length,
      newOpportunities: insertedCount.success,
      duplicatesSkipped: allDiscovered.length - newOpportunities.length,
      insertionErrors: insertedCount.failed,
      fetchErrors: errors
    };

    console.log("Discovery completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Discovery error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
