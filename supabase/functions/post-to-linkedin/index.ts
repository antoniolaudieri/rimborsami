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

type ContentType = 'attraction' | 'education' | 'conversion';

// Determine content type - LinkedIn favors education and thought leadership
function determineLinkedInContentType(category: string = 'other'): ContentType {
  // LinkedIn distribution: 50% education, 30% attraction, 20% conversion
  const rand = Math.random();
  
  // Categories that work well for specific types on LinkedIn
  const categoryBias: Record<string, ContentType> = {
    flight: 'attraction',      // Emotional stories work
    energy: 'education',       // Technical depth appreciated
    bank: 'education',         // Professional audience wants insights
    telecom: 'education',      
    ecommerce: 'attraction',   // Relatable problems
    class_action: 'education'  // Legal/professional content
  };
  
  if (rand < 0.3 && categoryBias[category]) {
    return categoryBias[category];
  }
  
  if (rand < 0.5) return 'education';
  if (rand < 0.8) return 'attraction';
  return 'conversion';
}

// Get category-specific pain points and hooks
function getCategoryContent(category: string): { 
  painPoint: string; 
  solution: string; 
  stat: string;
  question: string;
} {
  const content: Record<string, { painPoint: string; solution: string; stat: string; question: string }> = {
    flight: {
      painPoint: "Volo cancellato all'ultimo. Ore di attesa in aeroporto. E alla fine ti offrono solo un voucher da 50 euro.",
      solution: "Recuperare fino a 600 euro di rimborso in meno di 5 minuti",
      stat: "Solo il 10% dei passeggeri reclama il rimborso che gli spetta",
      question: "Ti e mai capitato di rinunciare a un rimborso perche sembrava troppo complicato?"
    },
    energy: {
      painPoint: "Bolletta da 800 euro. Nessuna spiegazione. Il servizio clienti che rimbalza tra operatori per ore.",
      solution: "Analizzare la bolletta e identificare addebiti illegittimi in 60 secondi",
      stat: "2 miliardi di euro: tanto pagano ogni anno gli italiani in bollette sbagliate",
      question: "Quante volte hai pagato una bolletta senza controllarla davvero?"
    },
    bank: {
      painPoint: "Commissioni nascoste che compaiono ogni mese. Piccole cifre che in un anno diventano centinaia di euro.",
      solution: "Identificare commissioni illegittime e recuperare quanto ti spetta",
      stat: "Il 67% degli italiani paga commissioni bancarie che non dovrebbe",
      question: "Hai mai controllato davvero ogni riga del tuo estratto conto?"
    },
    telecom: {
      painPoint: "Servizi premium attivati senza consenso. Bolletta raddoppiata. E la beffa di non riuscire a disattivarli.",
      solution: "Bloccare i servizi non richiesti e ottenere il rimborso automatico",
      stat: "3 milioni di italiani pagano ogni mese servizi telefonici mai richiesti",
      question: "Hai mai trovato addebiti misteriosi sulla bolletta del telefono?"
    },
    ecommerce: {
      painPoint: "Ordine pagato. Settimane di attesa. Il pacco non arriva mai. E l'assistenza clienti che sparisce.",
      solution: "Aprire un reclamo efficace e ottenere il rimborso completo",
      stat: "Su 100 pacchi persi, solo 12 persone ottengono un rimborso completo",
      question: "Quanto tempo hai perso a inseguire un pacco che non arrivava?"
    },
    class_action: {
      painPoint: "Migliaia di consumatori danneggiati dalla stessa azienda. Ognuno da solo non ha voce.",
      solution: "Unirsi ad altri consumatori per ottenere giustizia collettiva",
      stat: "Una singola class action ha fatto recuperare 47 milioni di euro ai consumatori italiani",
      question: "Sai che potresti avere diritto a un risarcimento senza fare nulla da solo?"
    }
  };
  
  return content[category] || {
    painPoint: "Soldi persi, ore di burocrazia, stress infinito. E alla fine la sensazione di non poter fare nulla.",
    solution: "Recuperare i tuoi soldi in pochi minuti, senza stress",
    stat: "L'80% degli italiani non reclama rimborsi che gli spettano di diritto",
    question: "Quante volte hai rinunciato a soldi che ti spettavano?"
  };
}

