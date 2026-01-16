import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleData {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  category?: string;
  articleId?: string;
}

interface PlatformTexts {
  facebook: string;
  instagram: string;
  twitter: string;
}

// Truncate Twitter text to max 260 chars (leaving room for link added by Ayrshare)
function truncateTwitterText(text: string, maxLength: number = 260): string {
  if (text.length <= maxLength) return text;
  
  // Find a good break point (space, punctuation)
  let cutoff = maxLength - 3;
  while (cutoff > 0 && text[cutoff] !== ' ' && text[cutoff] !== '.' && text[cutoff] !== ',') {
    cutoff--;
  }
  if (cutoff < 100) cutoff = maxLength - 3; // Fallback if no good break point
  
  return text.substring(0, cutoff).trim() + '...';
}

// Generate platform-optimized texts using AI
async function generatePlatformTexts(data: ArticleData): Promise<PlatformTexts> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log("No Lovable API key, using fallback texts");
    return generateFallbackTexts(data);
  }

  try {
    const systemPrompt = `Sei un social media manager esperto per Rimborsami.it, un sito italiano sui diritti dei consumatori.
Genera post DIVERSI per ogni piattaforma, ottimizzati per il loro pubblico.

REGOLE IMPORTANTI:
- Scrivi SEMPRE in italiano
- NO emoji in nessun testo
- Tono professionale ma accessibile
- Focus sui benefici concreti per il lettore

FACEBOOK (150-200 parole):
- Tono conversazionale e caldo
- Inizia con una domanda coinvolgente
- NO emoji
- Chiudi con call-to-action per leggere l'articolo
- 2-3 hashtag alla fine

INSTAGRAM (100-150 parole):
- Tono positivo e empowering
- NO emoji
- 6-8 hashtag rilevanti alla fine
- Focus su storie di successo e diritti
- Call-to-action: "Link in bio"

TWITTER/X (MASSIMO 200 CARATTERI - OBBLIGATORIO):
- BREVISSIMO, massimo 200 caratteri totali
- Una frase sola, diretta
- 2 hashtag corti
- NO link (viene aggiunto automaticamente)
- Esempio: "Rimborso Amazon non ricevuto dopo 30 giorni? Ecco come ottenerlo. #Rimborso #Amazon"

Rispondi SOLO con un JSON valido:
{
  "facebook": "testo per facebook...",
  "instagram": "testo per instagram...",
  "twitter": "testo BREVE per twitter (max 200 caratteri)"
}`;

    const userPrompt = `Genera i post per questo articolo:
Titolo: ${data.title}
Categoria: ${data.category || 'other'}
Descrizione: ${data.excerpt}
URL: ${data.url}

IMPORTANTE: Il testo per Twitter deve essere MASSIMO 200 caratteri!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateFallbackTexts(data);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content from AI");
      return generateFallbackTexts(data);
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in AI response");
      return generateFallbackTexts(data);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("AI generated platform texts successfully");
    
    // ALWAYS truncate Twitter text to ensure compliance
    const twitterText = truncateTwitterText(parsed.twitter || generateFallbackTexts(data).twitter, 260);
    console.log(`Twitter text length: ${twitterText.length} chars`);
    
    return {
      facebook: parsed.facebook || generateFallbackTexts(data).facebook,
      instagram: parsed.instagram || generateFallbackTexts(data).instagram,
      twitter: twitterText,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return generateFallbackTexts(data);
  }
}

// Fallback texts if AI fails
function generateFallbackTexts(data: ArticleData): PlatformTexts {
  // Create a short Twitter text from title
  const shortTitle = data.title.length > 150 ? data.title.substring(0, 147) + '...' : data.title;
  
  return {
    facebook: `${data.title}

Conosci i tuoi diritti come consumatore? Spesso non siamo consapevoli delle tutele che ci spettano.

${data.excerpt}

Leggi la guida completa per scoprire come far valere i tuoi diritti: ${data.url}

#DirittiConsumatori #Rimborsi #ConsumerRights`,

    instagram: `TUTELA I TUOI DIRITTI

${data.title}

${data.excerpt}

Scopri tutti i dettagli nella guida completa! Link in bio.

#DirittiConsumatori #Rimborso #Risarcimento #ConsumerRights #Italia #Soldi #Diritti #TutelaConsumatori`,

    twitter: `${shortTitle} #DirittiConsumatori #Rimborso`
  };
}

// Post to Ayrshare
async function postToAyrshare(
  texts: PlatformTexts, 
  imageUrl?: string
): Promise<{ success: boolean; results: any; error?: string }> {
  const ayrshareApiKey = Deno.env.get('AYRSHARE_API_KEY');
  
  if (!ayrshareApiKey) {
    console.error("AYRSHARE_API_KEY not configured");
    return { success: false, results: null, error: "API key not configured" };
  }

  try {
    // Final safety check: ensure Twitter text is under 280 chars
    const safeTwitterText = texts.twitter.length > 275 
      ? texts.twitter.substring(0, 272) + '...'
      : texts.twitter;
    
    console.log(`Final Twitter text (${safeTwitterText.length} chars): ${safeTwitterText}`);
    
    const requestBody: any = {
      post: texts.facebook, // Default text
      platforms: ["facebook", "instagram", "twitter"],
      facebookOptions: {
        text: texts.facebook
      },
      instagramOptions: {
        text: texts.instagram
      },
      twitterOptions: {
        text: safeTwitterText
      }
    };

    // Add media if available
    if (imageUrl) {
      requestBody.mediaUrls = [imageUrl];
    }

    console.log("Posting to Ayrshare:", JSON.stringify({ platforms: requestBody.platforms, hasImage: !!imageUrl }));

    const response = await fetch("https://api.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Ayrshare API error:", response.status, result);
      return { success: false, results: result, error: result.message || "API error" };
    }

    console.log("Ayrshare post successful:", JSON.stringify(result));
    return { success: true, results: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Ayrshare request error:", errorMessage);
    return { success: false, results: null, error: errorMessage };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ArticleData = await req.json();
    console.log("Received article data:", JSON.stringify({ title: data.title, category: data.category }));

    // Validate required fields
    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate platform-optimized texts
    console.log("Generating platform texts with AI...");
    const texts = await generatePlatformTexts(data);

    // Post to Ayrshare
    const ayrshareResult = await postToAyrshare(texts, data.imageUrl);

    // Log to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (data.articleId) {
      const platforms = ['facebook', 'instagram', 'twitter'];
      
      // Find results from Ayrshare response
      const postIds = ayrshareResult.results?.postIds || [];
      const errors = ayrshareResult.results?.errors || [];
      
      for (const platform of platforms) {
        const platformResult = postIds.find((p: any) => p.platform === platform);
        const platformError = errors.find((e: any) => e.platform === platform);
        
        await supabase.from('social_posts').insert({
          article_id: data.articleId,
          platform: platform,
          status: platformError ? 'error' : (platformResult?.status === 'success' ? 'posted' : 'error'),
          post_id: platformResult?.id || null,
          error_message: platformError?.message || null,
          posted_at: platformResult?.status === 'success' ? new Date().toISOString() : null
        });
      }
      
      console.log("Logged results to social_posts table");
    }

    // Check if all platforms succeeded
    const allSuccess = !ayrshareResult.results?.errors?.length && ayrshareResult.success;

    return new Response(
      JSON.stringify({
        success: allSuccess,
        platforms: ['facebook', 'instagram', 'twitter'],
        results: ayrshareResult.results,
        error: ayrshareResult.error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in post-to-ayrshare:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
