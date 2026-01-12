import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Plus, Shield, Eye, Lock, Loader2 } from "lucide-react";
import { ConnectEmailForm } from "@/components/email-scanner/ConnectEmailForm";
import { EmailConnectionCard } from "@/components/email-scanner/EmailConnectionCard";
import { supabase } from "@/integrations/supabase/client";

interface EmailConnection {
  id: string;
  provider: string;
  email_address: string;
  status: string;
  last_sync_at: string | null;
  emails_scanned: number;
  opportunities_found: number;
  error_message: string | null;
  created_at: string;
}

export default function DashboardEmailScanner() {
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchConnections = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connect-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ action: "list" }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setConnections(result.connections || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnectionSuccess = () => {
    setIsDialogOpen(false);
    fetchConnections();
  };

  const totalEmails = connections.reduce((sum, c) => sum + c.emails_scanned, 0);
  const totalOpportunities = connections.reduce((sum, c) => sum + c.opportunities_found, 0);

  return (
    <div className="space-y-6">
      {/* Header - mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Scanner Email</h1>
          <p className="text-sm text-muted-foreground">
            Collega le tue email per trovare opportunità di rimborso
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Collega Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Collega una casella email</DialogTitle>
              <DialogDescription>
                Analizzeremo le tue email in sola lettura per trovare rimborsi nascosti
              </DialogDescription>
            </DialogHeader>
            <ConnectEmailForm 
              onSuccess={handleConnectionSuccess} 
              onCancel={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats - responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{connections.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalEmails}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Scansionate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                <span className="text-lg sm:text-xl">💰</span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalOpportunities}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Opportunità</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security notice - mobile responsive */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary shrink-0" />
        <AlertDescription>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Sicura
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> Solo lettura
            </span>
            <span>🇪🇺 GDPR</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Puoi scollegare le tue email in qualsiasi momento
          </p>
        </AlertDescription>
      </Alert>

      {/* Connections list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna email collegata</h3>
            <p className="text-muted-foreground mb-4">
              Collega la tua email per trovare automaticamente rimborsi nascosti
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Collega la tua prima email
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">Email collegate</h3>
          {connections.map((connection) => (
            <EmailConnectionCard 
              key={connection.id} 
              connection={connection} 
              onRefresh={fetchConnections}
            />
          ))}
        </div>
      )}

      {/* How it works - mobile responsive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Come funziona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary text-sm sm:text-base">1</span>
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Collega</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Inserisci le credenziali
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary text-sm sm:text-base">2</span>
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Scansione</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Cerchiamo le email
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary text-sm sm:text-base">3</span>
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Analisi AI</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Identifichiamo rimborsi
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary text-sm sm:text-base">4</span>
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Recupera</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Generiamo reclami
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
