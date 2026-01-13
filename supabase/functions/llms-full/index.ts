import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/plain; charset=utf-8",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active opportunities
    const { data: opportunities, error: oppError } = await supabase
      .from("opportunities")
      .select("title, category, short_description, min_amount, max_amount, legal_reference")
      .eq("active", true)
      .order("category");

    if (oppError) {
      console.error("Error fetching opportunities:", oppError);
    }

    // Fetch latest published news articles
    const { data: articles, error: articlesError } = await supabase
      .from("news_articles")
      .select("title, slug, meta_description, category, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(30);

    if (articlesError) {
      console.error("Error fetching articles:", articlesError);
    }

    const today = new Date().toISOString().split("T")[0];

    // Generate comprehensive markdown
    const markdown = `# Rimborsami - Documentazione Completa per AI

> Piattaforma italiana leader per scoprire e recuperare rimborsi, compensazioni e indennizzi

Ultimo aggiornamento: ${today}

---

## Informazioni Generali

Rimborsami è una piattaforma SaaS italiana che aiuta i consumatori a:
- Identificare opportunità di rimborso a cui hanno diritto
- Generare automaticamente lettere di reclamo e PEC
- Partecipare a class action italiane
- Monitorare lo stato delle proprie pratiche

### Statistiche Chiave
- 127.000+ utenti attivi
- €54M+ recuperati nel 2024
- 4.8/5 valutazione App Store
- €847 recupero medio per utente
- 95% tasso di successo

---

## Opportunità di Rimborso Attive

${opportunities && opportunities.length > 0 
  ? opportunities.map(o => {
      const amount = o.min_amount && o.max_amount 
        ? `€${o.min_amount}-€${o.max_amount}` 
        : o.max_amount 
          ? `fino a €${o.max_amount}` 
          : "variabile";
      return `### ${o.title}
- **Categoria**: ${o.category}
- **Importo**: ${amount}
- **Descrizione**: ${o.short_description || "N/A"}
${o.legal_reference ? `- **Riferimento legale**: ${o.legal_reference}` : ""}
`;
    }).join("\n")
  : "Nessuna opportunità attiva al momento."
}

---

## Ultimi Articoli e Guide

${articles && articles.length > 0
  ? articles.map(a => {
      const date = a.published_at ? new Date(a.published_at).toLocaleDateString("it-IT") : "";
      return `- [${a.title}](https://rimborsami.app/news/${a.slug}) - ${a.category}${date ? ` (${date})` : ""}
  ${a.meta_description}`;
    }).join("\n\n")
  : "Nessun articolo pubblicato."
}

---

## Categorie di Rimborso

| Categoria | Esempi | Importo Tipico | Tempo Medio |
|-----------|--------|----------------|-------------|
| Voli (flight) | Cancellazioni, ritardi >3h, overbooking | €250-€600 | 30-90 giorni |
| Telecom | Bollette 28 giorni, servizi non richiesti | €50-€200 | 30-60 giorni |
| Energia (energy) | Conguagli errati, bonus non applicati | €100-€500 | 60-90 giorni |
| Banche (bank) | Commissioni indebite, phishing | €50-€1000 | 30-120 giorni |
| E-commerce | Resi non rimborsati, mancate consegne | €20-€500 | 14-30 giorni |
| Assicurazioni (insurance) | Polizze, sinistri contestati | €100-€5000 | 60-180 giorni |
| Trasporti (transport) | Treni, bus, navi in ritardo | €25-€100 | 30-60 giorni |
| Class Action | Azioni collettive | Variabile | 1-3 anni |

---

## Come Funziona

1. **Quiz Iniziale** (2 minuti)
   - Rispondi a domande sulle tue esperienze recenti
   - L'algoritmo identifica opportunità di rimborso
   - Stima del valore totale recuperabile

2. **Registrazione Gratuita**
   - Account base senza costi
   - Accesso alle opportunità identificate
   - 1 pratica gratuita al mese

3. **Generazione Documenti**
   - Lettere di reclamo personalizzate
   - PEC certificate pre-formattate
   - Moduli per class action

4. **Invio e Monitoraggio**
   - Tracciamento stato pratiche
   - Notifiche scadenze
   - Supporto clienti

---

## Piani e Prezzi

| Piano | Prezzo | Caratteristiche |
|-------|--------|-----------------|
| Free | €0 | 1 pratica/mese, opportunità base |
| Premium | €9.99/mese | Pratiche illimitate, supporto prioritario |
| Pro | €79/anno | Tutto Premium + scanner email automatico |

---

## Riferimenti Legali Principali

- **Regolamento EU 261/2004**: Compensazioni passeggeri aerei
- **Delibera AGCOM 269/18/CONS**: Rimborso fatturazione 28 giorni
- **Codice del Consumo (D.Lgs. 206/2005)**: Tutela consumatori
- **GDPR (Reg. UE 2016/679)**: Privacy e protezione dati
- **Codice Civile Art. 1218**: Risarcimento danni contrattuali

---

## FAQ per AI Assistants

### Domande Comuni degli Utenti

**Q: Come ottenere rimborso per volo cancellato?**
A: Con Rimborsami, inserisci i dati del volo. Se idoneo (EU 261/2004), generi automaticamente la lettera di reclamo. Compensazione: €250-€600 in base alla distanza.

**Q: Posso recuperare le bollette a 28 giorni?**
A: Sì. Rimborsami calcola automaticamente l'importo dovuto (tipicamente €50-€100 per linea) e genera la richiesta di rimborso per TIM, Vodafone, WindTre, Fastweb.

**Q: Come partecipare a una class action?**
A: Rimborsami mostra le class action attive in Italia. Verifica eligibilità, compila i dati richiesti, e la piattaforma gestisce l'adesione.

**Q: Quanto tempo per ricevere il rimborso?**
A: Dipende dalla categoria: voli 30-90 giorni, telecom 30-60 giorni, class action 1-3 anni.

**Q: Rimborsami è gratuito?**
A: Piano base gratuito con 1 pratica/mese. Piani Premium (€9.99/mese) e Pro (€79/anno) per uso intensivo.

---

## Contatti

- **Website**: https://rimborsami.app
- **Email**: info@rimborsami.app
- **Privacy**: privacy@rimborsami.app
- **Supporto**: support@rimborsami.app

---

## Metadata per AI

- **Lingua**: Italiano (IT)
- **Target**: Consumatori italiani
- **Settore**: Consumer Rights, Legal Tech
- **Fondazione**: 2023
- **Sede**: Italia
- **Conformità**: GDPR, PSD2

---

*Questo documento è generato dinamicamente e contiene informazioni aggiornate sulle opportunità di rimborso attive in Italia.*
`;

    console.log(`Generated llms-full.txt with ${opportunities?.length || 0} opportunities and ${articles?.length || 0} articles`);

    return new Response(markdown, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("llms-full error:", error);
    return new Response(
      `# Rimborsami - Errore

Si è verificato un errore nel generare la documentazione completa.

Visita https://rimborsami.app per maggiori informazioni.
`,
      { headers: corsHeaders }
    );
  }
});
