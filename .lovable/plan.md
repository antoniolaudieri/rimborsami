
# Piano: Aumento Traffico + Ottimizzazione Conversioni

## Contesto Attuale
- **Traffico**: ~12 visitatori/giorno (in calo)
- **Registrazioni**: 3 totali (~1% conversione)
- **Contenuti**: 65 articoli pubblicati, cron attivi per 2 articoli/giorno
- **Social**: Automazione configurata (Ayrshare + LinkedIn) ma probabilmente inattiva

---

## PARTE 1: Aumento Acquisizione Traffico

### 1.1 Riattivare Pubblicazione Social Automatica
La generazione articoli è attiva (cron alle 09:00 e 15:00), ma la pubblicazione social dopo ogni articolo non è automatica.

**Azione**: Modificare `generate-article-v2` per chiamare automaticamente `post-to-ayrshare` e `post-to-linkedin` dopo ogni articolo generato con successo.

### 1.2 Migliorare SEO Tecnico
**Azioni**:
- Aggiungere meta tags Open Graph dinamici per ogni pagina
- Implementare breadcrumbs strutturati per la navigazione
- Verificare che sitemap e robots.txt siano correttamente indicizzati

### 1.3 Aggiungere Condivisione Articoli
**Azione**: Aggiungere pulsanti di condivisione social su ogni articolo news per aumentare la viralità organica.

---

## PARTE 2: Ottimizzazione Funnel Conversione

### 2.1 Aggiungere Login con Google (Priorità Alta)
Riduce drasticamente l'attrito alla registrazione (1 click vs 4 campi + conferma email).

**Implementazione**:
- Configurare Google OAuth tramite Lovable Cloud
- Aggiungere pulsante "Continua con Google" nella pagina Auth
- Mantenere anche l'opzione email/password come fallback

### 2.2 Semplificare il Funnel
**Problema attuale**: 
```text
Landing → Quiz (4 step) → Auth → Onboarding Quiz → Dashboard
```

**Nuovo flusso**:
```text
Landing → Auth (con Google 1-click) → Dashboard
         ↓
      Quiz opzionale (inline o post-login)
```

**Azioni**:
- Rendere il quiz pre-signup opzionale (non bloccare la registrazione)
- Spostare l'onboarding quiz dentro la dashboard come step consigliato

### 2.3 CTA Ubique su Desktop + Mobile
**Problema**: StickyCTA è solo mobile, ExitIntentPopup è solo desktop.

**Azioni**:
- Aggiungere `StickyTopBar` anche su Index (già esiste ma non è usato)
- Mostrare ExitIntentPopup anche su mobile (con adattamento UI)

### 2.4 Micro-conversioni Alternative
Per chi non vuole registrarsi subito, catturare comunque il lead.

**Azione**: Aggiungere opzione "Ricevi la guida gratuita via email" come alternativa soft alla registrazione completa.

---

## Dettagli Tecnici

### File da Modificare

| File | Modifica |
|------|----------|
| `supabase/functions/generate-article-v2/index.ts` | Aggiungere chiamata a post-to-ayrshare e post-to-linkedin dopo generazione articolo |
| `src/pages/Auth.tsx` | Aggiungere pulsante Google OAuth + semplificare UI |
| `src/contexts/AuthContext.tsx` | Aggiungere metodo `signInWithGoogle` |
| `src/pages/Index.tsx` | Importare e usare `StickyTopBar` |
| `src/components/landing/ExitIntentPopup.tsx` | Abilitare anche su mobile con UI adattata |
| `src/components/landing/StickyCTA.tsx` | Verificare che sia attivo anche su tablet |

### Configurazione Google OAuth
Utilizzeremo la soluzione gestita di Lovable Cloud (non richiede configurazione manuale).

### Flusso Social Automatico Post-Articolo

```text
┌──────────────────────────────────────────────────────────┐
│                   CRON (09:00 / 15:00)                   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────────┐
                   │  generate-article-v2 │
                   │  (Groq AI)           │
                   └──────────┬──────────┘
                              │ Articolo salvato
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ post-to-ayrshare │             │ post-to-linkedin │
    │ (FB, IG, X)      │             │ (LinkedIn)       │
    └─────────────────┘             └─────────────────┘
```

---

## Impatto Atteso

| Metrica | Attuale | Obiettivo 30gg |
|---------|---------|----------------|
| Visitatori/giorno | 12 | 50-100 |
| Tasso conversione | 1% | 5-8% |
| Registrazioni/mese | 3 | 75-240 |

---

## Priorità Implementazione

1. **Google OAuth** - Massimo impatto su conversioni
2. **Social automatico** - Traffico gratuito
3. **CTA desktop** - Quick win
4. **Semplificazione funnel** - Rimuove barriere

---

## Dipendenze
- Nessuna nuova API key richiesta (Google OAuth è gestito da Lovable Cloud)
- Tutti i secret necessari sono già configurati (GROQ_API_KEY, AYRSHARE_API_KEY, LINKEDIN_*)