// Generate engaging, human-like post text using AI
async function generateEngagingPost(data: ArticleData, contentType: ContentType): Promise<string> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!lovableApiKey) {
    console.log("No LOVABLE_API_KEY, using fallback post format");
    return generateFallbackPost(data, contentType);
  }

  const categoryContent = getCategoryContent(data.category);

  try {
    let systemPrompt = '';
    
    if (contentType === 'attraction') {
      systemPrompt = `Sei un esperto di content marketing virale per LinkedIn. Scrivi per Rimborsami.app, piattaforma italiana per recuperare rimborsi.

PRINCIPIO FONDAMENTALE: Vendi SCORCIATOIE, non vitamine!
"Recupera 600 euro in 2 minuti" batte "Conosci i tuoi diritti" sempre.

STRUTTURA OBBLIGATORIA:
1. HOOK (prima riga): Inizia con una verita scioccante o una domanda provocatoria
   Esempio: "${categoryContent.stat}" oppure "${categoryContent.question}"
2. STORIA/SITUAZIONE: Descrivi una situazione comune e frustrante (3-4 righe)
3. PLOT TWIST: Rivela che esiste una soluzione inaspettatamente semplice
4. BENEFICIO CONCRETO: Cosa ottiene chi agisce (soldi, tempo, serenita)
5. CTA: Invita a leggere/commentare/seguire

REGOLE:
- Tono: conversazionale, autentico, come un post personale
- NO frasi corporate o da marketing ("scopri come", "non perdere")
- MAX 1-2 emoji, solo se naturali
- 2-3 hashtag pertinenti alla fine
- 150-220 parole
- INCLUDI SEMPRE il link all'articolo`;
    
    } else if (contentType === 'education') {
      systemPrompt = `Sei un thought leader nel settore dei diritti dei consumatori su LinkedIn. Scrivi per Rimborsami.app.

OBIETTIVO: Costruire autorita condividendo conoscenza pratica e distruggendo miti.

STRUTTURA OBBLIGATORIA:
1. HOOK: Domanda o affermazione che sfida una convinzione comune
   Esempio: "${categoryContent.question}"
2. MITO DA SFATARE: "Molti pensano che... Ma la realta e..."
3. INSIGHT PRATICO: 2-3 punti concreti che il lettore puo usare subito
4. DATO/STATISTICA: "${categoryContent.stat}"
5. RIFLESSIONE: Connetti al problema sistemico piu ampio
6. CTA SOFT: Invita a commentare o a leggere di piu

REGOLE:
- Tono: esperto ma accessibile, mai arrogante
- Mostra di sapere cose che altri non sanno
- Distruggi la convinzione "ci vuole troppo tempo/e troppo complicato"
- NON vendere direttamente
- MAX 1 emoji
- 2-3 hashtag alla fine
- 180-250 parole
- INCLUDI il link all'articolo`;

    } else { // conversion
      systemPrompt = `Sei un copywriter specializzato in conversioni B2C su LinkedIn. Scrivi per Rimborsami.app.

OBIETTIVO: Trasformare lettori frustrati in utenti attivi.

USA QUESTA STRUTTURA (ma NON scrivere le etichette nel post!):
1. Inizia descrivendo la situazione frustrante in modo vivido: "${categoryContent.painPoint}"
2. Amplifica il dolore: quanto costa NON agire (tempo, soldi, stress)
3. Presenta la scorciatoia/soluzione: "${categoryContent.solution}"
4. Chiudi con una call to action specifica e facile

MECCANISMO UNICO: "Rimborsami analizza la tua situazione in 60 secondi e ti dice esattamente cosa fare"

SOCIAL PROOF DA INSERIRE: "Oltre 2.400 italiani hanno gia recuperato i loro soldi"

REGOLE CRITICHE:
- NON scrivere MAI etichette come "PAIN:", "AGITATE:", "SOLUTION:", "CTA:", "SOCIAL PROOF:" nel post
- Il post deve essere fluido e naturale, come se lo scrivesse una persona vera
- Parti SEMPRE dal dolore specifico, mai dalla soluzione
- Tono: empatico ma deciso, urgente senza essere aggressivo
- Mostra la trasformazione: da frustrato a sollevato
- CTA chiaro: link + azione specifica
- 120-180 parole
- 2-3 hashtag alla fine
- INCLUDI SEMPRE il link`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Scrivi un post LinkedIn per questo articolo:

TITOLO: ${data.title}
RIASSUNTO: ${data.excerpt}
CATEGORIA: ${data.category}
URL ARTICOLO: ${data.url}

TIPO CONTENUTO: ${contentType.toUpperCase()}

Ricorda: il post deve sembrare scritto da una persona vera. Includi il link all'articolo.`
          }
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("AI generation failed:", await response.text());
      return generateFallbackPost(data, contentType);
    }

    const result = await response.json();
    const generatedText = result.choices?.[0]?.message?.content?.trim();
    
    if (!generatedText) {
      return generateFallbackPost(data, contentType);
    }

    // Make sure the URL is included
    let finalText = generatedText;
    if (!finalText.includes(data.url)) {
      finalText += `\n\n${data.url}`;
    }

    console.log(`AI generated ${contentType} LinkedIn post:`, finalText);
    return finalText;
  } catch (error) {
    console.error("Error generating post with AI:", error);
    return generateFallbackPost(data, contentType);
  }
}

