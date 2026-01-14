import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category to author mapping
const CATEGORY_AUTHOR_MAP: Record<string, string[]> = {
  flight: ["luca-benedetti", "sara-marchetti"],
  telecom: ["federico-colombo", "chiara-mantovani"],
  bank: ["alessandro-ferrante", "martina-galli"],
  energy: ["chiara-mantovani", "alessandro-ferrante"],
  ecommerce: ["sara-marchetti", "federico-colombo"],
  class_action: ["martina-galli", "luca-benedetti"],
};

// SEO categories with real user queries
const SEO_CATEGORIES: Record<string, { keywords: string[]; companies: string[] }> = {
  flight: {
    keywords: [
      "rimborso volo cancellato",
      "risarcimento ritardo aereo",
      "bagaglio smarrito cosa fare",
      "volo in overbooking diritti",
      "compensazione EU 261",
      "reclamo compagnia aerea",
      "rimborso volo non effettuato",
      "ritardo volo oltre 3 ore",
    ],
    companies: ["Ryanair", "EasyJet", "ITA Airways", "Wizz Air", "Vueling", "Lufthansa"],
  },
  telecom: {
    keywords: [
      "disdetta contratto telefono",
      "rimborso bolletta sbagliata",
      "reclamo operatore telefonico",
      "penale recesso anticipato",
      "problemi cambio operatore",
      "addebiti non richiesti telefono",
      "rimborso servizi non attivati",
      "contestazione fattura TIM Vodafone",
    ],
    companies: ["TIM", "Vodafone", "WindTre", "Fastweb", "Iliad", "ho. Mobile"],
  },
  bank: {
    keywords: [
      "commissioni bancarie illegittime",
      "anatocismo conto corrente",
      "reclamo banca tempi",
      "rimborso frode carta credito",
      "costi nascosti mutuo",
      "contestazione estratto conto",
      "interessi usurari prestito",
      "phishing banca risarcimento",
    ],
    companies: ["Intesa Sanpaolo", "UniCredit", "BNL", "Fineco", "ING", "N26"],
  },
  energy: {
    keywords: [
      "bolletta luce troppo alta",
      "conguaglio gas contestazione",
      "cambio fornitore energia",
      "voltura contatore tempi",
      "bonus sociale luce gas",
      "reclamo Enel Eni",
      "autolettura contatore",
      "prescrizione bollette energia",
    ],
    companies: ["Enel", "Eni", "A2A", "Edison", "Sorgenia", "Plenitude"],
  },
  ecommerce: {
    keywords: [
      "rimborso acquisto online",
      "pacco non arrivato cosa fare",
      "diritto recesso 14 giorni",
      "prodotto difettoso garanzia",
      "truffa online denuncia",
      "reso Amazon Zalando",
      "pagamento non riconosciuto",
      "merce diversa da foto",
    ],
    companies: ["Amazon", "Zalando", "eBay", "AliExpress", "Shein", "Temu"],
  },
  class_action: {
    keywords: [
      "class action come partecipare",
      "azione collettiva consumatori",
      "risarcimento danni collettivo",
      "causa collettiva azienda",
      "unirsi class action Italia",
      "associazione consumatori reclamo",
    ],
    companies: ["Volkswagen", "Apple", "Google", "Meta", "Samsung"],
  },
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .replace(/-$/, "");
}

