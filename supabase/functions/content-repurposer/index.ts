import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContentFormat = "tip" | "thread" | "poll" | "dato" | "mito";

interface RepurposeRequest {
  articleId?: string;
  format?: ContentFormat;
  platform?: string;
}

const FORMATS: ContentFormat[] = ["tip", "thread", "poll", "dato", "mito"];

const FORMAT_PROMPTS: Record<ContentFormat, string> = {
  dato: `Estrai UN DATO o STATISTICA sorprendente dall'articolo e crea un post breve con questo formato:
📊 DATO DEL GIORNO
[Il dato sorprendente in 1-2 frasi]
[Una frase che collega al problema quotidiano]
[CTA: "Scopri di più su rimborsami.app"]
2-3 hashtag. Max 150 parole.`,

  tip: `Trasforma il contenuto in un TIP PRATICO con questo formato:
💡 LO SAPEVI CHE...
[Fatto poco conosciuto in 1-2 frasi]
[Spiegazione pratica in 2-3 frasi]
[Cosa fare concretamente]
[CTA: "Guida completa su rimborsami.app"]
2-3 hashtag. Max 150 parole.`,

  thread: `Crea un THREAD di 3-4 post concatenati dall'articolo:
POST 1/4: Hook forte - il problema principale (max 250 char)
POST 2/4: Il dato chiave o la legge che protegge il consumatore (max 250 char)
POST 3/4: Come agire concretamente - i passi (max 250 char)
POST 4/4: CTA verso rimborsami.app + hashtag (max 250 char)
Separa ogni post con "---". Ogni post deve funzionare anche da solo.`,

  poll: `Crea un SONDAGGIO a partire dall'argomento dell'articolo:
DOMANDA: [Una domanda coinvolgente legata al tema, che le persone vogliono rispondere]
OPZIONE A: [Risposta 1]
OPZIONE B: [Risposta 2]  
OPZIONE C: [Risposta 3]
OPZIONE D: [Risposta 4]
[1-2 frasi di contesto dopo il sondaggio]
[CTA: "Scopri la risposta giusta su rimborsami.app"]
2 hashtag.`,

  mito: `Crea un post MITO VS REALTÀ educativo:
❌ MITO: [Una convinzione sbagliata comune legata al tema]
✅ REALTÀ: [La verità con dato concreto]

❌ MITO: [Seconda convinzione sbagliata]
✅ REALTÀ: [La verità]

[1-2 frasi conclusive]
[CTA: "Sfata altri miti su rimborsami.app"]
2-3 hashtag. Max 180 parole.`
};

