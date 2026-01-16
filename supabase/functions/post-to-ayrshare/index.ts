import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mappa categoria -> subreddit (senza approvazione richiesta)
const SUBREDDIT_MAP: Record<string, string> = {
  'flight': 'ViaggiITA',
  'transport': 'ViaggiITA',
  'telecom': 'bollette',
  'energy': 'bollette',
  'bank': 'ItaliaPersonalFinance',
  'insurance': 'ItaliaPersonalFinance',
  'ecommerce': 'CasualIT',
  'tech': 'CasualIT',
  'automotive': 'CasualIT',
  'warranty': 'CasualIT',
  'class_action': 'ItaliaPersonalFinance',
  'other': 'CasualIT'
};

interface ArticleData {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  category: string;
  articleId?: string;
}

interface PlatformTexts {
  facebook: string;
  instagram: string;
  reddit: string;
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
Genera post DIVERSI per ogni piattaforma, ottimizzati per il loro pubblico:

FACEBOOK (150-200 parole):
- Tono conversazionale e caldo
- Inizia con una domanda coinvolgente
- Usa emoji con moderazione (2-3)
- Chiudi con call-to-action per leggere l'articolo
- 2-3 hashtag alla fine

INSTAGRAM (100-150 parole):
- Tono positivo e empowering
- Più emoji (4-6)
- 6-8 hashtag rilevanti alla fine
- Focus su storie di successo e empowerment
- Call-to-action: "Link in bio" o simile

REDDIT (100-150 parole):
- Tono informativo e utile, MAI promozionale
- NO emoji
- NO hashtag
- Scrivi come se stessi dando un consiglio a un amico
- Sii genuino e helpful
- Menziona che è una guida/risorsa utile

IMPORTANTE:
- Scrivi SEMPRE in italiano
- Non essere troppo formale
- Ogni post deve essere UNICO e adatto alla piattaforma
- Non menzionare mai le altre piattaforme

Rispondi SOLO con un JSON valido:
{
  "facebook": "testo per facebook...",
  "instagram": "testo per instagram...",
  "reddit": "testo per reddit..."
}`;

    const userPrompt = `Genera i post per questo articolo:
Titolo: ${data.title}
Categoria: ${data.category}
Descrizione: ${data.excerpt}
URL: ${data.url}`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
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
        temperature: 0.8,
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
    console.log("✅ AI generated platform texts successfully");
    
    return {
      facebook: parsed.facebook || generateFallbackTexts(data).facebook,
      instagram: parsed.instagram || generateFallbackTexts(data).instagram,
      reddit: parsed.reddit || generateFallbackTexts(data).reddit,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return generateFallbackTexts(data);
  }
}

// Fallback texts if AI fails
function generateFallbackTexts(data: ArticleData): PlatformTexts {
  const categoryEmoji: Record<string, string> = {
    'flight': '✈️',
    'ecommerce': '🛒',
    'bank': '🏦',
    'telecom': '📱',
    'energy': '⚡',
    'transport': '🚆',
    'insurance': '🛡️',
    'automotive': '🚗',
    'tech': '💻',
    'class_action': '⚖️',
    'other': '📋'
  };
  
  const emoji = categoryEmoji[data.category] || '💡';

  return {
    facebook: `${emoji} ${data.title}

Conosci i tuoi diritti? Spesso i consumatori non sanno di poter ottenere rimborsi e risarcimenti per disservizi subiti.

${data.excerpt}

👉 Leggi la guida completa per scoprire come fare valere i tuoi diritti: ${data.url}

#DirittiConsumatori #Rimborsi #ConsumerRights`,

    instagram: `${emoji} RIMBORSO POSSIBILE! 💪

${data.title}

${data.excerpt}

📖 Scopri tutti i dettagli nella guida completa!

#DirittiConsumatori #Rimborso #Risarcimento #ConsumerRights #Italia #Soldi #Diritti #TutelaConsumatori`,

    reddit: `${data.title}

Ho trovato questa guida utile per chi si trova in questa situazione. 

${data.excerpt}

Potrebbe essere d'aiuto a chi sta cercando informazioni su come procedere: ${data.url}

Spero possa essere utile a qualcuno.`
  };
}

// Post to Ayrshare
async function postToAyrshare(
  texts: PlatformTexts, 
  imageUrl?: string,
  category?: string
): Promise<{ success: boolean; results: any; error?: string }> {
  const ayrshareApiKey = Deno.env.get('AYRSHARE_API_KEY');
  
  if (!ayrshareApiKey) {
    console.error("AYRSHARE_API_KEY not configured");
    return { success: false, results: null, error: "API key not configured" };
  }

  try {
    // Reddit title from first line of text (max 300 chars)
    const redditTitle = texts.reddit.split('\n')[0].substring(0, 300);
    
    // Determina il subreddit in base alla categoria
    const subreddit = SUBREDDIT_MAP[category || 'other'] || SUBREDDIT_MAP['other'];
    console.log(`📍 Selected subreddit: r/${subreddit} for category: ${category}`);
    
    const requestBody: any = {
      post: texts.facebook, // Default text
      platforms: ["facebook", "instagram", "reddit"],
      facebookOptions: {
        text: texts.facebook
      },
      instagramOptions: {
        text: texts.instagram
      },
      redditOptions: {
        title: redditTitle,
        text: texts.reddit,
        subreddit: subreddit
      }
    };

    // Add media if available
    if (imageUrl) {
      requestBody.mediaUrls = [imageUrl];
    }

    console.log("📤 Posting to Ayrshare:", JSON.stringify({ platforms: requestBody.platforms, hasImage: !!imageUrl }));

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

    console.log("✅ Ayrshare post successful:", JSON.stringify(result));
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
    console.log("📥 Received article data:", JSON.stringify({ title: data.title, category: data.category }));

    // Validate required fields
    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate platform-optimized texts
    console.log("🤖 Generating platform texts with AI...");
    const texts = await generatePlatformTexts(data);

    // Post to Ayrshare (con subreddit dinamico per categoria)
    const ayrshareResult = await postToAyrshare(texts, data.imageUrl, data.category);

    // Log to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (data.articleId) {
      const platforms = ['facebook', 'instagram', 'reddit'];
      
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
          error_message: platformError?.message || ayrshareResult.error || null,
          posted_at: platformResult?.status === 'success' ? new Date().toISOString() : null
        });
      }
      
      console.log("📊 Logged results to social_posts table");
    }

    return new Response(
      JSON.stringify({
        success: ayrshareResult.success,
        platforms: ['facebook', 'instagram', 'reddit'],
        results: ayrshareResult.results,
        error: ayrshareResult.error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in post-to-ayrshare:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
