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

type ContentType = 'attraction' | 'education' | 'conversion';

// Determine content type based on category and rotation
function determineContentType(category: string = 'other'): ContentType {
  // Distribution: 40% attraction, 40% education, 20% conversion
  const rand = Math.random();
  
  // Certain categories lean toward specific types
  const categoryBias: Record<string, ContentType> = {
    flight: 'attraction',      // Voli: high emotional impact, viral potential
    energy: 'education',       // Energia: complex topic, needs explanation
    bank: 'education',         // Banca: technical, build trust
    telecom: 'attraction',     // Telecom: common frustration, relatable
    ecommerce: 'conversion',   // Ecommerce: direct action-oriented
    class_action: 'attraction' // Class action: big impact, news-worthy
  };
  
  // 40% of time use category bias, 60% random distribution
  if (rand < 0.4 && categoryBias[category]) {
    return categoryBias[category];
  }
  
  // Random distribution: 40% attraction, 40% education, 20% conversion
  if (rand < 0.6) return 'attraction';
  if (rand < 0.9) return 'education';
  return 'conversion';
}

// Truncate Twitter text to max 260 chars (leaving room for link added by Ayrshare)
function truncateTwitterText(text: string, maxLength: number = 260): string {
  if (text.length <= maxLength) return text;
  
  let cutoff = maxLength - 3;
  while (cutoff > 0 && text[cutoff] !== ' ' && text[cutoff] !== '.' && text[cutoff] !== ',') {
    cutoff--;
  }
  if (cutoff < 100) cutoff = maxLength - 3;
  
  return text.substring(0, cutoff).trim() + '...';
}

// Get category-specific hooks and content
function getCategoryHook(category: string): { shock: string; question: string; pain: string } {
  const hooks: Record<string, { shock: string; question: string; pain: string }> = {
    flight: {
      shock: "Il 90% degli italiani rinuncia a 600 euro quando il volo viene cancellato. Solo perche non sa di averli.",
      question: "Ti hanno offerto un voucher per un volo cancellato? Forse ti spettava molto di piu.",
      pain: "Volo cancellato. Ore in aeroporto. E alla fine un voucher da 50 euro. Ti suona familiare?"
    },
    energy: {
      shock: "Le bollette sbagliate costano agli italiani 2 miliardi all'anno. Quanti di questi sono tuoi?",
      question: "La tua bolletta ti sembra troppo alta? Spesso non e solo un'impressione.",
      pain: "Conguaglio da 800 euro. Nessuna spiegazione chiara. E il call center che non risponde."
    },
    bank: {
      shock: "Il 67% degli italiani paga commissioni bancarie illegittime senza saperlo.",
      question: "Hai mai controllato davvero tutte le commissioni sul tuo estratto conto?",
      pain: "Commissioni nascoste che spuntano ogni mese. Piccole cifre che diventano centinaia di euro."
    },
    telecom: {
      shock: "Ogni mese 3 milioni di italiani pagano servizi mai richiesti sul cellulare.",
      question: "Servizi a pagamento attivati senza il tuo consenso? Succede piu spesso di quanto pensi.",
      pain: "Bolletta telefonica raddoppiata. Servizi premium mai richiesti. E la beffa di non potersi disattivare."
    },
    ecommerce: {
      shock: "Su 100 pacchi persi, solo 12 persone ottengono il rimborso completo.",
      question: "Ordine pagato, pacco mai arrivato. Sai gia cosa fare per riavere i tuoi soldi?",
      pain: "Hai pagato. Hai aspettato. Il pacco non e mai arrivato. E l'assistenza clienti sparisce."
    },
    class_action: {
      shock: "Una class action ha fatto recuperare 47 milioni di euro a consumatori come te.",
      question: "Sai che potresti aver diritto a un risarcimento senza dover fare nulla da solo?",
      pain: "Quando un'azienda danneggia migliaia di persone, sembra impossibile ottenere giustizia. Ma non lo e."
    }
  };
  
  return hooks[category] || {
    shock: "L'80% degli italiani non reclama rimborsi che gli spettano di diritto.",
    question: "Sai quanti soldi potresti recuperare senza saperlo?",
    pain: "Soldi persi, tempo sprecato, burocrazia infinita. Ma esiste una scorciatoia."
  };
}

