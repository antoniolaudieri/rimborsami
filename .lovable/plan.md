
# Bot Virale per Rimborsami.app

## Stato Attuale
- **Contenuti**: 71 articoli pubblicati, 2 al giorno (cron 09:00 + 15:00)
- **Social attivi**: LinkedIn (36 post), Facebook (27 post), Twitter (18 post) - tutti funzionanti
- **Problema**: ogni articolo genera solo 1 post per piattaforma. Dopo la pubblicazione, il contenuto "muore"

## Il Problema Fondamentale
Pubblichi 2 articoli al giorno = 6 post social totali. Per diventare virale servono:
- **Volume**: 10-15 post/giorno per piattaforma
- **Varieta**: formati diversi (tip, thread, sondaggio, dato del giorno)
- **Riciclo**: i 71 articoli esistenti sono una miniera non sfruttata
- **Engagement**: contenuti che generano commenti e condivisioni

---

## Piano: 3 Nuove Edge Functions

### 1. `content-repurposer` - Ricicla contenuti esistenti
Prende articoli gia pubblicati e li trasforma in micro-contenuti diversi:

- **"Dato del giorno"**: estrae una statistica dall'articolo e crea un post visivo
- **"Lo sapevi che..."**: trasforma un paragrafo in un tip rapido
- **"Thread"**: spezza un articolo lungo in 3-4 tweet concatenati
- **"Sondaggio"**: crea una domanda a partire dall'argomento dell'articolo
- **"Mito vs Realta"**: format educativo che funziona bene su tutti i social

Frequenza: 3-4 post extra al giorno, pescando da articoli vecchi (non ripetere lo stesso articolo per 14 giorni).

### 2. `viral-scheduler` - Orchestratore centrale
Un cron che gira 4 volte al giorno (08:00, 12:00, 17:00, 20:00) e decide cosa pubblicare:

- **08:00**: Dato del giorno / Tip mattutino (contenuto leggero)
- **12:00**: Contenuto educativo riciclato (pausa pranzo = alto engagement)
- **17:00**: Post dall'articolo del pomeriggio (gia attivo) + micro-contenuto extra
- **20:00**: Sondaggio / domanda serale (genera commenti)

Logica interna:
- Tiene traccia degli articoli gia riciclati (tabella `content_reposts`)
- Evita di ripetere lo stesso contenuto troppo spesso
- Alterna i formati per non risultare ripetitivo
- Ruota le piattaforme (non tutto su tutti i canali)

### 3. `engagement-hooks` - Contenuti interattivi sul sito
Aggiunge elementi virali direttamente nel sito:

- **"Quanto potresti recuperare?"** - Mini calcolatore in ogni articolo che invita a condividere il risultato
- **Share incentivato**: dopo la lettura di un articolo, mostra "Condividi e aiuta un amico a recuperare i suoi soldi" con pulsanti piu prominenti
- **Counter sociale**: mostra quante volte un articolo e stato condiviso (social proof reale)

---

## Dettagli Tecnici

### Nuova tabella: `content_reposts`

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | uuid | PK |
| article_id | uuid | FK a news_articles |
| format | text | tipo di contenuto (tip, thread, poll, dato, mito) |
| platform | text | dove e stato pubblicato |
| post_text | text | testo generato |
| posted_at | timestamptz | quando e stato pubblicato |
| created_at | timestamptz | default now() |

### File da creare

| File | Scopo |
|------|-------|
| `supabase/functions/content-repurposer/index.ts` | Genera micro-contenuti da articoli esistenti usando Groq AI |
| `supabase/functions/viral-scheduler/index.ts` | Cron orchestratore che decide cosa pubblicare e quando |

### File da modificare

| File | Modifica |
|------|----------|
| `src/pages/NewsArticle.tsx` | Aggiungere mini-calcolatore "Quanto potresti recuperare?" + share piu prominente a fine articolo |
| `src/components/news/ShareDropdown.tsx` | Aggiungere contesto motivazionale ("Aiuta un amico!") e tracking condivisioni |
| `supabase/config.toml` | Aggiungere config per le 2 nuove edge functions |

### Cron Jobs da aggiungere (SQL)
4 esecuzioni giornaliere del viral-scheduler:
- 08:00, 12:00, 17:00, 20:00 (orari italiani di picco engagement)

### Flusso del Viral Scheduler

```text
CRON (4x/giorno)
     |
     v
viral-scheduler
     |
     +-- Controlla: "Ho gia postato in questo slot oggi?"
     |
     +-- Seleziona formato (tip/thread/poll/dato/mito)
     |
     +-- Seleziona articolo (non usato negli ultimi 14gg)
     |
     v
content-repurposer
     |
     +-- Genera testo con Groq AI
     |
     +-- Adatta per piattaforma (FB/IG/X/LinkedIn)
     |
     v
post-to-ayrshare + post-to-linkedin
     |
     +-- Salva in content_reposts
     |
     v
Da 6 post/giorno a 14-18 post/giorno
```

---

## Impatto Atteso

| Metrica | Ora | Dopo 30gg |
|---------|-----|-----------|
| Post social/giorno | 6 | 14-18 |
| Formati contenuto | 1 (articolo) | 6 (tip, thread, poll, dato, mito, articolo) |
| Articoli "riciclati" | 0 | 71 (tutto il catalogo) |
| Impression stimate | ~500/giorno | 3.000-5.000/giorno |
| Click al sito | ~5/giorno | 30-50/giorno |

---

## Ordine di Implementazione

1. **Tabella `content_reposts`** - tracking dei contenuti riciclati
2. **`content-repurposer`** - il motore che genera micro-contenuti
3. **`viral-scheduler`** - l'orchestratore dei tempi
4. **Cron jobs** - attivare i 4 slot giornalieri
5. **Share migliorato** - CTA piu efficaci sugli articoli
6. **Mini calcolatore** - elemento virale nell'articolo

---

## Dipendenze
- Nessuna nuova API key (usa Groq + Ayrshare + LinkedIn gia configurati)
- Nessun nuovo servizio esterno
- Solo logica aggiuntiva e scheduling piu frequente
