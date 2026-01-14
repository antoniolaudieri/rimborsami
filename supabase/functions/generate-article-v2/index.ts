import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category to author mapping
const CATEGORY_AUTHOR_MAP: Record<string, string[]> = {
  flight: ["luca-benedetti", "sara-marchetti", "federico-colombo"],
  telecom: ["federico-colombo", "chiara-mantovani", "luca-benedetti"],
  bank: ["alessandro-ferrante", "martina-galli"],
  energy: ["chiara-mantovani", "alessandro-ferrante", "luca-benedetti"],
  ecommerce: ["sara-marchetti", "federico-colombo", "martina-galli"],
  class_action: ["martina-galli", "luca-benedetti", "alessandro-ferrante"],
};

// SEO categories with advanced keywords structure
const SEO_CATEGORIES: Record<string, {
  transactional_keywords: string[];
  informational_keywords: string[];
  long_tail_keywords: string[];
  question_keywords: string[];
  companies: string[];
  image_style: string;
}> = {
  flight: {
    transactional_keywords: [
      "come richiedere rimborso volo cancellato",
      "modulo rimborso Ryanair PDF",
      "calcola risarcimento ritardo volo",
      "richiesta rimborso Easyjet online",
      "rimborso volo Wizz Air come fare",
      "compilare modulo EU261"
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
    companies: ["Ryanair", "EasyJet", "ITA Airways", "Wizz Air", "Vueling", "Lufthansa"],
    image_style: "Professional airport terminal with airplane at gate, blue sky, modern architecture, travel photography style"
  },
  telecom: {
    transactional_keywords: [
      "modulo reclamo Vodafone PDF",
      "disdetta TIM senza penali come fare",
      "richiesta rimborso WindTre online",
      "contestare bolletta Fastweb modulo",
      "recesso anticipato contratto telefono"
    ],
    informational_keywords: [
      "come contestare bolletta telefonica",
      "servizi non richiesti telefono cosa fare",
      "costi nascosti operatori telefonici",
      "diritti utente telefonia mobile",
      "prescrizione bollette telefoniche"
    ],
    long_tail_keywords: [
      "rimborso Vodafone servizi non richiesti 2026",
      "come bloccare abbonamenti non voluti TIM",
      "reclamo Agcom bolletta errata procedura"
    ],
    question_keywords: [
      "Come faccio a sapere se ho servizi a pagamento attivi?",
      "Posso chiedere rimborso bollette degli ultimi 2 anni?",
      "L'operatore può addebitare costi senza consenso?",
      "Come disdire contratto senza penale?"
    ],
    companies: ["TIM", "Vodafone", "WindTre", "Fastweb", "Iliad", "PosteMobile"],
    image_style: "Smartphone with phone bill notification, money coins, consumer protection concept, clean modern style"
  },
  bank: {
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
      "Come verificare commissioni nascoste sul conto?",
      "Posso cambiare banca gratis?"
    ],
    companies: ["Intesa Sanpaolo", "UniCredit", "BNL", "Fineco", "ING", "N26"],
    image_style: "Banking concept with Euro bills, smartphone app, secure transaction, professional finance photography"
  },
  energy: {
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
      "diritti consumatore energia elettrica",
      "prescrizione bollette luce gas"
    ],
    long_tail_keywords: [
      "conguaglio Enel 2000 euro come contestare",
      "bonus sociale automatico chi ne ha diritto",
      "reclamo Eni gas tempi risposta"
    ],
    question_keywords: [
      "Posso rifiutare di pagare un conguaglio eccessivo?",
      "Come faccio a sapere se ho diritto al bonus?",
      "Quanto tempo ho per contestare una bolletta?",
      "Cosa fare se il contatore è guasto?"
    ],
    companies: ["Enel", "Eni", "A2A", "Edison", "Sorgenia", "Plenitude"],
    image_style: "Energy bills with light bulb, utility meter, home electricity concept, bright clean photography"
  },
  ecommerce: {
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
      "La garanzia vale anche per prodotti in saldo?",
      "Cosa fare se il prodotto è diverso dalla foto?"
    ],
    companies: ["Amazon", "Zalando", "eBay", "Mediaworld", "Unieuro", "AliExpress"],
    image_style: "Online shopping with laptop, packages and shopping cart, e-commerce concept, modern lifestyle photography"
  },
  class_action: {
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
      "Cosa succede se la class action perde?",
      "Posso aderire dopo la scadenza?"
    ],
    companies: ["Volkswagen", "Apple", "Google", "Meta", "Samsung", "Stellantis"],
    image_style: "Courthouse with scales of justice, group of people, legal victory concept, professional legal photography"
  }
};