// Generate platform-optimized texts using AI with structured strategy
async function generatePlatformTexts(data: ArticleData, contentType: ContentType): Promise<PlatformTexts> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log("No Lovable API key, using fallback texts");
    return generateFallbackTexts(data, contentType);
  }

  const hooks = getCategoryHook(data.category || 'other');

  try {
    let systemPrompt = '';
    
    if (contentType === 'attraction') {
      systemPrompt = `Sei un esperto di marketing virale per Rimborsami.app, piattaforma italiana per recuperare rimborsi.

OBIETTIVO: Creare contenuti VIRALI che fermino lo scroll nei primi 3 secondi.

PRINCIPIO FONDAMENTALE: Vendi SCORCIATOIE, non vitamine!
- "Recupera 600 euro in 2 minuti" > "Conosci i tuoi diritti"
- "Risolvi tutto con un click" > "Informati sulla normativa"

STRUTTURA OBBLIGATORIA:
1. HOOK D'IMPATTO (primissima riga): verita scioccante o dato sorprendente che genera curiosita
   Esempio: "${hooks.shock}"
2. OPEN LOOP: anticipa che esiste una soluzione automatica/veloce (senza svelarla subito)
3. AGITAZIONE: amplifica brevemente il problema comune
4. TEASER SOLUZIONE: accenna alla scorciatoia
5. CTA: invita a seguire/leggere per scoprire come

REGOLE:
- Scrivi in italiano naturale, conversazionale
- NO emoji (massimo 1-2 se serve)
- Tono: tra l'indignato e l'empowering
- Target: pendolare frustrato, viaggiatore frequente, chi paga bollette
- Linguaggio diretto, frasi corte
- 2-3 hashtag MAX alla fine

FACEBOOK (150-200 parole): piu narrativo, crea curiosita
INSTAGRAM (100-150 parole): visual-first, hashtag importanti (6-8)
TWITTER (MAX 200 CARATTERI): una frase d'impatto + 1-2 hashtag`;
    
    } else if (contentType === 'education') {
      systemPrompt = `Sei un esperto di content marketing educativo per Rimborsami.app.

OBIETTIVO: Fornire VALORE GRATUITO che costruisce autorita e fiducia.

PRINCIPIO: Distruggi le convinzioni limitanti del target:
- "Ci vuole troppo tempo" -> mostra che bastano 2 minuti
- "E troppo complicato" -> spiega in modo semplice
- "Non ne vale la pena" -> mostra i numeri reali

STRUTTURA OBBLIGATORIA:
1. PROBLEMA COMUNE che il target riconosce subito
   Esempio: "${hooks.question}"
2. CONTENUTO EDUCATIVO: "3 cose che non sai su..." o "Ecco perche..."
3. DIMOSTRAZIONE: spiega un concetto tecnico in modo semplice (crea autorita)
4. CONFRONTO: vantaggio automatizzato vs fare tutto manualmente
5. CTA SOFT: invita a approfondire (non vendere direttamente)

REGOLE:
- Scrivi in italiano professionale ma accessibile
- NO emoji in eccesso (max 1-2)
- Tono: esperto che condivide conoscenza, non venditore
- Includi un dato/fatto concreto
- NON vendere l'app direttamente
- 2-3 hashtag alla fine

FACEBOOK (180-220 parole): formato "lista" o "miti da sfatare"
INSTAGRAM (120-160 parole): formato carosello testuale, 6-8 hashtag
TWITTER (MAX 200 CARATTERI): un consiglio pratico veloce`;

    } else { // conversion
      systemPrompt = `Sei un copywriter esperto in conversioni per Rimborsami.app.

OBIETTIVO: Trasformare lettori in utenti con CTA conversazionale.

PRINCIPIO: La vendita e una SCORCIATOIA al dolore, non una vitamina.
- Parti dal DOLORE specifico
- Presenta la SOLUZIONE come la via piu veloce
- CTA che invita all'AZIONE immediata

STRUTTURA OBBLIGATORIA:
1. DOLORE SPECIFICO (prima riga): descrivi una situazione frustrante
   Esempio: "${hooks.pain}"
2. AMPLIFICAZIONE: quanto tempo/soldi/stress costa non risolvere
3. MECCANISMO UNICO: "Rimborsami scioglie la burocrazia con un click"
4. SOCIAL PROOF: "Oltre 2.400 rimborsi ottenuti" (o dato simile)
5. CTA CONVERSAZIONALE: "Commenta RIMBORSO" o "Scrivi 'INFO' per ricevere..."

REGOLE:
- Scrivi in italiano diretto e urgente
- NO emoji (massimo 1)
- Tono: empatico ma deciso
- Focus su trasformazione: da frustrato a soddisfatto
- CTA che genera interazione (commenti)
- 2-3 hashtag alla fine

FACEBOOK (120-160 parole): CTA "Commenta RIMBORSO per ricevere il link"
INSTAGRAM (100-140 parole): CTA "Link in bio" o "Scrivi INFO nei DM"
TWITTER (MAX 200 CARATTERI): CTA diretto al link`;
    }

    const userPrompt = `Genera i post per questo articolo:
Titolo: ${data.title}
Categoria: ${data.category || 'other'}
Descrizione: ${data.excerpt}
URL: ${data.url}

TIPO CONTENUTO: ${contentType.toUpperCase()}

Rispondi SOLO con JSON valido:
{
  "facebook": "testo completo per facebook...",
  "instagram": "testo completo per instagram...",
  "twitter": "testo BREVE per twitter (max 200 caratteri)"
}`;

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
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateFallbackTexts(data, contentType);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content from AI");
      return generateFallbackTexts(data, contentType);
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in AI response");
      return generateFallbackTexts(data, contentType);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`AI generated ${contentType} platform texts successfully`);
    
    const twitterText = truncateTwitterText(parsed.twitter || generateFallbackTexts(data, contentType).twitter, 260);
    console.log(`Twitter text length: ${twitterText.length} chars`);
    
    return {
      facebook: parsed.facebook || generateFallbackTexts(data, contentType).facebook,
      instagram: parsed.instagram || generateFallbackTexts(data, contentType).instagram,
      twitter: twitterText,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return generateFallbackTexts(data, contentType);
  }
}

