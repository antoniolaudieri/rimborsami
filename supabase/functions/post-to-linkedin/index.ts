import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleData {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  category: string;
  articleId?: string;
}

// Generate engaging, human-like post text using AI
async function generateEngagingPost(data: ArticleData): Promise<string> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!lovableApiKey) {
    console.log("No LOVABLE_API_KEY, using fallback post format");
    return generateFallbackPost(data);
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sei un esperto di comunicazione social per un servizio italiano che aiuta i consumatori a ottenere rimborsi.

OBIETTIVO: Scrivi post LinkedIn che sembrino scritti da una persona reale, non da un'IA.

REGOLE FONDAMENTALI:
- Inizia SEMPRE con un hook che parla di un problema reale (domanda retorica, situazione comune, dato sorprendente)
- Usa un tono conversazionale, come se parlassi con un amico
- Evita frasi corporate o da marketing ("scopri come", "non perdere", "clicca qui")
- Varia lo stile: a volte breve e diretto, a volte più narrativo
- Usa 1-2 emoji al massimo, in modo naturale
- Massimo 2-3 hashtag pertinenti alla fine
- Lunghezza ideale: 100-200 parole
- NON usare mai: "Scopri come far valere i tuoi diritti", "Leggi l'articolo", "Link in bio"
- Parla dei BENEFICI concreti (soldi recuperati, tempo risparmiato, stress evitato)
- INCLUDI SEMPRE il link all'articolo nel testo del post

STILI DA ALTERNARE:
1. "Storia personale": "La settimana scorsa ho aiutato Marco a recuperare 400€ da..."
2. "Domanda provocatoria": "Hai mai ricevuto una bolletta che ti sembrava troppo alta?"
3. "Fatto sorprendente": "Il 70% degli italiani non sa che può chiedere un rimborso per..."
4. "Consiglio pratico": "Un consiglio che do sempre: conserva sempre le ricevute..."
5. "Problema comune": "Capita spesso: il volo viene cancellato e ti offrono solo un voucher..."`
          },
          {
            role: "user",
            content: `Scrivi un post LinkedIn per questo articolo:

TITOLO: ${data.title}
RIASSUNTO: ${data.excerpt}
CATEGORIA: ${data.category}
URL ARTICOLO: ${data.url}

Ricorda: il post deve sembrare scritto da una persona vera, non da un'IA. Sii autentico e conversazionale. Includi il link all'articolo nel post.`
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("AI generation failed:", await response.text());
      return generateFallbackPost(data);
    }

    const result = await response.json();
    const generatedText = result.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      return generateFallbackPost(data);
    }

    // Make sure the URL is included if AI forgot it
    let finalText = generatedText;
    if (!finalText.includes(data.url)) {
      finalText += `\n\n${data.url}`;
    }

    console.log("AI generated post:", finalText);
    return finalText;
  } catch (error) {
    console.error("Error generating post with AI:", error);
    return generateFallbackPost(data);
  }
}

// Fallback templates when AI is not available
function generateFallbackPost(data: ArticleData): string {
  const templates = [
    // Template 1: Question hook
    `Sai già cosa fare se ${getCategoryQuestion(data.category)}?\n\nMolti non lo sanno, ma hai diritto a un rimborso.\n\nHo scritto una guida pratica che spiega passo passo come ottenerlo:\n${data.url}\n\n#${getCategoryHashtag(data.category)} #diritticonsumatori`,
    
    // Template 2: Problem-solution
    `${getCategoryProblem(data.category)}\n\nBuona notizia: puoi recuperare quei soldi.\n\nNella guida trovi tutto quello che ti serve sapere 👇\n${data.url}\n\n#rimborsi #consumatori`,
    
    // Template 3: Practical tip
    `Un consiglio che do spesso a chi mi chiede di ${getCategoryAction(data.category)}:\n\nnon aspettare troppo. I termini per chiedere il rimborso scadono.\n\nQui trovi tutti i dettagli:\n${data.url}\n\n#${getCategoryHashtag(data.category)}`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function getCategoryQuestion(category: string): string {
  const questions: Record<string, string> = {
    flight: "il tuo volo viene cancellato all'ultimo minuto",
    energy: "la bolletta ti sembra troppo alta",
    bank: "la banca ti addebita commissioni che non riconosci",
    telecom: "l'operatore telefonico ti attiva servizi non richiesti",
    ecommerce: "il pacco non arriva o arriva danneggiato",
    class_action: "scopri di essere stato danneggiato insieme a migliaia di altri consumatori",
  };
  return questions[category] || "un'azienda ti deve dei soldi";
}

function getCategoryProblem(category: string): string {
  const problems: Record<string, string> = {
    flight: "Volo cancellato. Ore di attesa. Nessuna spiegazione.",
    energy: "Bolletta arrivata e il totale non torna. Ti suona familiare?",
    bank: "Commissioni nascoste che spuntano dal nulla sul conto.",
    telecom: "Abbonamenti attivati senza il tuo consenso. Succede più spesso di quanto pensi.",
    ecommerce: "Ordine pagato, pacco mai arrivato. E l'assistenza che non risponde.",
    class_action: "Quando un'azienda danneggia migliaia di persone, insieme si è più forti.",
  };
  return problems[category] || "Hai pagato per qualcosa che non hai ricevuto.";
}

function getCategoryAction(category: string): string {
  const actions: Record<string, string> = {
    flight: "rimborsi per voli",
    energy: "bollette e conguagli",
    bank: "problemi con la banca",
    telecom: "problemi con l'operatore telefonico",
    ecommerce: "acquisti online",
    class_action: "azioni collettive",
  };
  return actions[category] || "recuperare soldi";
}

function getCategoryHashtag(category: string): string {
  const hashtags: Record<string, string> = {
    flight: "rimborsoaereo",
    energy: "bollette",
    bank: "banche",
    telecom: "telefonia",
    ecommerce: "acquistionline",
    class_action: "classaction",
  };
  return hashtags[category] || "rimborsi";
}

async function postToLinkedIn(data: ArticleData, postText: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const personId = Deno.env.get("LINKEDIN_PERSON_ID");

  if (!accessToken || !personId) {
    throw new Error("LinkedIn credentials not configured (need LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID)");
  }

  console.log("Posting as person ID:", personId);

  // LinkedIn API v2 - Create a share as personal profile
  const postBody: any = {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: postText
        },
        shareMediaCategory: data.imageUrl ? "ARTICLE" : "NONE",
        ...(data.imageUrl && {
          media: [{
            status: "READY",
            originalUrl: data.url,
            title: {
              text: data.title
            },
            description: {
              text: data.excerpt.substring(0, 200)
            }
          }]
        })
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  console.log("Posting to LinkedIn:", JSON.stringify(postBody, null, 2));

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify(postBody)
  });

  const responseText = await response.text();
  console.log("LinkedIn API response:", response.status, responseText);

  if (!response.ok) {
    try {
      const errorData = JSON.parse(responseText);
      return { 
        success: false, 
        error: errorData.message || `LinkedIn API error: ${response.status}` 
      };
    } catch {
      return { 
        success: false, 
        error: `LinkedIn API error: ${response.status} - ${responseText}` 
      };
    }
  }

  try {
    const result = JSON.parse(responseText);
    return { 
      success: true, 
      postId: result.id 
    };
  } catch {
    return { 
      success: true, 
      postId: response.headers.get("x-restli-id") || undefined 
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: ArticleData = await req.json();
    console.log("Received article data:", data);

    // Validate required fields
    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate engaging post text
    console.log("Generating engaging post text...");
    const postText = await generateEngagingPost(data);
    console.log("Generated post text:", postText);

    // Post to LinkedIn
    const result = await postToLinkedIn(data, postText);
    console.log("LinkedIn post result:", result);

    // Log the social post attempt
    if (data.articleId) {
      await supabase.from("social_posts").insert({
        article_id: data.articleId,
        platform: "linkedin",
        post_id: result.postId || null,
        status: result.success ? "posted" : "failed",
        error_message: result.error || null,
        posted_at: result.success ? new Date().toISOString() : null
      });
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: result.postId,
        postText: postText,
        message: "Article posted to LinkedIn successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error posting to LinkedIn:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
