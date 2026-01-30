

# Piano: Generazione Articoli senza Lovable AI

## Obiettivo
Sostituire Lovable AI Gateway con API dirette di provider AI (es. Google AI, OpenAI, o provider economici/gratuiti).

## Opzioni Disponibili

| Provider | Costo | Pro | Contro |
|----------|-------|-----|--------|
| **Google AI (Gemini)** | ~$0.001-0.003/1K tokens | Stesso modello usato ora, veloce | Richiede API key Google |
| **OpenAI** | ~$0.002-0.01/1K tokens | Alta qualità | Più costoso |
| **Groq** | Gratuito (rate limited) | Velocissimo, gratis | Rate limit severi |
| **Together AI** | ~$0.0002/1K tokens | Molto economico | Qualità leggermente inferiore |
| **Mistral AI** | ~$0.0004/1K tokens | Buon rapporto qualità/prezzo | Meno potente per italiano |

## Soluzione Raccomandata: Google AI Diretto

Google AI Studio offre una quota gratuita generosa e prezzi molto bassi.

### Implementazione Tecnica

#### 1. Ottenere API Key Google AI
- Vai su https://aistudio.google.com/apikey
- Crea una nuova API key (gratuito)
- Aggiungi come secret: `GOOGLE_AI_API_KEY`

#### 2. Modifiche all'Edge Function

**File:** `supabase/functions/generate-article-v2/index.ts`

Sostituire tutte le chiamate da:
```typescript
// DA (Lovable AI Gateway)
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { Authorization: `Bearer ${lovableApiKey}` },
  body: JSON.stringify({ model: "google/gemini-2.5-flash", ... })
});
```

A:
```typescript
// A (Google AI Diretto)
const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    })
  }
);
```

#### 3. Funzioni da Modificare

| Funzione | Linee | Chiamate AI |
|----------|-------|-------------|
| `agentSEO()` | 465-611 | 1 chiamata |
| `agentEditorial()` | 614-800+ | 1 chiamata |
| `agentQuality()` | ~850-950 | 1 chiamata |
| `generateImage()` | 321-461 | 2 chiamate (immagine + watermark) |

#### 4. Gestione Immagini

Per le immagini, due opzioni:

**Opzione A:** Continuare con Lovable AI solo per immagini (costo minore)

**Opzione B:** Usare immagini stock gratuite da Unsplash/Pexels via API
```typescript
const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(keyword)}`;
```

#### 5. Stessa Modifica per Post Social

**Files:**
- `supabase/functions/post-to-linkedin/index.ts`
- `supabase/functions/post-to-ayrshare/index.ts`

### Costi Stimati

| Scenario | Lovable AI | Google AI Diretto |
|----------|------------|-------------------|
| 1 articolo (4 chiamate) | ~0.02-0.04 crediti | ~$0.01-0.02 |
| 30 articoli/mese | ~1 credito | ~$0.30-0.60 |
| Post social (30/mese) | ~0.5 crediti | ~$0.15 |

### Passaggi di Implementazione

1. Creare API key su Google AI Studio
2. Aggiungere secret `GOOGLE_AI_API_KEY`
3. Creare helper function per chiamate Google AI
4. Aggiornare `generate-article-v2` con nuovo provider
5. Aggiornare `post-to-linkedin` e `post-to-ayrshare`
6. Testare generazione singolo articolo
7. (Opzionale) Sostituire generazione immagini con Unsplash

### Note Importanti

- La quota gratuita Google AI è di ~60 richieste/minuto
- I modelli Gemini 2.0 Flash sono equivalenti a quelli usati da Lovable AI
- Nessun impatto sulla qualità degli articoli
- Mantieni `LOVABLE_API_KEY` come fallback se preferisci

