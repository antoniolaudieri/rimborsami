import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Domains to prioritize for scanning
const PRIORITY_DOMAINS = [
  // Airlines
  "ryanair.com", "easyjet.com", "alitalia.com", "ita-airways.com", "vueling.com", 
  "wizzair.com", "lufthansa.com", "airfrance.com", "klm.com", "britishairways.com",
  "emirates.com", "qatarairways.com", "turkishairlines.com",
  // Trains
  "trenitalia.com", "italotreno.it", "lefrecce.it",
  // E-commerce
  "amazon.it", "amazon.com", "ebay.it", "ebay.com", "zalando.it", "zalando.com",
  "mediaworld.it", "unieuro.it", "euronics.it", "expert.it",
  // Banks
  "unicredit.it", "intesasanpaolo.com", "bancobpm.it", "mps.it", "bnl.it",
  "fineco.it", "n26.com", "revolut.com", "hype.it",
  // Utilities
  "enel.it", "eni.it", "a2a.it", "acea.it", "hera.it", "iren.it",
  "tim.it", "vodafone.it", "windtre.it", "fastweb.it", "iliad.it",
  "sky.it", "dazn.com", "netflix.com", "spotify.com",
  // Insurance
  "generali.it", "allianz.it", "axa.it", "unipol.it", "zurich.it",
  // Booking
  "booking.com", "hotels.com", "expedia.it", "edreams.it", "lastminute.com",
  "airbnb.it", "airbnb.com",
];

// Decrypt password
function decryptPassword(encrypted: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "default-key";
  const decoded = atob(encrypted);
  let decrypted = "";
  for (let i = 0; i < decoded.length; i++) {
    decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return decrypted;
}

// Parse email address to extract domain
function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)/);
  return match ? match[1].toLowerCase() : "";
}