// Fallback texts based on content type
function generateFallbackTexts(data: ArticleData, contentType: ContentType): PlatformTexts {
  const hooks = getCategoryHook(data.category || 'other');
  const shortTitle = data.title.length > 120 ? data.title.substring(0, 117) + '...' : data.title;
  
  if (contentType === 'attraction') {
    return {
      facebook: `${hooks.shock}

E la cosa piu assurda? Recuperare quei soldi richiede meno di 5 minuti.

Ma nessuno te lo dice. Le aziende contano sul fatto che tu non sappia come fare.

${data.excerpt}

Vuoi scoprire come funziona? Leggi qui: ${data.url}

#Rimborso #SoldiRecuperati #DirittiConsumatori`,

      instagram: `${hooks.shock}

Non e colpa tua se non lo sapevi.
E colpa di chi non te lo ha mai spiegato.

${data.excerpt}

La buona notizia? Ora lo sai.
E puoi agire.

Link in bio per scoprire come recuperare i tuoi soldi.

#Rimborso #DirittiConsumatori #SoldiRecuperati #Italia #Consumatori #Risparmio #Soldi #ConsumerRights`,

      twitter: `${shortTitle.substring(0, 100)} Scopri quanto puoi recuperare. #Rimborso #ConsumerRights`
    };
  }
  
  if (contentType === 'education') {
    return {
      facebook: `${hooks.question}

Ecco 3 cose che probabilmente non sai:

1. Hai diritto a un rimborso anche se l'azienda dice di no
2. I termini per reclamare sono piu lunghi di quanto pensi
3. La maggior parte delle richieste viene accolta se fatta correttamente

Il problema? La burocrazia e fatta apposta per scoraggiarti.

${data.excerpt}

Approfondisci qui: ${data.url}

#DirittiConsumatori #Educazione #Rimborsi`,

      instagram: `${hooks.question}

MITO: "Ci vuole troppo tempo"
REALTA: Bastano 2-3 minuti se sai come fare

MITO: "Non ne vale la pena"
REALTA: La media dei rimborsi e 250-400 euro

MITO: "E troppo complicato"
REALTA: Basta conoscere i passaggi giusti

${data.excerpt}

Scopri tutto nell'articolo - link in bio

#DirittiConsumatori #MitiDaSfatare #Rimborso #Educazione #Italia #Soldi #Consumatori #ConsumerRights`,

      twitter: `Sai che hai diritto a un rimborso anche quando l'azienda dice no? Ecco come. #Rimborso #Diritti`
    };
  }
  
  // conversion
  return {
    facebook: `${hooks.pain}

So cosa stai pensando: "Non ne vale la pena, ci metto una vita."

E invece no.

Con Rimborsami.app analizzi la tua situazione in 60 secondi.
Scopri subito se hai diritto a un rimborso.
E se ce l'hai, ti guidiamo passo passo.

Oltre 2.400 italiani hanno gia recuperato i loro soldi.

Commenta "RIMBORSO" e ti mando il link per iniziare.

#Rimborso #SoldiRecuperati #Azione`,

    instagram: `${hooks.pain}

Quante volte hai lasciato perdere pensando "troppo complicato"?

Ora immagina di recuperare quei soldi in 5 minuti.

Rimborsami.app e la scorciatoia che cercavi:
Analisi gratuita in 60 secondi
Guida passo passo
Oltre 2.400 rimborsi ottenuti

Link in bio. O scrivi "INFO" nei DM.

#Rimborso #Azione #SoldiRecuperati #DirittiConsumatori #Italia #Consumatori #Soldi #LinkInBio`,

    twitter: `${shortTitle.substring(0, 80)} Scopri in 60 sec se ti spetta un rimborso. #Rimborso #Azione`
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
    const safeTwitterText = texts.twitter.length > 250 
      ? texts.twitter.substring(0, 247) + '...'
      : texts.twitter;
    
    console.log(`Final Twitter text (${safeTwitterText.length} chars): ${safeTwitterText}`);
    
    const requestBody: any = {
      post: {
        facebook: texts.facebook,
        instagram: texts.instagram,
        twitter: safeTwitterText,
        default: texts.facebook
      },
      platforms: ["facebook", "instagram", "twitter"]
    };

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ArticleData = await req.json();
    console.log("Received article data:", JSON.stringify({ title: data.title, category: data.category }));

    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine content strategy type
    const contentType = determineContentType(data.category);
    console.log(`Selected content type: ${contentType} for category: ${data.category}`);

    // Generate platform-optimized texts with content strategy
    console.log("Generating platform texts with AI...");
    const texts = await generatePlatformTexts(data, contentType);

    // Post to Ayrshare
    const ayrshareResult = await postToAyrshare(texts, data.imageUrl);

    // Log to database with content_type
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (data.articleId) {
      const platforms = ['facebook', 'instagram', 'twitter'];
      
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
          posted_at: platformResult?.status === 'success' ? new Date().toISOString() : null,
          content_type: contentType // Track which strategy was used
        });
      }
      
      console.log(`Logged results to social_posts table with content_type: ${contentType}`);
    }

    const allSuccess = !ayrshareResult.results?.errors?.length && ayrshareResult.success;

    return new Response(
      JSON.stringify({
        success: allSuccess,
        platforms: ['facebook', 'instagram', 'twitter'],
        contentType: contentType,
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