// Visual elements for unique image generation
const COMPOSITIONS = [
  "close-up macro shot with shallow depth of field",
  "wide establishing shot showing full scene",
  "dramatic diagonal composition with leading lines",
  "centered symmetrical view with balanced elements",
  "rule of thirds off-center dynamic framing",
  "birds eye view from above looking down",
  "low angle hero shot looking up"
];

const LIGHTING_MOODS = [
  "golden hour warm sunset lighting",
  "cool blue morning natural light",
  "dramatic side lighting with deep shadows",
  "soft diffused studio lighting",
  "vibrant colorful accent lighting"
];

const CAMERA_ANGLES = [
  "straight on professional angle",
  "slight dutch angle for dynamic feel",
  "45 degree perspective view",
  "over the shoulder contextual view"
];

function buildSpecificElements(category: string, company: string): string {
  const elements: Record<string, Record<string, string>> = {
    flight: {
      Ryanair: "blue and yellow aircraft livery colors, budget airline terminal, boarding gates with passengers",
      EasyJet: "orange aircraft elements, European airport, modern terminal with travelers",
      "ITA Airways": "Italian flag colors blue white red, elegant aircraft design, Rome airport feeling",
      Lufthansa: "dark blue and yellow German airline aesthetic, premium terminal, business travel",
      "Wizz Air": "purple and pink magenta colors, Eastern European airport vibe, young travelers",
      Vueling: "yellow and grey Spanish airline colors, Mediterranean airport, summer travel",
      default: "commercial airplane at gate, airport terminal with departure board, luggage and boarding passes"
    },
    bank: {
      UniCredit: "red corporate tones, modern banking app on smartphone, secure vault imagery",
      "Intesa Sanpaolo": "green accent colors, Italian banking heritage building, digital transactions",
      N26: "minimalist teal and white design, smartphone banking app, modern fintech aesthetic",
      BNL: "green corporate colors, professional banking environment, Euro transactions",
      Fineco: "blue and yellow brand colors, trading screens, investment concept",
      ING: "orange lion brand colors, digital banking, smartphone with notifications",
      default: "euro bills fanned out, bank card with chip, secure lock symbol, financial app interface"
    },
    telecom: {
      Vodafone: "red brand aesthetic, 5G network towers, smartphone with signal bars",
      TIM: "blue Italian telecom feel, fiber optics cables, communication network nodes",
      WindTre: "orange dynamic energy, mobile devices connected, Italian consumer family",
      Fastweb: "yellow and blue colors, fiber internet, fast connection concept",
      Iliad: "red and black minimalist design, transparent pricing, smartphone user",
      PosteMobile: "yellow Poste Italiane colors, mobile phone, Italian postal service elements",
      default: "smartphone with bill notification, network signal waves, consumer protection shield"
    },
    energy: {
      Enel: "green energy transition, smart meter display, sustainable home",
      Eni: "yellow energy flame, natural gas elements, Italian industry",
      A2A: "modern utility infrastructure, smart city elements, renewable energy",
      Edison: "electric power elements, light bulb innovation, Italian heritage",
      Sorgenia: "green renewable energy, solar panels, eco-friendly home",
      default: "light bulb illuminated, energy meter reading, utility bill paper, home electricity"
    },
    ecommerce: {
      Amazon: "brown cardboard delivery boxes, quick shipping tape, online shopping cart icon",
      Zalando: "fashion packages with clothes, clothing returns process, orange brand feel",
      eBay: "auction style colorful products, various items collection, online marketplace",
      Mediaworld: "electronics products, appliances, red corporate colors, retail environment",
      AliExpress: "international shipping boxes, variety of products, global marketplace",
      default: "shopping packages stacked, laptop with cart, credit card payment, delivery truck"
    },
    class_action: {
      Volkswagen: "diesel car silhouette, emissions testing equipment, group of affected consumers",
      Apple: "iPhone device silhouette, battery icon warning, consumer rights protest gathering",
      Google: "privacy shields and locks, data protection symbols, digital rights concept",
      Meta: "social media privacy, data collection concerns, user rights",
      Samsung: "smartphone device, consumer group, technology dispute",
      default: "courthouse facade, scales of justice, group of people united, legal documents"
    }
  };
  
  const categoryElements = elements[category] || elements.ecommerce;
  const companyKey = Object.keys(categoryElements).find(
    key => key.toLowerCase() === company.toLowerCase().replace(/\s+/g, " ")
  );
  
  return companyKey ? categoryElements[companyKey] : categoryElements.default;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60)
    .replace(/-$/, "");
}