// Agent 1: SEO & Query Research
async function agentSEO(
  apiKey: string,
  category: string,
  recentArticles: { title: string; primary_keyword: string }[]
): Promise<{
  keyword: string;
  userIntent: string;
  relatedQuestions: string[];
  suggestedTitle: string;
  company: string;
}> {
  const categoryData = SEO_CATEGORIES[category];
  const usedKeywords = recentArticles.map((a) => a.primary_keyword?.toLowerCase() || "");
  
  // Filter out already used keywords
  const availableKeywords = categoryData.keywords.filter(
    (k) => !usedKeywords.some((used) => k.toLowerCase().includes(used) || used.includes(k.toLowerCase()))
  );
  
  if (availableKeywords.length === 0) {
    // All keywords used, pick least recent
    availableKeywords.push(...categoryData.keywords.slice(0, 3));
  }

  const prompt = `Sei un esperto SEO italiano specializzato in diritti dei consumatori.

Categoria: ${category}
Keywords disponibili: ${availableKeywords.join(", ")}
Aziende rilevanti: ${categoryData.companies.join(", ")}

Articoli già pubblicati (da NON ripetere):
${recentArticles.slice(0, 10).map((a) => `- ${a.title}`).join("\n")}

Genera un brief editoriale per un NUOVO articolo che:
1. Risponda a una query di ricerca REALE degli utenti italiani
2. NON sia simile agli articoli già pubblicati
3. Sia specifico e concreto, non generico
4. Abbia un angolo originale

Rispondi SOLO in questo formato JSON:
{
  "keyword": "la keyword principale (query reale)",
  "userIntent": "cosa vuole sapere l'utente in 1 frase",
  "relatedQuestions": ["domanda 1", "domanda 2", "domanda 3"],
  "suggestedTitle": "titolo descrittivo senza emoji, max 70 caratteri",
  "company": "azienda specifica da menzionare o 'generale'"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`SEO Agent failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Fallback to random selection
    const randomKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
    const randomCompany = categoryData.companies[Math.floor(Math.random() * categoryData.companies.length)];
    return {
      keyword: randomKeyword,
      userIntent: `Capire come gestire ${randomKeyword}`,
      relatedQuestions: ["Quali sono i miei diritti?", "Quanto tempo ho?", "Come fare reclamo?"],
      suggestedTitle: `${randomKeyword}: guida pratica ai tuoi diritti`,
      company: randomCompany,
    };
  }

  return JSON.parse(jsonMatch[0]);
}

