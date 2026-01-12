import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Mail, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Loader2,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface EmailConnectionCardProps {
  connection: EmailConnection;
  onRefresh: () => void;
}

const PROVIDER_ICONS: Record<string, string> = {
  gmail: "📧",
  outlook: "📬",
  libero: "📩",
  aruba: "📨",
  yahoo: "📪",
  altro: "✉️",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  connected: { label: "Connesso", variant: "default", icon: CheckCircle2 },
  syncing: { label: "Sincronizzazione...", variant: "secondary", icon: RefreshCw },
  error: { label: "Errore", variant: "destructive", icon: AlertCircle },
  credentials_expired: { label: "Credenziali scadute", variant: "destructive", icon: AlertCircle },
};

export function EmailConnectionCard({ connection, onRefresh }: EmailConnectionCardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = STATUS_CONFIG[connection.status] || STATUS_CONFIG.connected;
  const StatusIcon = statusConfig.icon;

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Non autenticato");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            connectionId: connection.id,
            daysBack: 90,
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.error || "Errore durante la scansione");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Errore durante la scansione");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Non autenticato");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-emails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            connectionId: connection.id,
            limit: 50,
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.error || "Errore durante l'analisi");
      }
    } catch (error) {
      console.error("Analyze error:", error);
      toast.error("Errore durante l'analisi");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Non autenticato");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connect-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            action: "disconnect",
            connectionId: connection.id,
          }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success("Email scollegata");
        onRefresh();
      } else {
        toast.error(result.error || "Errore durante la disconnessione");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Errore durante la disconnessione");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {PROVIDER_ICONS[connection.provider] || "✉️"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{connection.email_address}</h4>
                <Badge variant={statusConfig.variant} className="text-xs">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              {connection.error_message && (
                <p className="text-xs text-destructive mt-1">{connection.error_message}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {connection.last_sync_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Ultimo sync: {formatDistanceToNow(new Date(connection.last_sync_at), { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {connection.emails_scanned} email
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {connection.opportunities_found} opportunità
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScan}
            disabled={isScanning || connection.status === "syncing"}
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Scansiona
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyze}
            disabled={isAnalyzing || connection.emails_scanned === 0}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Analizza con AI
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Scollegare questa email?</AlertDialogTitle>
                <AlertDialogDescription>
                  Verranno eliminate tutte le email scansionate associate a {connection.email_address}. 
                  Le opportunità già create rimarranno nel tuo account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect} disabled={isDeleting}>
                  {isDeleting ? "Eliminazione..." : "Scollega"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