// Image generation function
async function generateImage(
  articleTitle: string,
  company: string,
  category: string,
  primaryKeyword: string,
  lovableApiKey: string,
  supabaseClient: any,
  supabaseUrl: string
): Promise<string | null> {
  try {
    const composition = COMPOSITIONS[Math.floor(Math.random() * COMPOSITIONS.length)];
    const lighting = LIGHTING_MOODS[Math.floor(Math.random() * LIGHTING_MOODS.length)];
    const cameraAngle = CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)];
    const specificElements = buildSpecificElements(category, company);

    const imagePrompt = `Create a UNIQUE professional blog header image 16:9 aspect ratio.

ARTICLE TITLE: "${articleTitle}"
COMPANY/BRAND FOCUS: ${company}
CATEGORY: ${category}

VISUAL ELEMENTS (MUST INCLUDE):
${specificElements}

UNIQUE STYLE REQUIREMENTS:
- Composition: ${composition}
- Lighting: ${lighting}
- Camera angle: ${cameraAngle}
- Color palette: Modern with ${category} industry professional tones

STRICT RULES:
- ABSOLUTELY NO text, NO words, NO letters, NO numbers visible
- High quality photorealistic editorial photography style
- Ultra high resolution, vibrant colors
- Make this image memorable and unique`;

    console.log(`Generating image for: ${articleTitle}`);

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

// Agent 1: Advanced SEO Research
async function agentSEO(
  apiKey: string,
  category: string,
  categoryData: typeof SEO_CATEGORIES[string],
  recentArticles: { title: string; primary_keyword: string }[]
): Promise<{
  keyword: string;
  searchIntent: string;
  optimizedTitle: string;
  h1Tag: string;
  metaDescription: string;
  secondaryKeywords: string[];
  lsiKeywords: string[];
  featuredSnippetTarget: string;
  relatedQuestions: string[];
  company: string;
}> {
  const usedKeywords = recentArticles.map((a) => a.primary_keyword?.toLowerCase() || "");
  
  // Combine all keywords
  const allKeywords = [
    ...categoryData.transactional_keywords,
    ...categoryData.informational_keywords,
    ...categoryData.long_tail_keywords
  ];
  
  // Filter out used keywords
  const availableKeywords = allKeywords.filter(
    (k) => !usedKeywords.some((used) => k.toLowerCase().includes(used) || used.includes(k.toLowerCase()))
  );
  
  if (availableKeywords.length === 0) {
    availableKeywords.push(...categoryData.transactional_keywords.slice(0, 3));
  }

  const isTransactional = Math.random() < 0.6;
  const searchIntent = isTransactional ? "transactional" : "informational";
  const company = categoryData.companies[Math.floor(Math.random() * categoryData.companies.length)];
  const currentYear = new Date().getFullYear();

  const prompt = `Sei un esperto SEO italiano specializzato in diritti dei consumatori e rimborsi.

Categoria: ${category}
Keywords disponibili: ${availableKeywords.slice(0, 10).join(", ")}
Aziende rilevanti: ${categoryData.companies.join(", ")}
Azienda focus suggerita: ${company}
Anno: ${currentYear}
Intent: ${searchIntent}

Articoli già pubblicati (da NON ripetere):
${recentArticles.slice(0, 15).map((a) => `- ${a.title}`).join("\n")}

Genera un brief SEO avanzato per un NUOVO articolo unico che:
1. Risponda a una query di ricerca REALE degli utenti italiani
2. NON sia simile agli articoli già pubblicati
3. Abbia potenziale per featured snippet Google

Rispondi SOLO in formato JSON:
{
  "keyword": "keyword principale (query reale cercata)",
  "searchIntent": "${searchIntent}",
  "optimizedTitle": "titolo SEO max 60 caratteri con keyword all'inizio",
  "h1Tag": "H1 leggermente diverso dal title ma con keyword",
  "metaDescription": "meta description persuasiva max 155 caratteri con CTA",
  "secondaryKeywords": ["5 keywords correlate per il testo"],
  "lsiKeywords": ["5 keywords LSI semanticamente correlate"],
  "featuredSnippetTarget": "risposta diretta 40-60 parole per posizione zero Google",
  "relatedQuestions": ["3-4 domande che gli utenti cercano"],
  "company": "${company}"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`SEO Agent failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const randomKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
    return {
      keyword: randomKeyword,
      searchIntent,
      optimizedTitle: `${randomKeyword} - Guida Completa ${currentYear}`,
      h1Tag: `Come ${randomKeyword}: Tutto Quello Che Devi Sapere`,
      metaDescription: `Scopri come ${randomKeyword}. Guida pratica con moduli, tempistiche e consigli degli esperti. Fai valere i tuoi diritti!`,
      secondaryKeywords: ["diritti consumatore", "rimborso", "reclamo", "modulo", "procedura"],
      lsiKeywords: ["tutela consumatori", "risarcimento", "assistenza legale", "codice consumo"],
      featuredSnippetTarget: `Per ${randomKeyword} è necessario presentare reclamo entro i termini di legge utilizzando i canali ufficiali dell'azienda.`,
      relatedQuestions: categoryData.question_keywords.slice(0, 4),
      company,
    };
  }

  return JSON.parse(jsonMatch[0]);
}

