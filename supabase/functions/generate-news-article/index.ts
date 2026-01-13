import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Categories and their Italian keywords for SEO
const ARTICLE_CATEGORIES = [
  {
    category: 'flight',
    keywords: ['rimborso volo', 'ritardo aereo', 'volo cancellato', 'compensazione EU261', 'risarcimento compagnia aerea'],
    companies: ['Ryanair', 'Easyjet', 'Lufthansa', 'Alitalia ITA', 'Vueling', 'Wizz Air'],
    topics: [
      'Come richiedere rimborso per volo cancellato',
      'Diritti passeggeri: compensazione per ritardo aereo',
      'Guida completa al regolamento EU 261/2004',
      'Overbooking: come ottenere il risarcimento',
      'Rimborso bagaglio smarrito o danneggiato'
    ]
  },
  {
    category: 'telecom',
    keywords: ['rimborso bolletta', 'fattura errata', 'disdetta contratto', 'costi nascosti operatore', 'reclamo telefonico'],
    companies: ['TIM', 'Vodafone', 'WindTre', 'Fastweb', 'Iliad', 'Sky'],
    topics: [
      'Bolletta telefonica errata: come ottenere il rimborso',
      'Servizi non richiesti in bolletta: i tuoi diritti',
      'Disdetta anticipata senza penali: quando è possibile',
      'Velocità internet inferiore al contratto: rimborso',
      'Fatturazione a 28 giorni: rimborsi ancora disponibili'
    ]
  },
  {
    category: 'energy',
    keywords: ['rimborso luce gas', 'bolletta energia', 'conguaglio errato', 'cambio fornitore', 'mercato libero energia'],
    companies: ['Enel', 'Eni', 'Edison', 'A2A', 'Hera', 'Acea'],
    topics: [
      'Conguaglio luce e gas: come verificare e contestare',
      'Mercato tutelato vs libero: cosa cambia nel 2026',
      'Bollette stimate errate: richiedi il rimborso',
      'Aumenti non comunicati: i tuoi diritti',
      'Voltura e subentro: costi illegittimi da recuperare'
    ]
  },
  {
    category: 'bank',
    keywords: ['rimborso banca', 'commissioni bancarie', 'class action banche', 'conto corrente', 'mutuo casa'],
    companies: ['Intesa Sanpaolo', 'UniCredit', 'BNL', 'BPER', 'MPS', 'Banco BPM'],
    topics: [
      'Commissioni bancarie nascoste: come recuperarle',
      'Class action contro le banche: partecipa e ottieni rimborso',
      'Interessi anatocistici: verifica e richiedi rimborso',
      'Estinzione anticipata mutuo: costi illegittimi',
      'Conto corrente chiuso: recupera le commissioni'
    ]
  },
  {
    category: 'ecommerce',
    keywords: ['rimborso acquisto online', 'reso prodotto', 'garanzia legale', 'diritto recesso', 'truffa online'],
    companies: ['Amazon', 'Zalando', 'eBay', 'AliExpress', 'Shein', 'Mediaworld'],
    topics: [
      'Diritto di recesso 14 giorni: guida completa',
      'Prodotto difettoso: garanzia legale 2 anni',
      'Rimborso per prodotto non conforme',
      'Pacco non consegnato: come ottenere il rimborso',
      'Acquisto online truffaldino: recupera i soldi'
    ]
  },
  {
    category: 'class_action',
    keywords: ['class action Italia', 'azione collettiva', 'risarcimento danni', 'causa collettiva', 'adesione class action'],
    companies: ['Meta', 'Google', 'Apple', 'Samsung', 'Volkswagen', 'Stellantis'],
    topics: [
      'Class action attive in Italia: elenco aggiornato 2026',
      'Come aderire a una class action: guida passo passo',
      'Dieselgate: rimborsi ancora disponibili',
      'Privacy violata: class action contro big tech',
      'Obsolescenza programmata: cause collettive aperte'
    ]
  },
  {
    category: 'insurance',
    keywords: ['rimborso assicurazione', 'sinistro auto', 'polizza vita', 'risarcimento danni', 'reclamo assicurativo'],
    companies: ['Generali', 'Allianz', 'UnipolSai', 'AXA', 'Zurich', 'Cattolica'],
    topics: [
      'Sinistro auto: come ottenere il giusto risarcimento',
      'Polizza vita: clausole vessatorie da contestare',
      'Assicurazione viaggio: rimborso per vacanza rovinata',
      'RC Auto: risarcimento diretto vs ordinario',
      'Danni maltempo: guida al risarcimento assicurativo'
    ]
  }
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Select random category
    const categoryData = ARTICLE_CATEGORIES[Math.floor(Math.random() * ARTICLE_CATEGORIES.length)];
    const topic = categoryData.topics[Math.floor(Math.random() * categoryData.topics.length)];
    const company = categoryData.companies[Math.floor(Math.random() * categoryData.companies.length)];
    
    // Current date for freshness
    const currentDate = new Date().toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentYear = new Date().getFullYear();

    const systemPrompt = `Sei un esperto giornalista italiano specializzato in diritti dei consumatori e rimborsi. 
Scrivi articoli SEO-ottimizzati per il blog di Rimborsami.app, una piattaforma italiana che aiuta i consumatori a recuperare rimborsi e compensazioni.

REGOLE IMPORTANTI:
- Scrivi SOLO in italiano corretto e professionale
- Usa un tono informativo ma accessibile
- Includi dati, statistiche e riferimenti normativi quando possibile
- Struttura l'articolo con H2 e H3 per la SEO
- Inserisci naturalmente le keyword nel testo
- L'articolo deve essere lungo almeno 800 parole
- Includi una sezione "Come Rimborsami può aiutarti" verso la fine
- Termina con una call-to-action per registrarsi su Rimborsami`;

    const userPrompt = `Scrivi un articolo SEO-ottimizzato sul tema: "${topic}"

Contesto:
- Categoria: ${categoryData.category}
- Azienda di riferimento (se applicabile): ${company}
- Data odierna: ${currentDate}
- Anno corrente: ${currentYear}

Keywords da includere naturalmente: ${categoryData.keywords.join(', ')}

Formato richiesto (JSON):
{
  "title": "Titolo accattivante con keyword principale (max 60 caratteri)",
  "meta_description": "Meta description convincente con CTA (max 155 caratteri)",
  "excerpt": "Riassunto dell'articolo in 2-3 frasi (max 200 caratteri)",
  "content": "Contenuto completo in HTML con tag h2, h3, p, ul, li, strong, em. Minimo 800 parole.",
  "keywords": ["array", "di", "5-8", "keywords", "rilevanti"],
  "reading_time_minutes": numero_stimato
}

IMPORTANTE: Rispondi SOLO con il JSON valido, senza testo aggiuntivo.`;

    console.log('Generating article for category:', categoryData.category, 'topic:', topic);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    console.log('AI response received, parsing JSON...');

    // Parse the JSON response
    let articleData;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', generatedText.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.meta_description) {
      throw new Error('Missing required fields in generated article');
    }

    // Generate unique slug
    const baseSlug = generateSlug(articleData.title);
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    // Insert article into database
    const { data: insertedArticle, error: insertError } = await supabase
      .from('news_articles')
      .insert({
        slug,
        title: articleData.title.substring(0, 255),
        meta_description: articleData.meta_description.substring(0, 160),
        excerpt: articleData.excerpt?.substring(0, 500) || articleData.meta_description,
        content: articleData.content,
        category: categoryData.category,
        keywords: articleData.keywords || categoryData.keywords,
        reading_time_minutes: articleData.reading_time_minutes || 5,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save article: ${insertError.message}`);
    }

    console.log('Article saved successfully:', insertedArticle.id, insertedArticle.slug);

    return new Response(JSON.stringify({ 
      success: true, 
      article: {
        id: insertedArticle.id,
        slug: insertedArticle.slug,
        title: insertedArticle.title,
        category: insertedArticle.category
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating news article:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
