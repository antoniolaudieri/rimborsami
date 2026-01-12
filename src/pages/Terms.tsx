import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Termini di Servizio</h1>
                <p className="text-muted-foreground">Ultimo aggiornamento: Gennaio 2025</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Definizioni</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Rimborsami"</strong>: la piattaforma e i servizi offerti da Riccardo Casagrande (ditta individuale), P.IVA 01538960087, con sede in Via Alessandro Manzoni, 18100 Imperia (IM), Italia</li>
                <li><strong>"Utente"</strong>: qualsiasi persona fisica che accede e utilizza la piattaforma</li>
                <li><strong>"Servizio"</strong>: l'identificazione e la gestione di opportunità di rimborso</li>
                <li><strong>"Account"</strong>: l'account personale creato dall'Utente sulla piattaforma</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">2. Descrizione del Servizio</h2>
              <p>
                Rimborsami è una piattaforma che aiuta gli utenti a identificare e recuperare 
                rimborsi, compensazioni e indennizzi derivanti da:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Voli cancellati o in ritardo (Regolamento UE 261/2004)</li>
                <li>Acquisti online con problemi di consegna o reso</li>
                <li>Commissioni bancarie illegittime</li>
                <li>Polizze assicurative con clausole vessatorie</li>
                <li>Garanzie legali sui prodotti (Codice del Consumo)</li>
              </ul>
              <p className="mt-4">
                Il servizio prevede l'analisi automatizzata dei documenti forniti dall'utente 
                e la generazione di template per le richieste di rimborso.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">3. Registrazione e Account</h2>
              <p>Per utilizzare i servizi di Rimborsami è necessario:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Avere almeno 18 anni o la maggiore età prevista nel proprio paese</li>
                <li>Fornire informazioni accurate e aggiornate</li>
                <li>Mantenere la riservatezza delle credenziali di accesso</li>
                <li>Notificare immediatamente qualsiasi uso non autorizzato dell'account</li>
              </ul>
              <p className="mt-4">
                L'utente è responsabile di tutte le attività svolte tramite il proprio account.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">4. Piani di Abbonamento</h2>
              <h3 className="text-lg font-medium mt-4">4.1 Piano Free</h3>
              <p>Include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accesso limitato a 3 opportunità di rimborso</li>
                <li>Generatore di richieste base</li>
                <li>Supporto via email</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">4.2 Piano Premium</h3>
              <p>Include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Opportunità illimitate</li>
                <li>Template email e PEC personalizzati</li>
                <li>Notifiche scadenze</li>
                <li>Supporto prioritario</li>
              </ul>
              <p className="mt-4">
                <strong>Costo:</strong> €9,99/mese o €59,99/anno (sconto del 50%)
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">5. Pagamenti e Fatturazione</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>I pagamenti sono gestiti tramite Stripe in modo sicuro</li>
                <li>Gli abbonamenti si rinnovano automaticamente alla scadenza</li>
                <li>L'utente può disdire in qualsiasi momento dalle impostazioni</li>
                <li>Non sono previsti rimborsi per periodi parziali</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">6. Diritto di Recesso</h2>
              <p>
                Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), hai diritto di recedere dal 
                contratto entro 14 giorni dalla sottoscrizione dell'abbonamento, senza dover 
                fornire alcuna motivazione.
              </p>
              <p className="mt-2">
                Per esercitare il diritto di recesso, invia una comunicazione a{' '}
                <a href="mailto:recesso@rimborsami.it" className="text-primary hover:underline">recesso@rimborsami.it</a>{' '}
                indicando la tua volontà di recedere. Il rimborso sarà effettuato entro 14 giorni 
                utilizzando lo stesso metodo di pagamento.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">7. Limitazioni di Responsabilità</h2>
              <p>Rimborsami:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornisce strumenti e informazioni, ma non garantisce l'esito positivo delle richieste di rimborso</li>
                <li>Non è uno studio legale e non fornisce consulenza legale</li>
                <li>Non è responsabile per ritardi o rifiuti da parte di terzi (compagnie aeree, banche, etc.)</li>
                <li>Si riserva il diritto di modificare o interrompere il servizio con preavviso</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">8. Uso Accettabile</h2>
              <p>L'utente si impegna a non:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizzare il servizio per scopi illegali o fraudolenti</li>
                <li>Fornire documenti falsi o contraffatti</li>
                <li>Tentare di accedere ad account di altri utenti</li>
                <li>Interferire con il funzionamento della piattaforma</li>
                <li>Rivendere o condividere l'accesso all'account</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">9. Proprietà Intellettuale</h2>
              <p>
                Tutti i contenuti della piattaforma (testi, grafica, software, template) sono 
                di proprietà di Riccardo Casagrande o dei suoi licenziatari. L'utente ha una 
                licenza limitata e non esclusiva per l'uso personale del servizio.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">10. Modifiche ai Termini</h2>
              <p>
                Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. 
                Le modifiche saranno comunicate via email o tramite la piattaforma con almeno 
                15 giorni di preavviso. L'uso continuato del servizio dopo le modifiche 
                costituisce accettazione dei nuovi termini.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">11. Legge Applicabile e Foro Competente</h2>
              <p>
                I presenti Termini sono regolati dalla legge italiana. Per qualsiasi 
                controversia sarà competente in via esclusiva il Foro di Imperia, 
                fatto salvo il foro del consumatore previsto dall'art. 66-bis del 
                Codice del Consumo (D.Lgs. 206/2005).
              </p>
              <p className="mt-2">
                Per le controversie relative a contratti online, i consumatori possono 
                accedere alla piattaforma ODR dell'Unione Europea:{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">12. Contatti</h2>
              <p>
                Per qualsiasi domanda sui presenti Termini di Servizio, contattaci:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Titolare:</strong> Riccardo Casagrande</li>
                <li><strong>Indirizzo:</strong> Via Alessandro Manzoni, 18100 Imperia (IM), Italia</li>
                <li><strong>P.IVA:</strong> 01538960087</li>
                <li><strong>Email:</strong> <a href="mailto:legal@rimborsami.it" className="text-primary hover:underline">legal@rimborsami.it</a></li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
