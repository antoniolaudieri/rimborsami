import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ARTICLE_CATEGORIES = [
  {
    category: "flight",
    keywords: ["rimborso volo", "risarcimento aereo", "ritardo volo", "volo cancellato", "EU261"],
    companies: ["Ryanair", "Easyjet", "Wizz Air", "ITA Airways", "Lufthansa"],
    topics: [
      { title: "Rimborso volo cancellato: la guida completa {anno}", viral_hook: "⚠️ Potresti avere diritto a €600", long_tail: "come ottenere rimborso volo cancellato {company}" },
      { title: "Ritardo aereo oltre 3 ore: quanto ti spetta", viral_hook: "💰 Il 78% degli italiani non richiede i rimborsi", long_tail: "rimborso ritardo volo {company}" },
      { title: "Regolamento EU 261: i tuoi diritti sui voli", viral_hook: "📋 La legge che le compagnie non vogliono che conosci", long_tail: "regolamento europeo 261 risarcimento" },
    ],
    image_style: "Modern airport terminal with airplane, blue sky, professional travel photography"
  },
  {
    category: "telecom",
    keywords: ["rimborso bolletta", "disdetta contratto", "fatturazione errata"],
    companies: ["TIM", "Vodafone", "WindTre", "Fastweb", "Iliad"],
    topics: [
      { title: "Bolletta telefonica troppo alta: come contestarla", viral_hook: "📱 Il 45% delle bollette contiene errori", long_tail: "contestare bolletta {company}" },
      { title: "Servizi non richiesti: procedura rimborso", viral_hook: "🚨 Paghi servizi mai attivati?", long_tail: "rimuovere servizi {company}" },
    ],
    image_style: "Smartphone with bills and money, consumer protection theme"
  },
  {
    category: "ecommerce",
    keywords: ["rimborso acquisto", "garanzia legale", "diritto recesso"],
    companies: ["Amazon", "Zalando", "eBay", "Mediaworld"],
    topics: [
      { title: "Diritto di recesso online: 14 giorni per ripensarci", viral_hook: "🛒 Hai 14 giorni per restituire TUTTO", long_tail: "diritto recesso {company}" },
      { title: "Garanzia legale 2 anni: come farla valere", viral_hook: "🔧 La garanzia è scaduta? Forse no", long_tail: "garanzia legale {company}" },
    ],
    image_style: "Online shopping with laptop and packages, e-commerce concept"
  },
  {
    category: "bank",
    keywords: ["commissioni bancarie", "anatocismo", "conto corrente"],
    companies: ["Intesa Sanpaolo", "Unicredit", "BNL", "Fineco"],
    topics: [
      { title: "Commissioni bancarie nascoste: come chiedere rimborso", viral_hook: "🏦 Il 67% paga commissioni sconosciute", long_tail: "commissioni {company}" },
      { title: "Phishing bancario: come ottenere il rimborso", viral_hook: "🔒 Truffa online? La banca DEVE rimborsarti", long_tail: "truffa phishing {company}" },
    ],
    image_style: "Banking concept with Euro bills and digital app"
  },
  {
    category: "energy",
    keywords: ["bolletta luce", "bolletta gas", "conguaglio"],
    companies: ["Enel", "Eni", "A2A", "Edison"],
    topics: [
      { title: "Conguaglio bolletta: come contestare importi esorbitanti", viral_hook: "⚡ Bolletta da €2.000? Leggi questo", long_tail: "conguaglio {company}" },
      { title: "Bonus energia {anno}: chi ne ha diritto", viral_hook: "💡 Migliaia non richiedono il bonus", long_tail: "bonus energia requisiti" },
    ],
    image_style: "Energy bills with light bulb, utility concept"
  },
  {
    category: "class_action",
    keywords: ["class action", "azione collettiva", "risarcimento"],
    companies: ["Volkswagen", "Apple", "Google", "Meta"],
    topics: [
      { title: "Dieselgate {anno}: come aderire alla class action", viral_hook: "🚗 Hai un diesel VW? Diritto a €3.000", long_tail: "class action dieselgate" },
      { title: "Class action attive in Italia: guida completa", viral_hook: "📋 Le 10 azioni a cui aderire OGGI", long_tail: "class action italia {anno}" },
    ],
    image_style: "Courthouse with scales of justice, legal concept"
  }
];

function generateSlug(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").substring(0, 60);
}

async function generateImage(topic: string, imageStyle: string, lovableApiKey: string, supabaseClient: any, supabaseUrl: string): Promise<string | null> {
  try {
    const imagePrompt = `Create a professional blog header image 16:9 for: "${topic}". Style: ${imageStyle}. NO text in image. High quality, blue/green tones.`;
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: [{ role: "user", content: imagePrompt }], modalities: ["image", "text"] }),
    });
    if (!imageResponse.ok) return null;
    const imageData = await imageResponse.json();
    const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!base64Image) return null;
    const base64Match = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) return null;
    const bytes = Uint8Array.from(atob(base64Match[2]), c => c.charCodeAt(0));
    const fileName = `article-${Date.now()}-${Math.random().toString(36).substring(7)}.${base64Match[1]}`;
    const { error } = await supabaseClient.storage.from("news-images").upload(fileName, bytes, { contentType: `image/${base64Match[1]}` });
    if (error) return null;
    return `${supabaseUrl}/storage/v1/object/public/news-images/${fileName}`;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!, supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const categoryData = ARTICLE_CATEGORIES[Math.floor(Math.random() * ARTICLE_CATEGORIES.length)];
    const topicData = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)];
    const company = categoryData.companies[Math.floor(Math.random() * categoryData.companies.length)];
    const currentYear = new Date().getFullYear();
    const title = topicData.title.replace("{anno}", String(currentYear)).replace("{company}", company);
    const imagePromise = generateImage(title, categoryData.image_style, lovableApiKey, supabase, supabaseUrl);
    
    const systemPrompt = `Sei un esperto copywriter italiano su diritti consumatori. Scrivi articoli virali SEO-ottimizzati con: hook emotivi, statistiche, leggi italiane reali, emoji nei titoli, CTA per Rimborsami. Solo italiano.`;
    const userPrompt = `Genera articolo: "${title}". Hook: "${topicData.viral_hook}". Keywords: ${categoryData.keywords.join(", ")}. Azienda: ${company}. Formato JSON: {"title":"max 60 char","excerpt":"max 160 char","meta_description":"max 155 char","content":"HTML con H2, liste, FAQ details/summary, box info-box","keywords":["5-8 keywords"],"reading_time_minutes":numero}`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });
    if (!response.ok) throw new Error(`AI error: ${response.status}`);
    const aiResponse = await response.json();
    let articleText = aiResponse.choices?.[0]?.message?.content?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const articleData = JSON.parse(articleText);
    const featuredImageUrl = await imagePromise;
    const slug = `${generateSlug(articleData.title)}-${Date.now().toString(36)}`;
    
    const { data: article, error } = await supabase.from("news_articles").insert({
      slug, title: articleData.title, excerpt: articleData.excerpt, meta_description: articleData.meta_description || articleData.excerpt,
      content: articleData.content, category: categoryData.category, keywords: articleData.keywords || categoryData.keywords,
      reading_time_minutes: articleData.reading_time_minutes || 5, featured_image_url: featuredImageUrl, is_published: true, published_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ success: true, article: { id: article.id, slug: article.slug, title: article.title, featured_image_url: article.featured_image_url } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
