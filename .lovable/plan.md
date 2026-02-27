
# Diagnosi: Perché Non Pubblica Più

## Problemi Trovati

### 1. Generazione articoli ROTTA (dal 24 febbraio)
I cron partono ogni giorno (09:00 e 15:00) ma la edge function `generate-article-v2` restituisce **errore 500**:
```
"JSON parse error: Expected ',' or '}' after property value in JSON at position 1183"
```
L'AI (Gemini) genera JSON malformato che il parser non riesce a correggere. Risultato: **0 articoli negli ultimi 3 giorni**, quindi **0 post social**.

### 2. Bot Virale MAI attivato
I cron job per `viral-scheduler` (08:00, 12:00, 17:00, 20:00) **non sono mai stati creati** nel database. La tabella `content_reposts` è vuota. Le edge functions esistono ma nessuno le chiama.

### 3. Conseguenza
- 0 articoli nuovi = 0 post social = 0 traffico dai social
- Bot virale inattivo = nessun riciclo dei 77 articoli esistenti

---

## Piano di Fix

### Fix 1: Rendere il parser JSON più robusto
Migliorare `parseAIJson()` in `generate-article-v2` per gestire i JSON malformati dall'AI:
- Aggiungere pulizia di caratteri di controllo
- Gestire newline non escapate nelle stringhe
- Aggiungere fallback con regex per estrarre i campi chiave se il parse fallisce completamente

### Fix 2: Attivare i 4 cron del Bot Virale
Creare i cron job SQL per chiamare `viral-scheduler` 4 volte al giorno:
- 07:00 UTC (08:00 IT) - Dato del giorno
- 11:00 UTC (12:00 IT) - Contenuto pausa pranzo
- 16:00 UTC (17:00 IT) - Post pomeridiano
- 19:00 UTC (20:00 IT) - Sondaggio serale

### Fix 3: Test immediato
- Chiamare `generate-article-v2` per verificare che il fix funzioni
- Chiamare `viral-scheduler` per verificare che il bot parta

---

## File da modificare

| File | Modifica |
|------|----------|
| `supabase/functions/generate-article-v2/index.ts` | Fix `parseAIJson()` con sanitizzazione più aggressiva + fallback extraction |
| Database (SQL) | Inserire 4 cron job per viral-scheduler |

## Risultato atteso
- Articoli: da 0 a 2/giorno (ripristino)
- Post social da articoli: da 0 a 6/giorno (ripristino)
- Post social da bot virale: da 0 a 4-8/giorno (nuovo)
- Totale post: **10-14/giorno**