// Agent 2: Editorial Writer
async function agentEditorial(
  apiKey: string,
  brief: {
    keyword: string;
    userIntent: string;
    relatedQuestions: string[];
    suggestedTitle: string;
    company: string;
  },
  category: string,
  opportunity: { title: string; description: string } | null
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  faqSchema: { question: string; answer: string }[];
}> {
  const systemPrompt = `Sei un giornalista esperto di diritti dei consumatori italiani.

## REGOLE FONDAMENTALI (OBBLIGATORIE)
- Scrivi in italiano chiaro, naturale, comprensibile anche a chi non è esperto
- Evita COMPLETAMENTE tono pubblicitario, promesse esagerate, linguaggio da marketing
- Concentrati su problemi REALI delle persone
- Spiega SEMPRE il contesto prima della soluzione
- Sii originale, non ripetitivo, non generico
- NON usare emoji nel titolo o nei sottotitoli
- NON usare frasi come "Ecco come", "Scopri", "Incredibile"
- NON promettere risultati certi o immediati

## STRUTTURA OBBLIGATORIA (segui esattamente)
1. **Introduzione** (100-150 parole): Spiega il problema e perché l'utente sta leggendo
2. **Il problema nel dettaglio** (150-200 parole): Casi comuni, statistiche se disponibili
3. **I tuoi diritti** (100-150 parole): Riferimenti normativi concreti (leggi, regolamenti EU)
4. **Guida passo-passo** (200-250 parole): Procedura concreta con passaggi numerati
5. **Se non funziona** (100-150 parole): Alternative, escalation, tempi di risposta
6. **FAQ** (3-4 domande realistiche con risposte brevi)
7. **Conclusione** (50-80 parole): CTA soft verso Rimborsami come SUPPORTO possibile, non obbligatorio

## TONO
- Parla come un amico esperto, non come un venditore
- Usa "tu" per rivolgerti al lettore
- Ammetti le difficoltà ("può essere frustrante", "non sempre è facile")
- Dai informazioni utili anche se l'utente non usa Rimborsami

## FORMATTAZIONE HTML
- Usa <h2> per sezioni principali
- Usa <h3> per sottosezioni
- Usa <ul>/<li> per elenchi
- Usa <strong> per termini importanti
- Usa <p> per paragrafi
- NON usare <h1> (è nel titolo)

## LUNGHEZZA: 800-1200 parole (non di più!)`;

  const userPrompt = `Scrivi un articolo completo basato su questo brief:

**Keyword principale:** ${brief.keyword}
**Intent utente:** ${brief.userIntent}
**Domande correlate:** ${brief.relatedQuestions.join(", ")}
**Titolo suggerito:** ${brief.suggestedTitle}
**Azienda da menzionare:** ${brief.company}
**Categoria:** ${category}
${opportunity ? `\n**Opportunità correlata:** ${opportunity.title} - ${opportunity.description}` : ""}

Rispondi in questo formato JSON:
{
  "title": "titolo finale (max 70 caratteri, NO emoji)",
  "content": "contenuto HTML completo dell'articolo",
  "excerpt": "riassunto in 150-200 caratteri",
  "metaDescription": "meta description SEO in 150-160 caratteri",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "faqSchema": [
    {"question": "domanda 1", "answer": "risposta 1"},
    {"question": "domanda 2", "answer": "risposta 2"},
    {"question": "domanda 3", "answer": "risposta 3"}
  ]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Editorial Agent failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Editorial Agent returned invalid JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

// Agent 3: Quality Check & Deduplication
async function agentQualityCheck(
  apiKey: string,
  article: {
    title: string;
    content: string;
    excerpt: string;
  },
  recentArticles: { title: string; content: string }[]
): Promise<{
  score: number;
  notes: string;
  isDuplicate: boolean;
  issues: string[];
}> {
  // Check content length (word count)
  const wordCount = article.content.split(/\s+/).length;
  
  const recentTitles = recentArticles.slice(0, 20).map((a) => a.title).join("\n- ");

  const prompt = `Sei un editor quality check per un magazine sui diritti dei consumatori.

Analizza questo articolo:

**Titolo:** ${article.title}
**Excerpt:** ${article.excerpt}
**Conteggio parole:** ${wordCount}

**Contenuto (primi 2000 caratteri):**
${article.content.substring(0, 2000)}

**Titoli articoli recenti (da controllare per duplicati):**
- ${recentTitles}

Valuta l'articolo secondo questi criteri:
1. **Originalità** (1-10): È diverso dagli articoli recenti? Angolo nuovo?
2. **Qualità scrittura** (1-10): Italiano chiaro? No marketing aggressivo?
3. **Struttura** (1-10): Ha tutte le sezioni richieste? FAQ realistiche?
4. **Utilità** (1-10): Informazioni concrete e actionable?
5. **Lunghezza** (1-10): Tra 800-1200 parole? (attuale: ${wordCount})

Rispondi SOLO in formato JSON:
{
  "score": numero da 1 a 10 (media pesata),
  "notes": "note editoriali brevi",
  "isDuplicate": true/false,
  "issues": ["problema 1", "problema 2"] o []
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Quality Check Agent failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Fallback to basic checks
    return {
      score: wordCount >= 600 && wordCount <= 1500 ? 7 : 5,
      notes: "Valutazione automatica basica",
      isDuplicate: false,
      issues: wordCount < 600 ? ["Articolo troppo corto"] : [],
    };
  }

  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting multi-agent article generation v2...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body (optional category override)
    let targetCategory: string | null = null;
    try {
      const body = await req.json();
      targetCategory = body.category || null;
    } catch {
      // No body, will auto-select category
    }

    // Fetch recent articles for deduplication
    const { data: recentArticles, error: recentError } = await supabase
      .from("news_articles")
      .select("title, primary_keyword, content, category")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);

    if (recentError) {
      console.error("Error fetching recent articles:", recentError);
    }

    // Determine category with least coverage if not specified
    if (!targetCategory) {
      const categoryCounts: Record<string, number> = {};
      const allCategories = Object.keys(SEO_CATEGORIES);
      
      allCategories.forEach((cat) => (categoryCounts[cat] = 0));
      recentArticles?.forEach((article) => {
        if (categoryCounts[article.category] !== undefined) {
          categoryCounts[article.category]++;
        }
      });

      // Pick category with least coverage
      targetCategory = Object.entries(categoryCounts)
        .sort((a, b) => a[1] - b[1])
        .map(([cat]) => cat)[0];
    }

    console.log(`Selected category: ${targetCategory}`);

    // AGENT 1: SEO Research
    console.log("Running SEO Agent...");
    const seoBrief = await agentSEO(
      lovableApiKey,
      targetCategory,
      recentArticles?.map((a) => ({ title: a.title, primary_keyword: a.primary_keyword })) || []
    );
    console.log("SEO Brief:", seoBrief);

    // Fetch related opportunity
    const { data: opportunities } = await supabase
      .from("opportunities")
      .select("id, title, description, short_description")
      .eq("category", targetCategory)
      .eq("active", true)
      .limit(5);

    const selectedOpportunity = opportunities?.[Math.floor(Math.random() * (opportunities?.length || 1))] || null;

    // AGENT 2: Editorial Writing
    console.log("Running Editorial Agent...");
    const articleContent = await agentEditorial(
      lovableApiKey,
      seoBrief,
      targetCategory,
      selectedOpportunity ? { title: selectedOpportunity.title, description: selectedOpportunity.short_description || selectedOpportunity.description || "" } : null
    );
    console.log("Article title:", articleContent.title);

    // AGENT 3: Quality Check
    console.log("Running Quality Check Agent...");
    const qualityResult = await agentQualityCheck(
      lovableApiKey,
      {
        title: articleContent.title,
        content: articleContent.content,
        excerpt: articleContent.excerpt,
      },
      recentArticles?.map((a) => ({ title: a.title, content: a.content })) || []
    );
    console.log("Quality score:", qualityResult.score, "Notes:", qualityResult.notes);

    // Decision based on quality score
    if (qualityResult.isDuplicate) {
      console.log("Article rejected: duplicate content detected");
      return new Response(
        JSON.stringify({
          success: false,
          reason: "duplicate",
          notes: qualityResult.notes,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (qualityResult.score < 5) {
      console.log("Article rejected: quality score too low");
      return new Response(
        JSON.stringify({
          success: false,
          reason: "low_quality",
          score: qualityResult.score,
          issues: qualityResult.issues,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Select author
    const authorSlugs = CATEGORY_AUTHOR_MAP[targetCategory] || ["luca-benedetti"];
    const authorSlug = authorSlugs[Math.floor(Math.random() * authorSlugs.length)];
    
    const { data: author } = await supabase
      .from("news_authors")
      .select("id")
      .eq("slug", authorSlug)
      .single();

    // Generate slug
    const slug = generateSlug(articleContent.title);
    const timestamp = Date.now().toString(36);
    const uniqueSlug = `${slug}-${timestamp}`;

    // Calculate reading time
    const wordCount = articleContent.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Truncate fields to fit database constraints
    const truncatedTitle = articleContent.title.substring(0, 255);
    const truncatedExcerpt = articleContent.excerpt.substring(0, 500);
    const truncatedMetaDescription = articleContent.metaDescription.substring(0, 160);
    const truncatedPrimaryKeyword = seoBrief.keyword.substring(0, 100);

    // Insert article
    const { data: insertedArticle, error: insertError } = await supabase
      .from("news_articles")
      .insert({
        title: truncatedTitle,
        slug: uniqueSlug,
        content: articleContent.content,
        excerpt: truncatedExcerpt,
        meta_description: truncatedMetaDescription,
        keywords: articleContent.keywords.slice(0, 10),
        primary_keyword: truncatedPrimaryKeyword,
        category: targetCategory,
        author_id: author?.id || null,
        opportunity_id: selectedOpportunity?.id || null,
        faq_schema: articleContent.faqSchema,
        reading_time_minutes: readingTime,
        is_published: true,
        published_at: new Date().toISOString(),
        quality_score: Math.round(qualityResult.score),
        editorial_notes: qualityResult.notes,
        generation_version: "v2-multiagent",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting article:", insertError);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    // Update author article count
    if (author?.id) {
      try {
        const { data: authorData } = await supabase
          .from("news_authors")
          .select("articles_count")
          .eq("id", author.id)
          .single();
        
        await supabase
          .from("news_authors")
          .update({ articles_count: (authorData?.articles_count || 0) + 1 })
          .eq("id", author.id);
      } catch (e) {
        console.error("Failed to update author article count:", e);
      }
    }

    console.log("Article published successfully:", insertedArticle?.slug);

    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: insertedArticle?.id,
          title: articleContent.title,
          slug: uniqueSlug,
          category: targetCategory,
          qualityScore: qualityResult.score,
          editorialNotes: qualityResult.notes,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Multi-agent generation error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
