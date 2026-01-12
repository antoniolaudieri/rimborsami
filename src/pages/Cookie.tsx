import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CookiePage() {
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
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Cookie Policy</h1>
                <p className="text-muted-foreground">Ultimo aggiornamento: Gennaio 2025</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Cosa Sono i Cookie</h2>
              <p>
                I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo 
                (computer, tablet, smartphone) quando li visiti. Servono a rendere più efficiente 
                la navigazione e a fornire informazioni ai proprietari del sito.
              </p>
              <p>
                I cookie possono essere "di sessione" (cancellati alla chiusura del browser) 
                o "persistenti" (rimangono fino alla scadenza o cancellazione manuale).
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">2. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati raccolti tramite cookie è <strong>Riccardo Casagrande</strong>, 
                con sede in Via Alessandro Manzoni, 18100 Imperia (IM), Italia, P.IVA 01538960087.
              </p>
              <p>
                Email: <a href="mailto:privacy@rimborsami.it" className="text-primary hover:underline">privacy@rimborsami.it</a>
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">3. Tipologie di Cookie Utilizzati</h2>
              
              <h3 className="text-lg font-medium mt-4">3.1 Cookie Tecnici (Strettamente Necessari)</h3>
              <p>
                Questi cookie sono essenziali per il funzionamento del sito e non possono essere 
                disabilitati. Vengono utilizzati per:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestire la sessione di navigazione</li>
                <li>Autenticazione utente e sicurezza dell'account</li>
                <li>Memorizzare le preferenze di consenso cookie</li>
                <li>Garantire la sicurezza delle transazioni</li>
              </ul>
              <p className="mt-2">
                <strong>Base giuridica:</strong> Legittimo interesse (art. 6.1.f GDPR) - necessari 
                per l'erogazione del servizio.
              </p>

              <h3 className="text-lg font-medium mt-6">3.2 Cookie Analitici</h3>
              <p>
                Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito, 
                raccogliendo informazioni in forma aggregata e anonima:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Numero di visitatori</li>
                <li>Pagine più visitate</li>
                <li>Tempo medio di permanenza</li>
                <li>Provenienza del traffico</li>
              </ul>
              <p className="mt-2">
                <strong>Base giuridica:</strong> Consenso dell'utente (art. 6.1.a GDPR).
              </p>

              <h3 className="text-lg font-medium mt-6">3.3 Cookie di Funzionalità</h3>
              <p>
                Consentono al sito di ricordare le scelte effettuate (lingua, regione, preferenze 
                di visualizzazione) per offrirti funzionalità avanzate e personalizzate.
              </p>
              <p className="mt-2">
                <strong>Base giuridica:</strong> Consenso dell'utente (art. 6.1.a GDPR).
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">4. Elenco dei Cookie Utilizzati</h2>
              <div className="overflow-x-auto not-prose">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Fornitore</TableHead>
                      <TableHead>Finalità</TableHead>
                      <TableHead>Durata</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">sb-auth-token</TableCell>
                      <TableCell>Rimborsami</TableCell>
                      <TableCell>Autenticazione utente</TableCell>
                      <TableCell>Sessione</TableCell>
                      <TableCell>Tecnico</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">sb-refresh-token</TableCell>
                      <TableCell>Rimborsami</TableCell>
                      <TableCell>Rinnovo sessione</TableCell>
                      <TableCell>30 giorni</TableCell>
                      <TableCell>Tecnico</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">cookie-consent</TableCell>
                      <TableCell>Rimborsami</TableCell>
                      <TableCell>Memorizza consenso cookie</TableCell>
                      <TableCell>1 anno</TableCell>
                      <TableCell>Tecnico</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">theme</TableCell>
                      <TableCell>Rimborsami</TableCell>
                      <TableCell>Preferenza tema chiaro/scuro</TableCell>
                      <TableCell>1 anno</TableCell>
                      <TableCell>Funzionalità</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">5. Cookie di Terze Parti</h2>
              <p>
                Alcuni cookie potrebbero essere impostati da servizi di terze parti che appaiono 
                sulle nostre pagine. Non abbiamo controllo su questi cookie. Le terze parti 
                potrebbero includere:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> per la gestione sicura dei pagamenti</li>
                <li><strong>Servizi di analytics:</strong> per l'analisi aggregata del traffico</li>
              </ul>
              <p className="mt-2">
                Ti invitiamo a consultare le privacy policy dei rispettivi servizi per maggiori 
                informazioni.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">6. Come Gestire i Cookie</h2>
              <p>
                Puoi gestire le preferenze sui cookie in diversi modi:
              </p>
              
              <h3 className="text-lg font-medium mt-4">6.1 Impostazioni del Browser</h3>
              <p>
                La maggior parte dei browser ti permette di:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Visualizzare i cookie memorizzati e cancellarli singolarmente</li>
                <li>Bloccare i cookie di terze parti</li>
                <li>Bloccare tutti i cookie</li>
                <li>Cancellare tutti i cookie alla chiusura del browser</li>
              </ul>
              
              <p className="mt-4">
                <strong>Link alle istruzioni per i principali browser:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Apple Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>

              <h3 className="text-lg font-medium mt-6">6.2 Opt-out Analytics</h3>
              <p>
                Per disattivare i cookie analitici puoi utilizzare:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://www.youronlinechoices.com/it/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Your Online Choices
                  </a> - Piattaforma europea per la gestione dei cookie pubblicitari
                </li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">7. Conseguenze della Disabilitazione</h2>
              <p>
                La disabilitazione dei cookie tecnici potrebbe compromettere il corretto 
                funzionamento del sito. In particolare:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Potrebbe non essere possibile effettuare il login</li>
                <li>Le preferenze potrebbero non essere salvate</li>
                <li>Alcune funzionalità potrebbero non essere disponibili</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">8. Aggiornamenti alla Cookie Policy</h2>
              <p>
                Questa Cookie Policy può essere aggiornata periodicamente. La data dell'ultimo 
                aggiornamento è indicata in cima a questa pagina. Ti invitiamo a consultare 
                regolarmente questa pagina per rimanere informato.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">9. Contatti</h2>
              <p>
                Per qualsiasi domanda sulla presente Cookie Policy, contattaci:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Titolare:</strong> Riccardo Casagrande</li>
                <li><strong>Indirizzo:</strong> Via Alessandro Manzoni, 18100 Imperia (IM), Italia</li>
                <li><strong>P.IVA:</strong> 01538960087</li>
                <li><strong>Email:</strong> <a href="mailto:privacy@rimborsami.it" className="text-primary hover:underline">privacy@rimborsami.it</a></li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">10. Riferimenti Normativi</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Regolamento UE 2016/679 (GDPR)</li>
                <li>D.Lgs. 196/2003 (Codice Privacy) come modificato dal D.Lgs. 101/2018</li>
                <li>Direttiva 2002/58/CE (ePrivacy)</li>
                <li>Linee Guida del Garante Privacy sui Cookie del 10 giugno 2021</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
