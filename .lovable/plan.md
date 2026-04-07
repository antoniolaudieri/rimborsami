

# Piano: Migrare da Groq a Lovable AI (gratuito)

## Situazione attuale
4 edge functions usano Groq API (a pagamento):
- `generate-article-v2` - generazione articoli SEO
- `content-repurposer` - riciclo contenuti per social
- `post-to-ayrshare` - generazione testi per Facebook/Twitter
- `post-to-linkedin` - generazione testi per LinkedIn

Altre 5 funzioni usano già Lovable AI. Il `LOVABLE_API_KEY` è già configurato.

## Cosa cambia
In ognuna delle 4 funzioni, sostituire:
- **URL**: `https://api.groq.com/openai/v1/chat/completions` → `https://ai.gateway.lovable.dev/v1/chat/completions`
- **API Key**: `GROQ_API_KEY` → `LOVABLE_API_KEY`
- **Modello**: `llama-3.3-70b-versatile` → `google/gemini-2.5-flash` (veloce, economico, ottimo per testo)
- **Errori**: gestire 429 (rate limit) e 402 (crediti esauriti)

## File da modificare

| File | Modifica |
|------|----------|
| `supabase/functions/generate-article-v2/index.ts` | Funzione `callGroqAI` → `callLovableAI` |
| `supabase/functions/content-repurposer/index.ts` | Funzione `callGroqAI` → `callLovableAI` |
| `supabase/functions/post-to-ayrshare/index.ts` | Funzione `callGroqAI` → `callLovableAI` + `generatePlatformTexts` |
| `supabase/functions/post-to-linkedin/index.ts` | Chiamata diretta Groq → Lovable AI |

## Vantaggi
- Zero costi Groq (incluso nel piano Lovable)
- Modello più potente (Gemini 2.5 Flash > Llama 3.3 70b per testo italiano)
- Meno JSON malformati (il problema che bloccava la generazione articoli)
- Un'unica API key per tutto

## Rischi
- Rate limit Lovable AI: con 14-18 post/giorno + 2 articoli non dovrebbe essere un problema
- Se si supera il rate limit, i post vengono saltati e riprovati al prossimo slot

