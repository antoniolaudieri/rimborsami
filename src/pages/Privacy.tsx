import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
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
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">Ultimo aggiornamento: Gennaio 2025</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati personali è <strong>Riccardo Casagrande</strong> (ditta individuale), 
                con sede legale in Via Alessandro Manzoni, 18100 Imperia (IM), Italia, P.IVA 01538960087 
                (di seguito "Rimborsami", "noi" o "Titolare").
              </p>
              <p>
                Per qualsiasi richiesta relativa al trattamento dei dati personali, puoi contattarci 
                all'indirizzo email: <a href="mailto:privacy@rimborsami.it" className="text-primary hover:underline">privacy@rimborsami.it</a>
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">2. Dati Raccolti</h2>
              <p>Raccogliamo le seguenti categorie di dati personali:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dati identificativi:</strong> nome, cognome, codice fiscale, indirizzo email, numero di telefono</li>
                <li><strong>Dati finanziari:</strong> informazioni relative a pagamenti, rimborsi e transazioni</li>
                <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, tempo di permanenza</li>
                <li><strong>Documenti caricati:</strong> email, ricevute, fatture e altri documenti forniti volontariamente</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">3. Finalità del Trattamento</h2>
              <p>I tuoi dati personali sono trattati per le seguenti finalità:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornitura dei servizi di identificazione e recupero rimborsi</li>
                <li>Gestione del tuo account e delle tue richieste</li>
                <li>Comunicazioni relative ai servizi acquistati</li>
                <li>Adempimento di obblighi legali e fiscali</li>
                <li>Con il tuo consenso, invio di comunicazioni promozionali</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">4. Base Giuridica</h2>
              <p>Il trattamento dei tuoi dati si basa su:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Esecuzione del contratto:</strong> per la fornitura dei servizi richiesti</li>
                <li><strong>Obblighi legali:</strong> per adempiere a normative fiscali e di legge</li>
                <li><strong>Consenso:</strong> per l'invio di comunicazioni marketing</li>
                <li><strong>Legittimo interesse:</strong> per migliorare i nostri servizi e la sicurezza</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">5. Conservazione dei Dati</h2>
              <p>
                I tuoi dati personali saranno conservati per il tempo necessario alle finalità 
                per cui sono stati raccolti, e comunque non oltre i termini previsti dalla legge. 
                In particolare:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dati contrattuali: 10 anni dalla cessazione del rapporto</li>
                <li>Dati fiscali: 10 anni come previsto dalla normativa</li>
                <li>Dati di navigazione: 6 mesi</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">6. I Tuoi Diritti (GDPR)</h2>
              <p>In qualità di interessato, ai sensi degli articoli 15-22 del Regolamento UE 2016/679 (GDPR), hai diritto a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Accesso (art. 15):</strong> ottenere conferma e copia dei tuoi dati personali</li>
                <li><strong>Rettifica (art. 16):</strong> correggere dati inesatti o incompleti</li>
                <li><strong>Cancellazione (art. 17):</strong> richiedere la cancellazione dei dati (diritto all'oblio)</li>
                <li><strong>Limitazione (art. 18):</strong> limitare il trattamento in determinate circostanze</li>
                <li><strong>Portabilità (art. 20):</strong> ricevere i dati in formato strutturato, di uso comune e leggibile da dispositivo automatico</li>
                <li><strong>Opposizione (art. 21):</strong> opporti al trattamento per motivi legittimi</li>
                <li><strong>Revoca del consenso:</strong> ritirare il consenso in qualsiasi momento senza pregiudicare la liceità del trattamento precedente</li>
              </ul>
              <p className="mt-4">
                Per esercitare i tuoi diritti, scrivi a: <a href="mailto:privacy@rimborsami.it" className="text-primary hover:underline">privacy@rimborsami.it</a>
              </p>
              <p className="mt-2">
                Risponderemo alla tua richiesta entro 30 giorni dal ricevimento.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">7. Trasferimento Dati Extra-UE</h2>
              <p>
                I tuoi dati personali sono trattati principalmente all'interno dell'Unione Europea. 
                Nel caso in cui sia necessario trasferire i dati verso paesi terzi, ci assicuriamo che:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Il paese destinatario garantisca un livello di protezione adeguato (decisione di adeguatezza della Commissione UE)</li>
                <li>Siano presenti Clausole Contrattuali Standard approvate dalla Commissione Europea</li>
                <li>Il destinatario aderisca a meccanismi di certificazione riconosciuti</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">8. Cookie</h2>
              <p>
                Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo consenso, 
                cookie analitici per migliorare la tua esperienza. Per maggiori informazioni dettagliate, 
                consulta la nostra <Link to="/cookie" className="text-primary hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">9. Sicurezza</h2>
              <p>
                Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati, 
                tra cui:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
                <li>Server situati nell'Unione Europea</li>
                <li>Accesso ai dati limitato al personale autorizzato</li>
                <li>Backup regolari e procedure di disaster recovery</li>
                <li>Autenticazione sicura con password crittografate</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">10. Contatti e Reclami</h2>
              <p>
                Per qualsiasi domanda o reclamo relativo al trattamento dei tuoi dati personali, 
                puoi contattare il Titolare del trattamento:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Titolare:</strong> Riccardo Casagrande</li>
                <li><strong>Indirizzo:</strong> Via Alessandro Manzoni, 18100 Imperia (IM), Italia</li>
                <li><strong>P.IVA:</strong> 01538960087</li>
                <li><strong>Email:</strong> <a href="mailto:privacy@rimborsami.it" className="text-primary hover:underline">privacy@rimborsami.it</a></li>
              </ul>
              <p className="mt-4">
                Hai inoltre il diritto di proporre reclamo all'Autorità Garante per la Protezione 
                dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.garanteprivacy.it</a>).
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
