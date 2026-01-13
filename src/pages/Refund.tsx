import { Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle, XCircle, Mail, Clock, Euro } from "lucide-react";
import { motion } from "framer-motion";

const Refund = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
              Politica di <span className="text-gradient-hero">Rimborso</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Data di entrata in vigore: 13 Gennaio 2026
            </p>
          </div>

          {/* Intro */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              In Rimborsami crediamo che il nostro valore debba essere tangibile, misurabile e giusto. 
              La nostra Politica di Rimborso è progettata per proteggere il tuo investimento nella nostra 
              piattaforma e riflettere il nostro impegno per la soddisfazione del cliente. Se Rimborsami 
              non ti aiuta a recuperare più di quanto spendi durante i primi 12 mesi di servizio, potresti 
              avere diritto a un rimborso secondo la nostra Garanzia Soddisfatti o Rimborsati.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Section 1 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                  <Euro className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  1. Garanzia Soddisfatti o Rimborsati
                </h2>
              </div>
              <div className="pl-14 space-y-4 text-muted-foreground">
                <p>
                  Rimborsami offre una garanzia soddisfatti o rimborsati ai nuovi utenti durante i primi 
                  <strong className="text-foreground"> dodici (12) mesi</strong> di servizio a pagamento. 
                  Questa garanzia si applica indipendentemente dal fatto che tu scelga un piano mensile, 
                  annuale o una tantum.
                </p>
                <p>
                  Lo scopo di questa politica è garantire che il tuo abbonamento ti offra più benefici 
                  economici di quanto costi. Se questo risultato non viene raggiunto, ti rimborseremo 
                  la quota di abbonamento secondo i termini di questo documento.
                </p>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-foreground font-medium">
                    💡 In breve: Se paghi Rimborsami e non ricevi almeno un importo uguale o superiore 
                    in rimborsi, risarcimenti o risparmi facilitati dalla piattaforma durante il primo 
                    anno, puoi richiedere il rimborso di quanto pagato.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  2. Requisiti di Idoneità
                </h2>
              </div>
              <div className="pl-14 space-y-4 text-muted-foreground">
                <p>Per avere diritto a un rimborso, devono essere soddisfatte tutte le seguenti condizioni:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Pagamento valido:</strong> Devi aver effettuato 
                      un pagamento valido per i servizi Rimborsami (mensile, annuale o una tantum) 
                      attraverso la nostra app, sito web o provider di pagamento autorizzato.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Beneficio inferiore al costo:</strong> Durante 
                      i primi 12 mesi di servizio continuativo, il tuo beneficio economico cumulativo da 
                      Rimborsami deve essere inferiore all'importo totale pagato.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Richiesta tempestiva:</strong> Devi inviare la 
                      richiesta di rimborso entro <strong>trenta (30) giorni</strong> dalla conclusione 
                      del periodo di idoneità di 12 mesi.
                    </span>
                  </li>
                </ul>
                <p className="text-sm">
                  Ogni account ha diritto a questo rimborso una sola volta. La re-iscrizione o la 
                  creazione di account multipli non reimposta l'idoneità al rimborso.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  3. Come Richiedere un Rimborso
                </h2>
              </div>
              <div className="pl-14 space-y-4 text-muted-foreground">
                <p>Per avviare una richiesta di rimborso, invia un'email a:</p>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <a 
                    href="mailto:supporto@rimborsami.app" 
                    className="text-primary font-semibold text-lg hover:underline"
                  >
                    supporto@rimborsami.app
                  </a>
                  <p className="text-sm mt-2">Oggetto: "Richiesta di Rimborso"</p>
                </div>
                <p>La tua email deve includere:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Il tuo nome completo e l'indirizzo email associato al tuo account</li>
                  <li>La data del pagamento originale dell'abbonamento (o allega la ricevuta)</li>
                  <li>Una breve spiegazione del motivo per cui ritieni di avere diritto al rimborso</li>
                </ul>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm">
                    Risponderemo entro <strong className="text-foreground">5 giorni lavorativi</strong>. 
                    Se approvato, i fondi saranno restituiti entro <strong className="text-foreground">10 giorni lavorativi</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  4. Esclusioni e Criteri di Rifiuto
                </h2>
              </div>
              <div className="pl-14 space-y-4 text-muted-foreground">
                <p>
                  Rimborsami si riserva il diritto di rifiutare le richieste di rimborso per i seguenti motivi:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      Se hai ricevuto rimborsi, risarcimenti o risparmi che eguagliano o superano 
                      il costo totale dell'abbonamento
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      Se la richiesta viene inviata più di 30 giorni dopo la fine del periodo di idoneità
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      In caso di abuso della piattaforma: richieste fraudolente, account duplicati, 
                      violazione dei Termini di Servizio
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      Se hai già ricevuto un rimborso in precedenza secondo questa politica
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4">
                5. Ambito e Limitazioni
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Questa politica di rimborso si applica esclusivamente ai pagamenti effettuati 
                  direttamente a Rimborsami, tramite la nostra app o sito web. Non copre:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Commissioni di terze parti (es. spese di bollo, commissioni bancarie)</li>
                  <li>Commissioni di app store</li>
                  <li>Prodotti o servizi acquistati tramite link affiliati o partner</li>
                </ul>
                <p>
                  In nessun caso Rimborsami sarà responsabile per perdite indirette, consequenziali 
                  o incidentali associate a richieste rifiutate o ritardi nell'elaborazione.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4">
                6. Revisione Finale e Discrezionalità
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Rimborsami valuterà l'idoneità al rimborso in base ai dati disponibili nella cronologia 
                  del tuo account, inclusi i record delle richieste, il tracciamento dei pagamenti e le 
                  metriche di utilizzo. Ci riserviamo il diritto di prendere decisioni ragionevoli 
                  basate su informazioni incomplete quando necessario.
                </p>
                <p>
                  I rimborsi emessi secondo questa politica sono definitivi e non saranno rivalutati. 
                  Questa politica non crea un diritto legalmente vincolante al rimborso oltre a quanto 
                  qui dichiarato. La offriamo come beneficio per il cliente e potremmo modificarla o 
                  interromperla in futuro, anche se le modifiche non influenzeranno i diritti di 
                  rimborso maturati secondo i termini precedenti.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6 sm:p-8 text-center">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4">
                7. Contattaci
              </h2>
              <p className="text-muted-foreground mb-6">
                Per domande o per inviare una richiesta di rimborso, contattaci:
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Rimborsami</p>
                <p className="text-muted-foreground">Team Supporto</p>
                <a 
                  href="mailto:supporto@rimborsami.app" 
                  className="text-primary font-semibold hover:underline"
                >
                  supporto@rimborsami.app
                </a>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Rimborsami. Tutti i diritti riservati.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Termini</Link>
            <Link to="/cookie" className="hover:text-foreground transition-colors">Cookie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Refund;
