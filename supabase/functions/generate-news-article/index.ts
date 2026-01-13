import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SEO-focused categories with transactional and informational keywords
const SEO_CATEGORIES = [
  {
    category: "flight",
    transactional_keywords: [
      "come richiedere rimborso volo cancellato",
      "modulo rimborso Ryanair PDF",
      "calcola risarcimento ritardo volo",
      "richiesta rimborso Easyjet online",
      "rimborso volo Wizz Air come fare"
    ],
    informational_keywords: [
      "quanto tempo per rimborso volo cancellato",
      "diritti passeggero volo ritardo",
      "regolamento EU 261 spiegato semplice",
      "volo cancellato cosa fare",
      "risarcimento volo ritardo 3 ore"
    ],
    long_tail_keywords: [
      "rimborso Ryanair volo cancellato maltempo",
      "risarcimento ritardo 4 ore Easyjet Malpensa",
      "come compilare modulo EU261 italiano",
      "tempi rimborso ITA Airways esperienza"
    ],
    question_keywords: [
      "La compagnia aerea può rifiutare il rimborso?",
      "Quanto tempo ho per richiedere rimborso EU261?",
      "Cosa succede se il volo è cancellato per sciopero?",
      "Posso avere rimborso e risarcimento insieme?"
    ],
    companies: ["Ryanair", "Easyjet", "Wizz Air", "ITA Airways", "Lufthansa", "Vueling"],
    image_style: "Professional airport terminal with airplane at gate, blue sky, modern architecture, travel photography style"
  },
  {
    category: "telecom",
    transactional_keywords: [
      "modulo reclamo Vodafone PDF",
      "disdetta TIM senza penali come fare",
      "richiesta rimborso WindTre online",
      "contestare bolletta Fastweb modulo"
    ],
    informational_keywords: [
      "come contestare bolletta telefonica",
      "servizi non richiesti telefono cosa fare",
      "costi nascosti operatori telefonici",
      "diritti utente telefonia mobile"
    ],
    long_tail_keywords: [
      "rimborso Vodafone servizi non richiesti 2026",
      "come bloccare abbonamenti non voluti TIM",
      "reclamo Agcom bolletta errata procedura"
    ],
    question_keywords: [
      "Come faccio a sapere se ho servizi a pagamento attivi?",
      "Posso chiedere rimborso bollette degli ultimi 2 anni?",
      "L'operatore può addebitare costi senza consenso?"
    ],
    companies: ["TIM", "Vodafone", "WindTre", "Fastweb", "Iliad", "PosteMobile"],
    image_style: "Smartphone with phone bill notification, money coins, consumer protection concept, clean modern style"
  },
  {
    category: "bank",
    transactional_keywords: [
      "modulo reclamo banca commissioni",
      "richiesta rimborso bonifico errato",
      "segnalazione ABF come fare",
      "contestare addebito carta credito"
    ],
    informational_keywords: [
      "commissioni bancarie nascoste quali sono",
      "anatocismo bancario spiegato semplice",
      "truffa phishing banca diritti cliente",
      "conto corrente costi nascosti"
    ],
    long_tail_keywords: [
      "rimborso commissioni Intesa Sanpaolo come fare",
      "phishing Unicredit rimborso esperienza",
      "ABF ricorso tempi e costi"
    ],
    question_keywords: [
      "La banca deve rimborsare in caso di phishing?",
      "Quanto tempo ho per contestare un addebito?",
      "Come verificare commissioni nascoste sul conto?"
    ],
    companies: ["Intesa Sanpaolo", "Unicredit", "BNL", "Fineco", "ING", "N26"],
    image_style: "Banking concept with Euro bills, smartphone app, secure transaction, professional finance photography"
  },
  {
    category: "energy",
    transactional_keywords: [
      "modulo reclamo Enel bolletta",
      "richiesta bonus sociale luce gas",
      "contestare conguaglio bolletta energia",
      "domanda rimborso bolletta errata"
    ],
    informational_keywords: [
      "come leggere bolletta luce spiegata",
      "conguaglio bolletta cos'è e perché",
      "bonus energia requisiti 2026",
      "diritti consumatore energia elettrica"
    ],
    long_tail_keywords: [
      "conguaglio Enel 2000 euro come contestare",
      "bonus sociale automatico chi ne ha diritto",
      "reclamo Eni gas tempi risposta"
    ],
    question_keywords: [
      "Posso rifiutare di pagare un conguaglio eccessivo?",
      "Come faccio a sapere se ho diritto al bonus?",
      "Quanto tempo ho per contestare una bolletta?"
    ],
    companies: ["Enel", "Eni", "A2A", "Edison", "Sorgenia", "Illumia"],
    image_style: "Energy bills with light bulb, utility meter, home electricity concept, bright clean photography"
  },
  {
    category: "ecommerce",
    transactional_keywords: [
      "richiesta rimborso Amazon prodotto difettoso",
      "modulo reso Zalando come fare",
      "reclamo eBay venditore truffa",
      "garanzia legale come farla valere"
    ],
    informational_keywords: [
      "diritto recesso online 14 giorni spiegato",
      "garanzia legale 2 anni cosa copre",
      "acquisto online cosa fare se non arriva",
      "prodotto difettoso diritti consumatore"
    ],
    long_tail_keywords: [
      "Amazon rimborso non ricevuto dopo 30 giorni",
      "Zalando pacco non arrivato come risolvere",
      "garanzia Apple dopo 1 anno cosa fare"
    ],
    question_keywords: [
      "Posso restituire un prodotto usato?",
      "Chi paga le spese di reso nell'e-commerce?",
      "La garanzia vale anche per prodotti in saldo?"
    ],
    companies: ["Amazon", "Zalando", "eBay", "Mediaworld", "Unieuro", "Apple Store"],
    image_style: "Online shopping with laptop, packages and shopping cart, e-commerce concept, modern lifestyle photography"
  },
  {
    category: "class_action",
    transactional_keywords: [
      "aderire class action Dieselgate procedura",
      "modulo adesione azione collettiva",
      "class action attive Italia come partecipare",
      "risarcimento collettivo come richiederlo"
    ],
    informational_keywords: [
      "class action Italia come funziona",
      "differenza class action azione collettiva",
      "tempi class action quanto dura",
      "costi aderire class action"
    ],
    long_tail_keywords: [
      "Dieselgate Volkswagen risarcimento quanto spetta",
      "class action Apple batteria iPhone come aderire",
      "azione collettiva banche commissioni aggiornamenti"
    ],
    question_keywords: [
      "Conviene aderire a una class action?",
      "Quanto si può ottenere da una class action?",
      "Cosa succede se la class action perde?"
    ],
    companies: ["Volkswagen", "Apple", "Google", "Meta", "Stellantis", "TIM"],
    image_style: "Courthouse with scales of justice, group of people, legal victory concept, professional legal photography"
  }
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

async function generateImage(topic: string, imageStyle: string, lovableApiKey: string, supabaseClient: any, supabaseUrl: string): Promise<string | null> {
  try {
    const imagePrompt = `Create a professional blog header image 16:9 aspect ratio for article: "${topic}". 
Style: ${imageStyle}. 
REQUIREMENTS: NO text overlay, NO words, NO letters in the image. High quality, vibrant colors with blue and green tones. Ultra high resolution.`;
    
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "google/gemini-2.5-flash-image-preview", 
        messages: [{ role: "user", content: imagePrompt }], 
        modalities: ["image", "text"] 
      }),
    });
    
    if (!imageResponse.ok) {
      console.error("Image generation failed:", await imageResponse.text());
      return null;
    }
    
    const imageData = await imageResponse.json();
    const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!base64Image) return null;
    
    const base64Match = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) return null;
    
    const bytes = Uint8Array.from(atob(base64Match[2]), c => c.charCodeAt(0));
    const fileName = `article-${Date.now()}-${Math.random().toString(36).substring(7)}.${base64Match[1]}`;
    
    const { error } = await supabaseClient.storage
      .from("news-images")
      .upload(fileName, bytes, { contentType: `image/${base64Match[1]}` });
    
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    
    return `${supabaseUrl}/storage/v1/object/public/news-images/${fileName}`;
  } catch (e) {
    console.error("Image generation error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Select random category and build keyword context
    const categoryData = SEO_CATEGORIES[Math.floor(Math.random() * SEO_CATEGORIES.length)];
    const company = categoryData.companies[Math.floor(Math.random() * categoryData.companies.length)];
    const currentYear = new Date().getFullYear();
    
    // Randomly select search intent (60% transactional, 40% informational for conversions)
    const isTransactional = Math.random() < 0.6;
    const searchIntent = isTransactional ? "transactional" : "informational";
    
    // Select primary keyword based on intent
    const keywordPool = isTransactional 
      ? categoryData.transactional_keywords 
      : categoryData.informational_keywords;
    const primaryKeyword = keywordPool[Math.floor(Math.random() * keywordPool.length)]
      .replace("{company}", company)
      .replace("{anno}", String(currentYear));
    
    // Select supporting keywords
    const longTailKeyword = categoryData.long_tail_keywords[Math.floor(Math.random() * categoryData.long_tail_keywords.length)];
    const questionKeywords = categoryData.question_keywords.slice(0, 3);
    
    console.log(`Generating SEO article: ${primaryKeyword} (${searchIntent})`);
    
    // Start image generation in parallel
    const imagePromise = generateImage(primaryKeyword, categoryData.image_style, lovableApiKey, supabase, supabaseUrl);
    
    // STEP 1: Dynamic SEO Keyword Research with AI
    const seoResearchPrompt = `Sei un esperto SEO italiano specializzato in diritti dei consumatori e rimborsi.

Per la keyword principale: "${primaryKeyword}"
Categoria: ${categoryData.category}
Azienda focus: ${company}
Anno: ${currentYear}

Analizza e restituisci in formato JSON:
{
  "optimized_title": "Titolo SEO ottimizzato max 60 caratteri con keyword principale all'inizio",
  "meta_description": "Meta description persuasiva max 155 caratteri con CTA e keyword",
  "h1_tag": "H1 leggermente diverso dal title ma con keyword principale",
  "secondary_keywords": ["5 keywords correlate per densità nel testo"],
  "lsi_keywords": ["5 keywords LSI (semanticamente correlate)"],
  "featured_snippet_target": "Risposta diretta di 40-60 parole per posizione zero Google",
  "search_volume_estimate": "alto/medio/basso",
  "competition_level": "alto/medio/basso"
}

Concentrati su keywords che gli italiani cercano realmente per ottenere rimborsi.`;

    const seoResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: seoResearchPrompt }]
      }),
    });
    
    if (!seoResponse.ok) {
      throw new Error(`SEO research failed: ${seoResponse.status}`);
    }
    
    const seoData = await seoResponse.json();
    let seoText = seoData.choices?.[0]?.message?.content?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const seoKeywords = JSON.parse(seoText);
    
    console.log("SEO Keywords generated:", seoKeywords.optimized_title);
    
    // STEP 2: Generate SEO-Optimized Article
    const articlePrompt = `Sei un esperto copywriter SEO italiano specializzato in diritti dei consumatori. Scrivi per rimborsami.app.

KEYWORD PRINCIPALE (MUST INCLUDE nelle prime 100 parole): "${primaryKeyword}"
TITLE TAG: "${seoKeywords.optimized_title}"
H1: "${seoKeywords.h1_tag}"
KEYWORDS SECONDARIE: ${seoKeywords.secondary_keywords.join(", ")}
LSI KEYWORDS: ${seoKeywords.lsi_keywords.join(", ")}
AZIENDA: ${company}
INTENT: ${searchIntent}

STRUTTURA SEO OBBLIGATORIA:

1. INTRODUZIONE (100-150 parole):
   - Hook emotivo con statistica o dato impattante
   - Keyword principale nelle prime 50 parole
   - Anticipazione del valore dell'articolo
   - Snippet per posizione zero: "${seoKeywords.featured_snippet_target}"

2. INDICE DEI CONTENUTI (per featured snippets):
   - Lista di 5-7 punti cliccabili

3. CORPO ARTICOLO (minimo 1200 parole):
   - 4-6 sezioni H2 con keywords secondarie nei titoli
   - Sottosezioni H3 dove appropriato
   - Keyword density 1-2% naturale
   - Box informativi con classe "info-box" per dati importanti
   - Tabelle comparative dove possibile
   - Liste puntate per scannabilità
   - Citazioni leggi italiane reali (Codice del Consumo, EU 261, etc.)

4. FAQ SECTION (OBBLIGATORIA - per rich snippets Google):
   Usa il formato <details><summary>Domanda?</summary><p>Risposta completa</p></details>
   Includi queste domande:
   ${questionKeywords.map(q => `- ${q}`).join('\n   ')}
   + 2-3 domande aggiuntive pertinenti

5. SEZIONE "COME RIMBORSAMI TI AIUTA":
   - Spiegazione dei servizi di rimborsami.app
   - CTA forte: "Fai il quiz gratuito" con link a /quiz

6. CONCLUSIONE:
   - Riepilogo dei punti chiave
   - CTA finale persuasivo

FORMATTAZIONE HTML:
- Usa <h2>, <h3> per struttura
- Usa <ul>, <ol> per liste
- Usa <strong> per keywords importanti
- Usa <blockquote> per citazioni legali
- Usa <table> per comparazioni
- Usa <details><summary> per FAQ
- Usa <div class="info-box"> per box informativi
- Aggiungi link interni: <a href="/quiz">fai il quiz</a>, <a href="/opportunities">scopri opportunità</a>

TONO: Professionale ma accessibile, empatico, orientato all'azione.
EMOJI: Usa 2-3 emoji nei titoli H2 per engagement (es. ⚠️ 💰 📋 ✅)

Restituisci SOLO JSON valido:
{
  "title": "${seoKeywords.optimized_title}",
  "excerpt": "Estratto accattivante max 160 char con keyword",
  "meta_description": "${seoKeywords.meta_description}",
  "content": "HTML completo dell'articolo",
  "keywords": ["8-10 keywords ottimizzate"],
  "reading_time_minutes": numero,
  "faq_items": [{"question": "...", "answer": "..."}],
  "internal_links": ["/quiz", "/opportunities"]
}`;

    const articleResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "Sei un esperto SEO copywriter italiano. Scrivi SOLO articoli di alta qualità ottimizzati per Google. Rispondi SOLO con JSON valido." },
          { role: "user", content: articlePrompt }
        ]
      }),
    });
    
    if (!articleResponse.ok) {
      throw new Error(`Article generation failed: ${articleResponse.status}`);
    }
    
    const aiResponse = await articleResponse.json();
    let articleText = aiResponse.choices?.[0]?.message?.content?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Parse article data
    const articleData = JSON.parse(articleText);
    
    // Wait for image
    const featuredImageUrl = await imagePromise;
    
    // Generate slug
    const slug = `${generateSlug(articleData.title || seoKeywords.optimized_title)}-${Date.now().toString(36)}`;
    
    // Build FAQ Schema for rich snippets
    const faqSchema = articleData.faq_items ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": articleData.faq_items.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    } : null;
    
    // Truncate fields to match database constraints
    const safeTitle = (articleData.title || seoKeywords.optimized_title).substring(0, 255);
    const safeExcerpt = (articleData.excerpt || "").substring(0, 160);
    const safeMetaDesc = (articleData.meta_description || seoKeywords.meta_description || "").substring(0, 155);
    
    // Insert article with SEO tracking fields
    const { data: article, error } = await supabase
      .from("news_articles")
      .insert({
        slug,
        title: safeTitle,
        excerpt: safeExcerpt,
        meta_description: safeMetaDesc,
        content: articleData.content,
        category: categoryData.category,
        keywords: articleData.keywords || [...seoKeywords.secondary_keywords, ...seoKeywords.lsi_keywords],
        reading_time_minutes: articleData.reading_time_minutes || 7,
        featured_image_url: featuredImageUrl,
        is_published: true,
        published_at: new Date().toISOString(),
        // New SEO tracking fields
        primary_keyword: primaryKeyword,
        search_intent: searchIntent,
        target_word_count: 1500,
        faq_schema: faqSchema,
        internal_links: articleData.internal_links || ["/quiz", "/opportunities"]
      })
      .select()
      .single();
    
    if (error) {
      console.error("Database insert error:", error);
      throw error;
    }
    
    console.log(`✅ Article published: ${article.slug}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          primary_keyword: primaryKeyword,
          search_intent: searchIntent,
          featured_image_url: article.featured_image_url
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error generating article:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