// Parse IMAP response to extract emails
function parseImapEmails(response: string): Array<{
  id: string;
  subject: string;
  from: string;
  date: string;
}> {
  const emails: Array<{ id: string; subject: string; from: string; date: string }> = [];
  
  // Split by message boundaries
  const messages = response.split(/\* \d+ FETCH/);
  
  for (const msg of messages) {
    if (!msg.trim()) continue;
    
    // Extract UID
    const uidMatch = msg.match(/UID (\d+)/);
    const uid = uidMatch ? uidMatch[1] : "";
    
    // Extract Subject
    const subjectMatch = msg.match(/Subject: ([^\r\n]+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : "";
    
    // Extract From
    const fromMatch = msg.match(/From: ([^\r\n]+)/i);
    const from = fromMatch ? fromMatch[1].trim() : "";
    
    // Extract Date
    const dateMatch = msg.match(/Date: ([^\r\n]+)/i);
    const date = dateMatch ? dateMatch[1].trim() : "";
    
    if (uid && (subject || from)) {
      emails.push({ id: uid, subject, from, date });
    }
  }
  
  return emails;
}

// Scan emails via IMAP
async function scanImapEmails(
  server: string,
  port: number,
  email: string,
  password: string,
  daysBack: number = 90
): Promise<{ success: boolean; emails?: any[]; error?: string }> {
  try {
    console.log(`Scanning IMAP ${server}:${port} for ${email}, last ${daysBack} days`);
    
    const conn = await Deno.connectTls({
      hostname: server,
      port: port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const buffer = new Uint8Array(65536); // Larger buffer for email data

    // Helper to send command and get response
    async function sendCommand(cmd: string, tag: string): Promise<string> {
      await conn.write(encoder.encode(`${tag} ${cmd}\r\n`));
      let response = "";
      let complete = false;
      
      while (!complete) {
        const bytes = await conn.read(buffer);
        if (bytes === null) break;
        response += decoder.decode(buffer.subarray(0, bytes));
        // Check if we got a complete response
        if (response.includes(`${tag} OK`) || response.includes(`${tag} NO`) || response.includes(`${tag} BAD`)) {
          complete = true;
        }
      }
      return response;
    }

    // Read greeting
    await conn.read(buffer);

    // Login
    const loginResp = await sendCommand(`LOGIN "${email}" "${password}"`, "A001");
    if (!loginResp.includes("A001 OK")) {
      conn.close();
      return { success: false, error: "Login fallito" };
    }

    // Select INBOX
    const selectResp = await sendCommand("SELECT INBOX", "A002");
    if (!selectResp.includes("A002 OK")) {
      conn.close();
      return { success: false, error: "Impossibile selezionare INBOX" };
    }

    // Calculate date for SINCE filter
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sinceDateStr = `${sinceDate.getDate()}-${months[sinceDate.getMonth()]}-${sinceDate.getFullYear()}`;

    // Search for emails from priority domains
    const domainQueries = PRIORITY_DOMAINS.slice(0, 20).map(d => `FROM "@${d}"`).join(" OR ");
    const searchResp = await sendCommand(`SEARCH SINCE ${sinceDateStr}`, "A003");
    
    // Parse message UIDs from search response
    const uidMatch = searchResp.match(/\* SEARCH ([\d\s]+)/);
    const uids = uidMatch ? uidMatch[1].trim().split(/\s+/).slice(-100) : []; // Last 100 messages
    
    console.log(`Found ${uids.length} messages since ${sinceDateStr}`);

    const emails: any[] = [];
    
    if (uids.length > 0) {
      // Fetch headers for found messages
      const uidRange = uids.join(",");
      const fetchResp = await sendCommand(
        `FETCH ${uidRange} (UID BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`,
        "A004"
      );
      
      const parsedEmails = parseImapEmails(fetchResp);
      
      // Filter by priority domains
      for (const parsed of parsedEmails) {
        const domain = extractDomain(parsed.from);
        const isPriority = PRIORITY_DOMAINS.some(pd => domain.includes(pd));
        
        if (isPriority || parsedEmails.length < 50) {
          emails.push({
            message_id: parsed.id,
            subject: parsed.subject,
            sender: parsed.from,
            sender_domain: domain,
            received_at: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
          });
        }
      }
    }

    // Logout
    await sendCommand("LOGOUT", "A005");
    conn.close();

    console.log(`Filtered to ${emails.length} relevant emails`);
    return { success: true, emails };

  } catch (error) {
    console.error("Scan error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Errore sconosciuto" };
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
    const { connectionId, daysBack = 90 } = body;

    // Get connection details
    const { data: connection, error: connError } = await supabase
      .from("email_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Connessione non trovata" 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to syncing
    await supabase
      .from("email_connections")
      .update({ status: "syncing" })
      .eq("id", connectionId);

    // Scan emails
    const password = decryptPassword(connection.encrypted_password);
    const scanResult = await scanImapEmails(
      connection.imap_server,
      connection.imap_port,
      connection.email_address,
      password,
      daysBack
    );

    if (!scanResult.success) {
      await supabase
        .from("email_connections")
        .update({ 
          status: "error", 
          error_message: scanResult.error 
        })
        .eq("id", connectionId);

      return new Response(JSON.stringify(scanResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save scanned emails (upsert to avoid duplicates)
    let savedCount = 0;
    for (const email of scanResult.emails || []) {
      const { error: insertError } = await supabase
        .from("scanned_emails")
        .upsert({
          user_id: user.id,
          connection_id: connectionId,
          message_id: email.message_id,
          subject: email.subject?.substring(0, 500),
          sender: email.sender?.substring(0, 500),
          sender_domain: email.sender_domain,
          received_at: email.received_at,
          analyzed: false,
        }, {
          onConflict: "connection_id,message_id",
          ignoreDuplicates: true,
        });

      if (!insertError) savedCount++;
    }

    // Update connection stats
    const { data: emailCount } = await supabase
      .from("scanned_emails")
      .select("id", { count: "exact" })
      .eq("connection_id", connectionId);

    await supabase
      .from("email_connections")
      .update({ 
        status: "connected",
        last_sync_at: new Date().toISOString(),
        emails_scanned: emailCount?.length || 0,
        error_message: null,
      })
      .eq("id", connectionId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Scansionate ${savedCount} nuove email`,
      emailsFound: scanResult.emails?.length || 0,
      emailsSaved: savedCount
    }), {
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
