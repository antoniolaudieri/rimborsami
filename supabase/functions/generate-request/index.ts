import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequestBody {
  user_opportunity_id: string;
  request_type: "email" | "pec" | "form";
}

interface UserData {
  full_name: string;
  email: string;
  phone?: string;
}

interface OpportunityData {
  title: string;
  category: string;
  template_email?: string;
  template_pec?: string;
  template_form?: string;
  legal_reference?: string;
}

interface MatchedData {
  flight_number?: string;
  flight_date?: string;
  order_number?: string;
  order_date?: string;
  bank_name?: string;
  insurance_company?: string;
  product_name?: string;
  amount?: number;
  [key: string]: unknown;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    // Create client with user's auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid or expired token");
    }

    const body: GenerateRequestBody = await req.json();
    const { user_opportunity_id, request_type } = body;

    if (!user_opportunity_id || !request_type) {
      throw new Error("Missing required fields: user_opportunity_id, request_type");
    }

    console.log(`Generating ${request_type} request for opportunity ${user_opportunity_id}`);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    // Fetch user_opportunity with opportunity details
    const { data: userOpp, error: oppError } = await supabaseClient
      .from("user_opportunities")
      .select(`
        id,
        matched_data,
        estimated_amount,
        deadline,
        opportunity:opportunities (
          title,
          category,
          template_email,
          template_pec,
          template_form,
          legal_reference
        )
      `)
      .eq("id", user_opportunity_id)
      .eq("user_id", user.id)
      .single();

    if (oppError || !userOpp) {
      console.error("Error fetching user opportunity:", oppError);
      throw new Error("User opportunity not found or access denied");
    }

    const opportunityArray = userOpp.opportunity as OpportunityData[];
    const opportunity = opportunityArray[0] || {} as OpportunityData;
    const matchedData = (userOpp.matched_data || {}) as MatchedData;
    const userData: UserData = {
      full_name: profile.full_name || "Nome Cognome",
      email: profile.email || user.email || "",
      phone: profile.phone || "",
    };

    // Select the appropriate template
    let template: string;
    switch (request_type) {
      case "email":
        template = opportunity.template_email || getDefaultEmailTemplate(opportunity.category);
        break;
      case "pec":
        template = opportunity.template_pec || getDefaultPecTemplate(opportunity.category);
        break;
      case "form":
        template = opportunity.template_form || getDefaultFormTemplate(opportunity.category);
        break;
      default:
        throw new Error(`Invalid request type: ${request_type}`);
    }

    // Use AI to personalize the template
    const generatedContent = await generateWithAI(
      lovableApiKey,
      template,
      userData,
      matchedData,
      opportunity,
      userOpp.estimated_amount,
      request_type
    );

    // Save the generated request
    const { data: savedRequest, error: saveError } = await supabaseClient
      .from("generated_requests")
      .insert({
        user_opportunity_id,
        type: request_type,
        content: generatedContent.content,
        subject: generatedContent.subject,
        recipient: generatedContent.recipient,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving generated request:", saveError);
      throw new Error("Failed to save generated request");
    }

    console.log(`Successfully generated ${request_type} request:`, savedRequest.id);

    return new Response(
      JSON.stringify({
        success: true,
        request: savedRequest,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in generate-request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateWithAI(
  apiKey: string,
  template: string,
  userData: UserData,
  matchedData: MatchedData,
  opportunity: OpportunityData,
  estimatedAmount: number | null,
  requestType: string
): Promise<{ content: string; subject: string; recipient: string }> {
  const prompt = `Sei un assistente legale italiano specializzato in richieste di rimborso e compensazione.
Genera una ${requestType === 'pec' ? 'PEC formale' : requestType === 'email' ? 'email' : 'richiesta formale'} basata sul seguente template e dati.

TEMPLATE DI BASE:
${template}

DATI UTENTE:
- Nome completo: ${userData.full_name}
- Email: ${userData.email}
- Telefono: ${userData.phone || 'Non fornito'}

DATI OPPORTUNITÀ:
- Titolo: ${opportunity.title}
- Categoria: ${opportunity.category}
- Riferimento legale: ${opportunity.legal_reference || 'Non specificato'}
- Importo stimato: ${estimatedAmount ? `€${estimatedAmount}` : 'Da determinare'}

DATI SPECIFICI DEL CASO:
${JSON.stringify(matchedData, null, 2)}

ISTRUZIONI:
1. Sostituisci TUTTI i placeholder con i dati reali
2. Mantieni un tono formale e professionale
3. Includi riferimenti legali appropriati
4. La data odierna è: ${new Date().toLocaleDateString('it-IT')}
5. Genera anche un oggetto/subject appropriato
6. Indica il destinatario appropriato basandoti sulla categoria

Rispondi SOLO con un JSON nel formato:
{
  "subject": "Oggetto della comunicazione",
  "recipient": "Destinatario (es: ufficio.reclami@compagnia.it)",
  "content": "Contenuto completo della comunicazione"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: use the template with basic replacements
      return {
        subject: `Richiesta rimborso - ${opportunity.title}`,
        recipient: getDefaultRecipient(opportunity.category),
        content: replaceBasicPlaceholders(template, userData, matchedData, opportunity),
      };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to basic template replacement
    return {
      subject: `Richiesta rimborso - ${opportunity.title}`,
      recipient: getDefaultRecipient(opportunity.category),
      content: replaceBasicPlaceholders(template, userData, matchedData, opportunity),
    };
  }
}

function replaceBasicPlaceholders(
  template: string,
  userData: UserData,
  matchedData: MatchedData,
  opportunity: OpportunityData
): string {
  let content = template;
  
  // Replace user data
  content = content.replace(/\{\{nome\}\}/gi, userData.full_name);
  content = content.replace(/\{\{email\}\}/gi, userData.email);
  content = content.replace(/\{\{telefono\}\}/gi, userData.phone || "");
  content = content.replace(/\{\{data_odierna\}\}/gi, new Date().toLocaleDateString("it-IT"));
  
  // Replace matched data
  Object.entries(matchedData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    content = content.replace(regex, String(value || ""));
  });
  
  // Replace opportunity data
  content = content.replace(/\{\{titolo\}\}/gi, opportunity.title);
  content = content.replace(/\{\{categoria\}\}/gi, opportunity.category);
  content = content.replace(/\{\{riferimento_legale\}\}/gi, opportunity.legal_reference || "");
  
  return content;
}

function getDefaultRecipient(category: string): string {
  const recipients: Record<string, string> = {
    flight: "reclami@compagniaaerea.it",
    ecommerce: "assistenza@venditore.it",
    bank: "reclami@banca.it",
    insurance: "reclami@assicurazione.it",
    warranty: "assistenza@produttore.it",
    other: "reclami@azienda.it",
  };
  return recipients[category] || "reclami@azienda.it";
}

function getDefaultEmailTemplate(category: string): string {
  const templates: Record<string, string> = {
    flight: `Gentili Signori,

con la presente, il/la sottoscritto/a {{nome}}, richiede formalmente il rimborso/compensazione per il volo {{flight_number}} del {{flight_date}}.

Ai sensi del Regolamento (CE) n. 261/2004, ho diritto a ricevere la compensazione pecuniaria prevista dalla normativa europea.

Allego alla presente la documentazione necessaria.

Cordiali saluti,
{{nome}}
{{email}}`,
    ecommerce: `Gentili Signori,

il/la sottoscritto/a {{nome}}, con riferimento all'ordine n. {{order_number}} del {{order_date}}, richiede formalmente il rimborso del prodotto/servizio acquistato.

Ai sensi del Codice del Consumo (D.Lgs. 206/2005), esercito il mio diritto di recesso/rimborso.

Resto in attesa di un vostro cortese riscontro.

Cordiali saluti,
{{nome}}
{{email}}`,
    bank: `Spett.le {{bank_name}},

il/la sottoscritto/a {{nome}}, titolare del conto corrente presso il Vostro istituto, richiede formalmente la restituzione delle commissioni/spese illegittimamente addebitate.

Tale richiesta è formulata ai sensi della normativa bancaria vigente.

Cordiali saluti,
{{nome}}
{{email}}`,
    insurance: `Spett.le {{insurance_company}},

il/la sottoscritto/a {{nome}}, assicurato con polizza n. [NUMERO_POLIZZA], richiede formalmente il rimborso/indennizzo per quanto previsto dalle condizioni contrattuali.

Resto in attesa di riscontro entro i termini di legge.

Cordiali saluti,
{{nome}}
{{email}}`,
    warranty: `Gentili Signori,

il/la sottoscritto/a {{nome}}, avendo acquistato il prodotto {{product_name}}, richiede l'intervento in garanzia ai sensi degli artt. 128-135 del Codice del Consumo.

Resto in attesa di un vostro cortese riscontro.

Cordiali saluti,
{{nome}}
{{email}}`,
    other: `Gentili Signori,

il/la sottoscritto/a {{nome}}, richiede formalmente quanto di mia spettanza secondo la normativa vigente.

Resto in attesa di un vostro cortese riscontro.

Cordiali saluti,
{{nome}}
{{email}}`,
  };
  return templates[category] || templates.other;
}

function getDefaultPecTemplate(category: string): string {
  const baseTemplate = getDefaultEmailTemplate(category);
  const pecHeader = `RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: Richiesta formale di rimborso/compensazione

`;
  return pecHeader + baseTemplate;
}

function getDefaultFormTemplate(category: string): string {
  return `MODULO DI RICHIESTA RIMBORSO

Data compilazione: {{data_odierna}}

DATI DEL RICHIEDENTE
Nome e Cognome: {{nome}}
Email: {{email}}
Telefono: {{telefono}}

DETTAGLI RICHIESTA
Categoria: ${category}
Importo richiesto: €______

MOTIVAZIONE
[Descrizione del motivo della richiesta]

DOCUMENTAZIONE ALLEGATA
☐ Documento d'identità
☐ Ricevuta/Fattura
☐ Altro: _______

Firma: ______________________
Data: {{data_odierna}}`;
}