async function callLovableAI(prompt: string, systemPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.85,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error("Rate limit exceeded, retry later");
    if (response.status === 402) throw new Error("AI credits exhausted");
    throw new Error(`AI Gateway error: ${response.status} - ${err}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

function adaptForPlatform(text: string, platform: string, format: ContentFormat): string {
  if (platform === "twitter") {
    if (format === "thread") {
      // Return first post of thread for Twitter
      const parts = text.split("---");
      const firstPost = (parts[0] || text).trim();
      return firstPost.length > 260 ? firstPost.substring(0, 257) + "..." : firstPost;
    }
    return text.length > 260 ? text.substring(0, 257) + "..." : text;
  }
  
  if (platform === "instagram") {
    // Add extra hashtags for Instagram
    if (!text.includes("#")) {
      text += "\n\n#Rimborso #DirittiConsumatori #Italia #Soldi #ConsumerRights";
    }
  }
  
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RepurposeRequest = await req.json();
    
    // Select format (random if not specified)
    const format = body.format || FORMATS[Math.floor(Math.random() * FORMATS.length)];
    const targetPlatform = body.platform; // optional: if set, only post to this platform
    
    // Select article to repurpose
    let articleQuery = supabase
      .from("news_articles")
      .select("id, title, excerpt, content, category, slug")
      .eq("is_published", true);

    if (body.articleId) {
      articleQuery = articleQuery.eq("id", body.articleId);
    } else {
      // Pick article not repurposed in this format in the last 14 days
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentReposts } = await supabase
        .from("content_reposts")
        .select("article_id")
        .eq("format", format)
        .gte("posted_at", fourteenDaysAgo);
      
      const excludeIds = (recentReposts || []).map(r => r.article_id).filter(Boolean);
      
      if (excludeIds.length > 0) {
        articleQuery = articleQuery.not("id", "in", `(${excludeIds.join(",")})`);
      }
      
      articleQuery = articleQuery.order("published_at", { ascending: false }).limit(20);
    }

    const { data: articles, error: articleError } = await articleQuery;
    
    if (articleError || !articles || articles.length === 0) {
      console.log("No eligible articles found for format:", format);
      return new Response(
        JSON.stringify({ success: false, reason: "no_eligible_articles" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick random from eligible
    const article = body.articleId ? articles[0] : articles[Math.floor(Math.random() * articles.length)];
    const articleUrl = `https://rimborsami.app/news/${article.slug}`;
    
    console.log(`Repurposing article "${article.title}" as ${format}`);

    // Generate micro-content
    const systemPrompt = `Sei un social media manager esperto per Rimborsami.app, piattaforma italiana che aiuta i consumatori a recuperare rimborsi.
Scrivi in italiano naturale e conversazionale. Tono: tra l'informativo e l'indignato.
NON usare emoji in eccesso (max 2-3 per post). NON usare etichette come "HOOK:", "CTA:" nel testo.
Il link all'articolo è: ${articleUrl}
Includi SEMPRE il link nel post.`;

    const userPrompt = `${FORMAT_PROMPTS[format]}

ARTICOLO DA RICICLARE:
Titolo: ${article.title}
Categoria: ${article.category}
Estratto: ${article.excerpt}
Contenuto (primi 1500 char): ${(article.content || "").substring(0, 1500)}

Link articolo: ${articleUrl}`;

    const generatedText = await callLovableAI(userPrompt, systemPrompt);
    
    if (!generatedText) {
      return new Response(
        JSON.stringify({ success: false, reason: "generation_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure URL is included
    let finalText = generatedText;
    if (!finalText.includes("rimborsami.app")) {
      finalText += `\n\n👉 ${articleUrl}`;
    }

    console.log(`Generated ${format} content (${finalText.length} chars)`);

    // Post to platforms
    const platforms = targetPlatform ? [targetPlatform] : ["facebook", "twitter", "linkedin"];
    const results: Record<string, any> = {};

    for (const platform of platforms) {
      const platformText = adaptForPlatform(finalText, platform, format);
      
      try {
        if (platform === "linkedin") {
          // Post via post-to-linkedin function
          const linkedinResp = await fetch(`${supabaseUrl}/functions/v1/post-to-linkedin`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: article.title,
              excerpt: platformText,
              url: articleUrl,
              category: article.category,
              articleId: article.id,
            }),
          });
          results[platform] = await linkedinResp.json();
        } else {
          // Post via Ayrshare for FB/Twitter
          const ayrshareKey = Deno.env.get("AYRSHARE_API_KEY");
          if (!ayrshareKey) {
            results[platform] = { success: false, error: "AYRSHARE_API_KEY not set" };
            continue;
          }
          
          const ayrshareBody: any = {
            post: platformText,
            platforms: [platform],
          };

          const ayrResp = await fetch("https://api.ayrshare.com/api/post", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${ayrshareKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(ayrshareBody),
          });
          results[platform] = await ayrResp.json();
        }

        // Save to content_reposts
        await supabase.from("content_reposts").insert({
          article_id: article.id,
          format,
          platform,
          post_text: platformText,
          posted_at: new Date().toISOString(),
        });

        // Also save to social_posts for unified tracking
        await supabase.from("social_posts").insert({
          article_id: article.id,
          platform,
          content_type: format,
          status: "posted",
          posted_at: new Date().toISOString(),
        });

        console.log(`Posted ${format} to ${platform} successfully`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error posting to ${platform}:`, errMsg);
        results[platform] = { success: false, error: errMsg };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        format,
        articleTitle: article.title,
        platforms: Object.keys(results),
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Content repurposer error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
