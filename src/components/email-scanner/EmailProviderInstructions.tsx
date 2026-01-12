import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Info } from "lucide-react";

interface EmailProviderInstructionsProps {
  provider: string;
}

const PROVIDER_INSTRUCTIONS: Record<string, {
  title: string;
  steps: string[];
  link?: string;
  warning?: string;
}> = {
  gmail: {
    title: "Password per le app Google",
    steps: [
      "Vai su myaccount.google.com e accedi",
      "Vai su Sicurezza → Verifica in due passaggi (attivala se non l'hai fatto)",
      "Cerca \"Password per le app\" in fondo alla pagina",
      "Seleziona \"Altra (nome personalizzato)\" e scrivi \"Rimborsami\"",
      "Copia la password di 16 caratteri generata",
    ],
    link: "https://myaccount.google.com/apppasswords",
    warning: "Non usare la tua password normale di Google. Gmail richiede una password per le app.",
  },
  outlook: {
    title: "Configurazione Outlook/Hotmail",
    steps: [
      "Vai su account.microsoft.com e accedi",
      "Vai su Sicurezza → Opzioni di sicurezza avanzate",
      "Attiva la verifica in due passaggi se non attiva",
      "Crea una nuova password per le app",
      "Usa questa password per collegarti",
    ],
    link: "https://account.microsoft.com/security",
    warning: "Per account Microsoft 365 aziendali, IMAP potrebbe essere disabilitato dall'amministratore.",
  },
  libero: {
    title: "Configurazione Libero Mail",
    steps: [
      "Puoi usare la tua password normale di Libero",
      "Se hai problemi, verifica che IMAP sia abilitato",
      "Vai su Impostazioni → POP/IMAP nella webmail",
    ],
  },
  aruba: {
    title: "Configurazione Aruba PEC",
    steps: [
      "Usa la password della tua casella PEC",
      "Assicurati di inserire l'indirizzo completo @pec.it",
    ],
    warning: "Per la PEC, usa il server imaps.pec.aruba.it",
  },
  yahoo: {
    title: "Password per le app Yahoo",
    steps: [
      "Vai su login.yahoo.com e accedi",
      "Vai su Sicurezza account",
      "Cerca \"Genera password per le app\"",
      "Seleziona \"Altra app\" e genera la password",
    ],
    link: "https://login.yahoo.com/account/security",
  },
  altro: {
    title: "Configurazione manuale IMAP",
    steps: [
      "Trova le impostazioni IMAP del tuo provider email",
      "Server IMAP: solitamente imap.tuoprovider.it",
      "Porta: 993 (con SSL/TLS)",
      "Usa la tua password o una password per le app se richiesta",
    ],
  },
};

export function EmailProviderInstructions({ provider }: EmailProviderInstructionsProps) {
  const instructions = PROVIDER_INSTRUCTIONS[provider] || PROVIDER_INSTRUCTIONS.altro;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">{instructions.title}</h4>
      </div>

      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
        {instructions.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>

      {instructions.link && (
        <a
          href={instructions.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Apri pagina impostazioni
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {instructions.warning && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertDescription className="text-sm">
            ⚠️ {instructions.warning}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