// Fallback templates based on content type
function generateFallbackPost(data: ArticleData, contentType: ContentType): string {
  const content = getCategoryContent(data.category);
  
  if (contentType === 'attraction') {
    return `${content.stat}

E sai qual e la cosa piu frustrante?

${content.painPoint}

Ma ecco il plot twist: ${content.solution}.

Non servono avvocati. Non servono ore di telefonate.
Solo sapere come fare.

${data.excerpt}

Leggi la guida completa: ${data.url}

#DirittiConsumatori #Rimborso #Italia`;
  }
  
  if (contentType === 'education') {
    return `${content.question}

Ecco cosa ho imparato aiutando centinaia di persone:

1. Le aziende contano sul fatto che tu non conosca i tuoi diritti
2. La maggior parte delle richieste viene accolta SE fatta correttamente
3. Il tempo che pensi di perdere e molto meno di quello che immagini

${content.stat}

Il sistema e fatto per scoraggiarti. Ma una volta che sai come funziona, tutto cambia.

${data.excerpt}

Approfondisci qui: ${data.url}

#DirittiConsumatori #Educazione #ConsumerRights`;
  }
  
  // conversion
  return `${content.painPoint}

Lo so perche lo sento ogni giorno.

E so anche cosa pensi: "Non ne vale la pena", "Ci metto una vita", "Tanto non funziona".

Ma se ti dicessi che ${content.solution}?

Oltre 2.400 italiani lo hanno gia fatto con Rimborsami.app.

Non devi fare tutto da solo.

Clicca qui per scoprire se hai diritto a un rimborso: ${data.url}

#Rimborso #Azione #SoldiRecuperati`;
}

async function postToLinkedIn(data: ArticleData, postText: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const personId = Deno.env.get("LINKEDIN_PERSON_ID");

  if (!accessToken || !personId) {
    throw new Error("LinkedIn credentials not configured (need LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID)");
  }

  console.log("Posting as person ID:", personId);

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: ArticleData = await req.json();
    console.log("Received article data:", data);

    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine content strategy type for LinkedIn
    const contentType = determineLinkedInContentType(data.category);
    console.log(`Selected LinkedIn content type: ${contentType} for category: ${data.category}`);

    // Generate engaging post text
    console.log("Generating engaging post text...");
    const postText = await generateEngagingPost(data, contentType);
    console.log("Generated post text:", postText);

    // Post to LinkedIn
    const result = await postToLinkedIn(data, postText);
    console.log("LinkedIn post result:", result);

    // Log the social post attempt with content_type
    if (data.articleId) {
      await supabase.from("social_posts").insert({
        article_id: data.articleId,
        platform: "linkedin",
        post_id: result.postId || null,
        status: result.success ? "posted" : "failed",
        error_message: result.error || null,
        posted_at: result.success ? new Date().toISOString() : null,
        content_type: contentType
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
        contentType: contentType,
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