// Agent 2: Advanced Editorial Writer
async function agentEditorial(
  apiKey: string,
  brief: {
    keyword: string;
    searchIntent: string;
    optimizedTitle: string;
    h1Tag: string;
    metaDescription: string;
    secondaryKeywords: string[];
    lsiKeywords: string[];
    featuredSnippetTarget: string;
    relatedQuestions: string[];
    company: string;
  },
  category: string,
  opportunity: { title: string; description: string; min_amount: number; max_amount: number; legal_reference: string } | null
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  faqSchema: { question: string; answer: string }[];
  internalLinks: string[];
}> {
  const opportunityInstructions = opportunity ? `
OPPORTUNITÀ SPECIFICA DA INTEGRARE:
- Titolo: "${opportunity.title}"
- Descrizione: ${opportunity.description}
- Importo recuperabile: €${opportunity.min_amount || 0} - €${opportunity.max_amount || 500}
- Riferimento legale: ${opportunity.legal_reference || "Codice del Consumo"}

L'articolo DEVE:
- Spiegare il problema specifico che questa opportunità risolve
- Citare la normativa applicabile (${opportunity.legal_reference || "Codice del Consumo"})
- Includere almeno 2 esempi pratici reali
- Menzionare l'importo tipico recuperabile
` : '';

  const systemPrompt = `Sei un giornalista esperto di diritti dei consumatori italiani che scrive per rimborsami.app.

## REGOLE FONDAMENTALI
- Scrivi in italiano chiaro, naturale, comprensibile
- Evita COMPLETAMENTE tono pubblicitario o marketing aggressivo
- Concentrati su problemi REALI delle persone
- Sii originale, non generico
- Usa emoji 2-3 nei titoli H2 per engagement (⚠️ 💰 📋 ✅ 📞 🔒)

## STRUTTURA SEO OBBLIGATORIA

1. **SNIPPET PER POSIZIONE ZERO** (prime 60 parole):
   "${brief.featuredSnippetTarget}"

2. **INDICE DEI CONTENUTI** (per featured snippets):
   Lista cliccabile di 5-7 punti con anchor links

3. **CORPO ARTICOLO** (MINIMO 1200-1500 parole):
   - 5-6 sezioni H2 con keywords secondarie nei titoli
   - Sottosezioni H3 dove appropriato
   - Box informativi <div class="info-box"> per dati importanti
   - Tabelle comparative <table> dove possibile
   - Liste puntate per scannabilità
   - Citazioni legali in <blockquote> (Codice del Consumo, EU 261, etc.)

4. **SEZIONE GUIDE PASSO-PASSO**:
   - Passaggi numerati chiari
   - Tempistiche specifiche
   - Documenti necessari

5. **FAQ SECTION** (OBBLIGATORIA - per rich snippets Google):
   Usa formato: <details><summary>Domanda?</summary><p>Risposta completa</p></details>
   Includi queste domande: ${brief.relatedQuestions.join(", ")}
   + 2-3 domande aggiuntive

6. **CONCLUSIONE CON CTA**:
   - Riepilogo punti chiave
   - Link interno a /quiz
   - CTA: "Verifica subito se hai diritto a un rimborso"

## FORMATTAZIONE HTML
- <h2> con emoji per sezioni principali
- <h3> per sottosezioni
- <ul>/<ol> per liste
- <strong> per keywords importanti
- <blockquote> per citazioni legali
- <table> per comparazioni
- <details><summary> per FAQ
- <div class="info-box"> per box informativi
- Link interni: <a href="/quiz">fai il quiz</a>, <a href="/opportunities">scopri opportunità</a>

## TONO
- Professionale ma accessibile, empatico
- Usa "tu" per rivolgerti al lettore
- Ammetti le difficoltà reali
- Dai informazioni utili sempre

## LUNGHEZZA: 1200-1500 parole MINIMO`;

  const userPrompt = `Scrivi un articolo SEO completo basato su questo brief:

**KEYWORD PRINCIPALE (MUST nelle prime 100 parole):** ${brief.keyword}
**TITLE TAG:** ${brief.optimizedTitle}
**H1:** ${brief.h1Tag}
**KEYWORDS SECONDARIE:** ${brief.secondaryKeywords.join(", ")}
**LSI KEYWORDS:** ${brief.lsiKeywords.join(", ")}
**AZIENDA FOCUS:** ${brief.company}
**INTENT:** ${brief.searchIntent}
${opportunityInstructions}

Rispondi SOLO in formato JSON valido:
{
  "title": "${brief.optimizedTitle}",
  "content": "HTML completo articolo con tutte le sezioni richieste",
  "excerpt": "estratto max 160 caratteri con keyword",
  "metaDescription": "${brief.metaDescription}",
  "keywords": ["8-10 keywords ottimizzate"],
  "faqSchema": [
    {"question": "domanda 1", "answer": "risposta completa 1"},
    {"question": "domanda 2", "answer": "risposta completa 2"},
    {"question": "domanda 3", "answer": "risposta completa 3"},
    {"question": "domanda 4", "answer": "risposta completa 4"}
  ],
  "internalLinks": ["/quiz", "/opportunities"]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
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
  
  // Clean JSON from markdown code blocks
  let cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
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
  const wordCount = article.content.split(/\s+/).length;
  const recentTitles = recentArticles.slice(0, 20).map((a) => a.title).join("\n- ");
  
  // Check for required elements
  const hasInfoBox = article.content.includes('class="info-box"');
  const hasFAQ = article.content.includes('<details>') || article.content.includes('<summary>');
  const hasTable = article.content.includes('<table');
  const hasBlockquote = article.content.includes('<blockquote');
  const hasInternalLinks = article.content.includes('href="/quiz"') || article.content.includes('href="/opportunities"');

  const prompt = `Sei un editor quality check per un magazine sui diritti dei consumatori.

Analizza questo articolo:

**Titolo:** ${article.title}
**Excerpt:** ${article.excerpt}
**Conteggio parole:** ${wordCount}
**Elementi strutturali presenti:**
- Box informativi: ${hasInfoBox ? 'Sì' : 'No'}
- FAQ section: ${hasFAQ ? 'Sì' : 'No'}
- Tabelle: ${hasTable ? 'Sì' : 'No'}
- Citazioni legali: ${hasBlockquote ? 'Sì' : 'No'}
- Link interni: ${hasInternalLinks ? 'Sì' : 'No'}

**Contenuto (primi 3000 caratteri):**
${article.content.substring(0, 3000)}

**Titoli articoli recenti (controlla duplicati):**
- ${recentTitles}

Valuta secondo questi criteri:
1. **Originalità** (1-10): È diverso dagli articoli recenti?
2. **Qualità scrittura** (1-10): Italiano chiaro? No marketing aggressivo?
3. **Struttura SEO** (1-10): Ha tutte le sezioni richieste? FAQ, box, tabelle?
4. **Utilità** (1-10): Informazioni concrete e actionable?
5. **Lunghezza** (1-10): Almeno 1200 parole? (attuale: ${wordCount})

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
    // Fallback with structural checks
    const structureScore = [hasInfoBox, hasFAQ, hasTable, hasBlockquote, hasInternalLinks].filter(Boolean).length;
    return {
      score: wordCount >= 1000 ? 6 + structureScore * 0.5 : 4 + structureScore * 0.3,
      notes: "Valutazione automatica basata su struttura",
      isDuplicate: false,
      issues: wordCount < 1000 ? ["Articolo potrebbe essere più lungo"] : [],
    };
  }

  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting multi-agent article generation v2 (enhanced)...");

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

      targetCategory = Object.entries(categoryCounts)
        .sort((a, b) => a[1] - b[1])
        .map(([cat]) => cat)[0];
    }

    const categoryData = SEO_CATEGORIES[targetCategory];
    if (!categoryData) {
      throw new Error(`Invalid category: ${targetCategory}`);
    }

    console.log(`Selected category: ${targetCategory}`);

    // AGENT 1: Advanced SEO Research
    console.log("Running SEO Agent (gemini-2.5-pro)...");
    const seoBrief = await agentSEO(
      lovableApiKey,
      targetCategory,
      categoryData,
      recentArticles?.map((a) => ({ title: a.title, primary_keyword: a.primary_keyword })) || []
    );
    console.log("SEO Brief:", seoBrief.optimizedTitle);

    // Start image generation in parallel
    const imagePromise = generateImage(
      seoBrief.optimizedTitle,
      seoBrief.company,
      targetCategory,
      seoBrief.keyword,
      lovableApiKey,
      supabase,
      supabaseUrl
    );

    // Fetch related opportunity
    const { data: opportunities } = await supabase
      .from("opportunities")
      .select("id, title, description, short_description, min_amount, max_amount, legal_reference")
      .eq("category", targetCategory)
      .eq("active", true)
      .limit(5);

    const selectedOpportunity = opportunities?.[Math.floor(Math.random() * (opportunities?.length || 1))] || null;

    // AGENT 2: Advanced Editorial Writing
    console.log("Running Editorial Agent (gemini-2.5-pro)...");
    const articleContent = await agentEditorial(
      lovableApiKey,
      seoBrief,
      targetCategory,
      selectedOpportunity ? {
        title: selectedOpportunity.title,
        description: selectedOpportunity.short_description || selectedOpportunity.description || "",
        min_amount: selectedOpportunity.min_amount || 0,
        max_amount: selectedOpportunity.max_amount || 500,
        legal_reference: selectedOpportunity.legal_reference || ""
      } : null
    );
    console.log("Article generated:", articleContent.title);

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

    // Wait for image
    const featuredImageUrl = await imagePromise;
    console.log("Image generated:", featuredImageUrl ? "success" : "failed");

    // Select author
    const authorSlugs = CATEGORY_AUTHOR_MAP[targetCategory] || ["luca-benedetti"];
    const authorSlug = authorSlugs[Math.floor(Math.random() * authorSlugs.length)];
    
    const { data: author } = await supabase
      .from("news_authors")
      .select("id, articles_count")
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
    const truncatedExcerpt = articleContent.excerpt.substring(0, 160);
    const truncatedMetaDescription = articleContent.metaDescription.substring(0, 155);
    const truncatedPrimaryKeyword = seoBrief.keyword.substring(0, 100);

    // Build FAQ Schema for rich snippets
    const faqSchemaData = articleContent.faqSchema ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": articleContent.faqSchema.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    } : null;

    // Insert article
    const { data: insertedArticle, error: insertError } = await supabase
      .from("news_articles")
      .insert({
        title: truncatedTitle,
        slug: uniqueSlug,
        content: articleContent.content,
        excerpt: truncatedExcerpt,
        meta_description: truncatedMetaDescription,
        keywords: articleContent.keywords?.slice(0, 10) || [...seoBrief.secondaryKeywords, ...seoBrief.lsiKeywords],
        primary_keyword: truncatedPrimaryKeyword,
        search_intent: seoBrief.searchIntent,
        category: targetCategory,
        author_id: author?.id || null,
        opportunity_id: selectedOpportunity?.id || null,
        faq_schema: faqSchemaData,
        internal_links: articleContent.internalLinks || ["/quiz", "/opportunities"],
        featured_image_url: featuredImageUrl,
        reading_time_minutes: readingTime,
        target_word_count: 1500,
        is_published: true,
        published_at: new Date().toISOString(),
        quality_score: Math.round(qualityResult.score),
        editorial_notes: qualityResult.notes,
        generation_version: "v2-enhanced",
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
        await supabase
          .from("news_authors")
          .update({ articles_count: (author.articles_count || 0) + 1 })
          .eq("id", author.id);
      } catch (e) {
        console.error("Failed to update author article count:", e);
      }
    }

    console.log("✅ Article published successfully:", insertedArticle?.slug);

    return new Response(
      JSON.stringify({
        success: true,
        article: {
          id: insertedArticle?.id,
          title: truncatedTitle,
          slug: uniqueSlug,
          category: targetCategory,
          wordCount,
          qualityScore: qualityResult.score,
          editorialNotes: qualityResult.notes,
          featuredImageUrl,
          authorId: author?.id,
          opportunityId: selectedOpportunity?.id,
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
