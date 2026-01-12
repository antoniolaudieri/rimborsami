import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmailProviderInstructions } from "./EmailProviderInstructions";
import { Loader2, Mail, Lock, Server, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROVIDERS = [
  { value: "gmail", label: "Gmail", icon: "📧" },
  { value: "outlook", label: "Outlook / Hotmail", icon: "📬" },
  { value: "libero", label: "Libero Mail", icon: "📩" },
  { value: "aruba", label: "Aruba PEC", icon: "📨" },
  { value: "yahoo", label: "Yahoo Mail", icon: "📪" },
  { value: "altro", label: "Altro provider", icon: "✉️" },
];

const PROVIDER_SERVERS: Record<string, { server: string; port: number }> = {
  gmail: { server: "imap.gmail.com", port: 993 },
  outlook: { server: "outlook.office365.com", port: 993 },
  libero: { server: "imapmail.libero.it", port: 993 },
  aruba: { server: "imaps.pec.aruba.it", port: 993 },
  yahoo: { server: "imap.mail.yahoo.com", port: 993 },
};

const formSchema = z.object({
  provider: z.string().min(1, "Seleziona un provider"),
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Inserisci la password"),
  customServer: z.string().optional(),
  customPort: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ConnectEmailFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConnectEmailForm({ onSuccess, onCancel }: ConnectEmailFormProps) {
  const [step, setStep] = useState<"provider" | "credentials" | "testing">("provider");
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "",
      email: "",
      password: "",
      customServer: "",
      customPort: 993,
    },
  });

  const selectedProvider = form.watch("provider");
  const showCustomServer = selectedProvider === "altro";

  const handleProviderSelect = (value: string) => {
    form.setValue("provider", value);
    setStep("credentials");
    setTestResult(null);
  };

  const testConnection = async (data: FormData) => {
    setIsSubmitting(true);
    setTestResult(null);
    setStep("testing");

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Non autenticato");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connect-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            action: "test-connection",
            provider: data.provider,
            email: data.email,
            password: data.password,
            customServer: data.customServer,
            customPort: data.customPort,
          }),
        }
      );

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        // Connection works, now save it
        const saveResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connect-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.session.access_token}`,
            },
            body: JSON.stringify({
              action: "connect",
              provider: data.provider,
              email: data.email,
              password: data.password,
              customServer: data.customServer,
              customPort: data.customPort,
            }),
          }
        );

        const saveResult = await saveResponse.json();

        if (saveResult.success) {
          toast.success("Email collegata con successo!");
          onSuccess();
        } else {
          setTestResult({ success: false, error: saveResult.error });
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : "Errore di connessione" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === "provider" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scegli il tuo provider email</h3>
          <p className="text-sm text-muted-foreground">
            Collegheremo la tua email in sola lettura per cercare opportunità di rimborso.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.value}
                onClick={() => handleProviderSelect(provider.value)}
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <span className="text-2xl">{provider.icon}</span>
                <span className="font-medium">{provider.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "credentials" && selectedProvider && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(testConnection)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setStep("provider")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Cambia provider
              </button>
            </div>

            <EmailProviderInstructions provider={selectedProvider} />

            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="tuaemail@esempio.com" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedProvider === "gmail" || selectedProvider === "outlook" || selectedProvider === "yahoo"
                        ? "Password per le app"
                        : "Password"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••••••" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomServer && (
                <>
                  <FormField
                    control={form.control}
                    name="customServer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server IMAP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="imap.tuoprovider.it" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porta IMAP</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="993" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connessione...
                  </>
                ) : (
                  "Collega Email"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === "testing" && (
        <div className="space-y-6 text-center py-8">
          {isSubmitting ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Connessione in corso...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Stiamo verificando le credenziali con il server IMAP
                </p>
              </div>
            </>
          ) : testResult?.success ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Connessione riuscita!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  La tua email è stata collegata con successo
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Connessione fallita</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {testResult?.error || "Errore sconosciuto"}
                </p>
              </div>
              <Button onClick={() => setStep("credentials")} variant="outline">
                Riprova
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
