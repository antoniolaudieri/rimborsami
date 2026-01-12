import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email provider configurations
const PROVIDERS: Record<string, { server: string; port: number; instructions: string }> = {
  gmail: {
    server: "imap.gmail.com",
    port: 993,
    instructions: "Vai su myaccount.google.com → Sicurezza → Password per le app",
  },
  outlook: {
    server: "outlook.office365.com",
    port: 993,
    instructions: "Abilita IMAP in Impostazioni → Posta → Sincronizza email",
  },
  libero: {
    server: "imapmail.libero.it",
    port: 993,
    instructions: "Usa la tua password normale",
  },
  aruba: {
    server: "imaps.pec.aruba.it",
    port: 993,
    instructions: "Usa la password della PEC",
  },
  yahoo: {
    server: "imap.mail.yahoo.com",
    port: 993,
    instructions: "Genera password app in Sicurezza account",
  },
};

// Simple encryption using base64 + XOR (in production, use proper encryption)
function encryptPassword(password: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "default-key";
  let encrypted = "";
  for (let i = 0; i < password.length; i++) {
    encrypted += String.fromCharCode(password.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encrypted);
}

function decryptPassword(encrypted: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "default-key";
  const decoded = atob(encrypted);
  let decrypted = "";
  for (let i = 0; i < decoded.length; i++) {
    decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return decrypted;
}

// Test IMAP connection using Deno's TLS
async function testImapConnection(
  server: string,
  port: number,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Testing IMAP connection to ${server}:${port} for ${email}`);
    
    // Connect to IMAP server via TLS
    const conn = await Deno.connectTls({
      hostname: server,
      port: port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const buffer = new Uint8Array(4096);

    // Read greeting
    const greetingBytes = await conn.read(buffer);
    if (greetingBytes === null) {
      conn.close();
      return { success: false, error: "Nessuna risposta dal server" };
    }
    const greeting = decoder.decode(buffer.subarray(0, greetingBytes));
    console.log("IMAP Greeting:", greeting.trim());

    if (!greeting.includes("OK")) {
      conn.close();
      return { success: false, error: "Server IMAP non disponibile" };
    }

    // Send LOGIN command
    const loginCmd = `A001 LOGIN "${email}" "${password}"\r\n`;
    await conn.write(encoder.encode(loginCmd));

    // Read login response
    const loginBytes = await conn.read(buffer);
    if (loginBytes === null) {
      conn.close();
      return { success: false, error: "Nessuna risposta al login" };
    }
    const loginResponse = decoder.decode(buffer.subarray(0, loginBytes));
    console.log("Login response:", loginResponse.trim());

    // Send LOGOUT
    await conn.write(encoder.encode("A002 LOGOUT\r\n"));
    conn.close();

    if (loginResponse.includes("A001 OK")) {
      return { success: true };
    } else if (loginResponse.includes("AUTHENTICATIONFAILED") || loginResponse.includes("Invalid credentials")) {
      return { success: false, error: "Credenziali non valide. Verifica email e password." };
    } else if (loginResponse.includes("NO")) {
      return { success: false, error: "Autenticazione fallita. Per Gmail, usa una password per le app." };
    } else {
      return { success: false, error: "Errore di autenticazione sconosciuto" };
    }
  } catch (error) {
    console.error("IMAP connection error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("connection refused")) {
      return { success: false, error: "Impossibile connettersi al server IMAP" };
    }
    if (errMsg.includes("tls")) {
      return { success: false, error: "Errore di connessione sicura (TLS)" };
    }
    return { success: false, error: `Errore di connessione: ${errMsg}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token non valido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "get-providers") {
      return new Response(JSON.stringify({ providers: PROVIDERS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test-connection") {
      const { provider, email, password, customServer, customPort } = body;
      
      const providerConfig = PROVIDERS[provider];
      const server = customServer || providerConfig?.server;
      const port = customPort || providerConfig?.port || 993;

      if (!server) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Configurazione server IMAP mancante" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await testImapConnection(server, port, email, password);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "connect") {
      const { provider, email, password, customServer, customPort } = body;
      
      const providerConfig = PROVIDERS[provider];
      const server = customServer || providerConfig?.server;
      const port = customPort || providerConfig?.port || 993;

      if (!server || !email || !password) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Dati mancanti" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Test connection first
      const testResult = await testImapConnection(server, port, email, password);
      if (!testResult.success) {
        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if connection already exists
      const { data: existing } = await supabase
        .from("email_connections")
        .select("id")
        .eq("user_id", user.id)
        .eq("email_address", email)
        .maybeSingle();

      if (existing) {
        // Update existing connection
        const { error: updateError } = await supabase
          .from("email_connections")
          .update({
            provider,
            imap_server: server,
            imap_port: port,
            encrypted_password: encryptPassword(password),
            status: "connected",
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Update error:", updateError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Errore durante l'aggiornamento" 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Connessione aggiornata",
          connectionId: existing.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create new connection
      const { data: newConnection, error: insertError } = await supabase
        .from("email_connections")
        .insert({
          user_id: user.id,
          provider,
          email_address: email,
          imap_server: server,
          imap_port: port,
          encrypted_password: encryptPassword(password),
          status: "connected",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Errore durante il salvataggio" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email collegata con successo",
        connectionId: newConnection.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      const { connectionId } = body;

      const { error: deleteError } = await supabase
        .from("email_connections")
        .delete()
        .eq("id", connectionId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Errore durante la disconnessione" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email scollegata" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: connections, error: listError } = await supabase
        .from("email_connections")
        .select("id, provider, email_address, status, last_sync_at, emails_scanned, opportunities_found, error_message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (listError) {
        console.error("List error:", listError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Errore durante il recupero delle connessioni" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        connections 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Azione non valida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
