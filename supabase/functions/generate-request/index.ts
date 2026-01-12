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
  airline?: string;
  seller_name?: string;
  operator_name?: string;
  supplier_name?: string;
  company_name?: string;
  [key: string]: unknown;
}

interface CompanyContact {
  name: string;
  category: string;
  email_reclami: string | null;
  pec_reclami: string | null;
  indirizzo_sede_legale: string | null;
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
        opportunity_id,
        opportunity:opportunities (
          title,
          category,
          template_email,
          template_pec,
          template_form,
          legal_reference,
          source_url
        )
      `)
      .eq("id", user_opportunity_id)
      .eq("user_id", user.id)
      .single();

    if (oppError || !userOpp) {
      console.error("Error fetching user opportunity:", oppError);
      throw new Error("User opportunity not found or access denied");
    }

    // FIXED: opportunity is an object, not an array when using .single()
    const opportunityData = userOpp.opportunity;
    const opportunity: OpportunityData = Array.isArray(opportunityData) 
      ? (opportunityData[0] || {} as OpportunityData)
      : (opportunityData as unknown as OpportunityData || {} as OpportunityData);
    const matchedData = (userOpp.matched_data || {}) as MatchedData;
    const userData: UserData = {
      full_name: profile.full_name || "Nome Cognome",
      email: profile.email || user.email || "",
      phone: profile.phone || "",
    };

    console.log(`Processing opportunity: ${opportunity.title}, category: ${opportunity.category}`);

    // Get the company name from matched_data based on category
    let companyName = getCompanyNameFromMatchedData(opportunity.category, matchedData);
    console.log(`Looking up company contact for: ${companyName} in category ${opportunity.category}`);

    // For class actions, look up the organizer from class_actions table
    let companyContact: CompanyContact | null = null;
    let classActionInfo: { organizer: string; adhesion_url: string | null; source_url: string | null } | null = null;

    if (opportunity.category === "class_action") {
      // Fetch class action details
      const { data: classAction } = await supabaseClient
        .from("class_actions")
        .select("organizer, adhesion_url, source_url")
        .eq("opportunity_id", userOpp.opportunity_id)
        .maybeSingle();

      if (classAction) {
        classActionInfo = classAction;
        companyName = classAction.organizer; // Use organizer as company name
        console.log(`Found class action organizer: ${classAction.organizer}`);
      }

      // Look up organizer contact in company_contacts
      if (companyName) {
        const { data: contact } = await supabaseClient
          .from("company_contacts")
          .select("name, category, email_reclami, pec_reclami, indirizzo_sede_legale")
          .ilike("name", `%${companyName}%`)
          .maybeSingle();

        if (contact) {
          companyContact = contact as CompanyContact;
          console.log(`Found organizer contact: ${JSON.stringify(companyContact)}`);
        }
      }
    } else if (companyName) {
      // Standard lookup for other categories - try exact match first, then fuzzy
      let contact: CompanyContact | null = null;
      
      // Try exact match first
      const { data: exactMatch } = await supabaseClient
        .from("company_contacts")
        .select("name, category, email_reclami, pec_reclami, indirizzo_sede_legale")
        .eq("category", opportunity.category)
        .eq("name", companyName)
        .maybeSingle();
      
      if (exactMatch) {
        contact = exactMatch as CompanyContact;
      } else {
        // Try fuzzy match with ilike
        const { data: fuzzyMatch } = await supabaseClient
          .from("company_contacts")
          .select("name, category, email_reclami, pec_reclami, indirizzo_sede_legale")
          .eq("category", opportunity.category)
          .ilike("name", `%${companyName}%`)
          .limit(1)
          .maybeSingle();
        
        if (fuzzyMatch) {
          contact = fuzzyMatch as CompanyContact;
        }
      }

      if (contact) {
        companyContact = contact;
        console.log(`Found company contact: ${JSON.stringify(companyContact)}`);
      } else {
        console.log(`No company contact found for ${companyName} in ${opportunity.category}`);
      }
    }

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
      request_type,
      companyContact,
      classActionInfo
    );

    // Determine the real recipient based on request_type and company contact
    let finalRecipient = generatedContent.recipient;
    if (companyContact) {
      if (request_type === "pec" && companyContact.pec_reclami) {
        finalRecipient = companyContact.pec_reclami;
      } else if (request_type === "email" && companyContact.email_reclami) {
        finalRecipient = companyContact.email_reclami;
      } else if (companyContact.email_reclami) {
        // Fallback to email if pec not available
        finalRecipient = companyContact.email_reclami;
      }
    }

    console.log(`Final recipient: ${finalRecipient}`);

    // Save the generated request
    const { data: savedRequest, error: saveError } = await supabaseClient
      .from("generated_requests")
      .insert({
        user_opportunity_id,
        type: request_type,
        content: generatedContent.content,
        subject: generatedContent.subject,
        recipient: finalRecipient,
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

function getCompanyNameFromMatchedData(category: string, matchedData: MatchedData): string | null {
  switch (category) {
    case "bank":
      return matchedData.bank_name || null;
    case "flight":
      return matchedData.airline || null;
    case "ecommerce":
      return matchedData.seller_name || null;
    case "insurance":
      return matchedData.insurance_company || null;
    case "telecom":
      return matchedData.operator_name || null;
    case "energy":
      return matchedData.supplier_name || null;
    default:
      return matchedData.company_name || null;
  }
}

async function generateWithAI(
  apiKey: string,
  template: string,
  userData: UserData,
  matchedData: MatchedData,
  opportunity: OpportunityData,
  estimatedAmount: number | null,
  requestType: string,
  companyContact: CompanyContact | null,
  classActionInfo?: { organizer: string; adhesion_url: string | null; source_url: string | null } | null
): Promise<{ content: string; subject: string; recipient: string }> {
  
  // Build company contact info for the prompt
  let companyContactInfo = "Non disponibile";
  if (companyContact) {
    companyContactInfo = `
- Nome: ${companyContact.name}
- Email reclami: ${companyContact.email_reclami || 'Non disponibile'}
- PEC reclami: ${companyContact.pec_reclami || 'Non disponibile'}
- Sede legale: ${companyContact.indirizzo_sede_legale || 'Non disponibile'}`;
  }

  // Add class action specific info
  let classActionDetails = "";
  if (classActionInfo) {
    classActionDetails = `
INFORMAZIONI CLASS ACTION:
- Organizzatore: ${classActionInfo.organizer}
- URL adesione: ${classActionInfo.adhesion_url || 'Non disponibile'}
- Fonte: ${classActionInfo.source_url || 'Non disponibile'}`;
  }

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

CONTATTI AZIENDA DESTINATARIA:
${companyContactInfo}
${classActionDetails}
ISTRUZIONI:
1. Sostituisci TUTTI i placeholder con i dati reali
2. Mantieni un tono formale e professionale
3. Includi riferimenti legali appropriati
4. La data odierna è: ${new Date().toLocaleDateString('it-IT')}
5. Genera anche un oggetto/subject appropriato
6. Per il destinatario, usa l'indirizzo ${requestType === 'pec' ? 'PEC' : 'email'} fornito nei contatti azienda se disponibile
7. Se il tipo è PEC, il contenuto deve essere più formale e includere intestazione appropriata

Rispondi SOLO con un JSON nel formato:
{
  "subject": "Oggetto della comunicazione",
  "recipient": "${requestType === 'pec' && companyContact?.pec_reclami ? companyContact.pec_reclami : companyContact?.email_reclami || 'email@destinatario.it'}",
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
        recipient: getRecipientFromContact(requestType, companyContact, opportunity.category),
        content: replaceBasicPlaceholders(template, userData, matchedData, opportunity),
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    // Ensure we use the real contact if available
    parsed.recipient = getRecipientFromContact(requestType, companyContact, opportunity.category) || parsed.recipient;
    
    return parsed;
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to basic template replacement
    return {
      subject: `Richiesta rimborso - ${opportunity.title}`,
      recipient: getRecipientFromContact(requestType, companyContact, opportunity.category),
      content: replaceBasicPlaceholders(template, userData, matchedData, opportunity),
    };
  }
}

function getRecipientFromContact(requestType: string, companyContact: CompanyContact | null, category: string): string {
  if (companyContact) {
    if (requestType === "pec" && companyContact.pec_reclami) {
      return companyContact.pec_reclami;
    }
    if (companyContact.email_reclami) {
      return companyContact.email_reclami;
    }
    // If no specific email, try PEC as fallback
    if (companyContact.pec_reclami) {
      return companyContact.pec_reclami;
    }
  }
  return getDefaultRecipient(category);
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
    telecom: "reclami@operatore.it",
    energy: "reclami@fornitore.it",
    other: "reclami@azienda.it",
  };
  return recipients[category] || "reclami@azienda.it";
}

function getDefaultEmailTemplate(category: string): string {
  const templates: Record<string, string> = {
    flight: `Gentili Signori,

con la presente, il/la sottoscritto/a {{nome}}, richiede formalmente il rimborso/compensazione per il volo {{flight_number}} del {{flight_date}}.

Ai sensi del Regolamento (CE) n. 261/2004, ho diritto a ricevere la compensazione pecuniaria prevista dalla normativa europea.

Dati del volo:
- Numero volo: {{flight_number}}
- Data: {{flight_date}}
- Tratta: {{departure_airport}} - {{arrival_airport}}
- Compagnia: {{airline}}

Allego alla presente la documentazione necessaria.

Resto in attesa di un vostro cortese riscontro entro 30 giorni.

Cordiali saluti,
{{nome}}
{{email}}`,
    ecommerce: `Gentili Signori,

il/la sottoscritto/a {{nome}}, con riferimento all'ordine n. {{order_number}} del {{order_date}}, richiede formalmente il rimborso del prodotto/servizio acquistato.

Dettagli ordine:
- Numero ordine: {{order_number}}
- Data ordine: {{order_date}}
- Prodotto: {{product_name}}
- Importo: €{{amount}}

Ai sensi del Codice del Consumo (D.Lgs. 206/2005), esercito il mio diritto di rimborso.

Resto in attesa di un vostro cortese riscontro entro 14 giorni.

Cordiali saluti,
{{nome}}
{{email}}`,
    bank: `Spett.le {{bank_name}},

il/la sottoscritto/a {{nome}}, titolare del conto corrente presso il Vostro istituto, richiede formalmente la restituzione delle somme illegittimamente addebitate.

Dettagli:
- Tipo problema: {{issue_type}}
- Periodo: dal {{period_start}} al {{period_end}}
- Importo contestato: €{{estimated_amount}}

Tale richiesta è formulata ai sensi della normativa bancaria vigente (TUB - D.Lgs. 385/1993) e del Codice del Consumo.

Resto in attesa di riscontro entro 30 giorni, decorsi i quali mi riservo di adire le vie legali e/o l'Arbitro Bancario Finanziario.

Cordiali saluti,
{{nome}}
{{email}}`,
    insurance: `Spett.le {{insurance_company}},

il/la sottoscritto/a {{nome}}, assicurato con polizza n. {{policy_number}}, richiede formalmente il rimborso/indennizzo per quanto previsto dalle condizioni contrattuali.

Dettagli sinistro:
- Data sinistro: {{claim_date}}
- Tipo polizza: {{policy_type}}
- Importo richiesto: €{{claim_amount}}

Resto in attesa di riscontro entro i termini di legge (45 giorni per RC Auto, 30 giorni per altre polizze).

Cordiali saluti,
{{nome}}
{{email}}`,
    warranty: `Gentili Signori,

il/la sottoscritto/a {{nome}}, avendo acquistato il prodotto {{product_name}} in data {{purchase_date}}, richiede l'intervento in garanzia ai sensi degli artt. 128-135 del Codice del Consumo.

Dettagli:
- Prodotto: {{product_name}}
- Data acquisto: {{purchase_date}}
- Venditore: {{seller_name}}
- Difetto riscontrato: {{issue_description}}

Chiedo pertanto la riparazione o sostituzione del bene, oppure, ove ciò non sia possibile, la riduzione del prezzo o la risoluzione del contratto.

Cordiali saluti,
{{nome}}
{{email}}`,
    telecom: `Spett.le {{operator_name}},

il/la sottoscritto/a {{nome}}, utente del servizio telefonico n. {{phone_number}}, presenta formale reclamo per:

- Tipo problema: {{issue_type}}
- Data problema: {{issue_date}}
- Importo contestato: €{{amount}}

Ai sensi del Codice delle Comunicazioni Elettroniche e della Delibera AGCOM n. 203/18/CONS, chiedo la risoluzione del problema e il rimborso di quanto indebitamente addebitato.

In caso di mancato riscontro entro 45 giorni, procederò con la conciliazione presso il Corecom.

Cordiali saluti,
{{nome}}
{{email}}`,
    energy: `Spett.le {{supplier_name}},

il/la sottoscritto/a {{nome}}, titolare del contratto di fornitura energia, presenta formale reclamo per:

- Tipo problema: {{issue_type}}
- Periodo fatturazione: {{billing_period}}
- Importo contestato: €{{disputed_amount}}
- POD/PDR: {{pod_pdr}}

Ai sensi della normativa ARERA, chiedo la verifica della fatturazione e il rimborso di quanto indebitamente addebitato.

In caso di mancato riscontro entro 30 giorni, procederò con la conciliazione presso lo Sportello del Consumatore.

Cordiali saluti,
{{nome}}
{{email}}`,
    other: `Gentili Signori,

il/la sottoscritto/a {{nome}}, richiede formalmente quanto di mia spettanza secondo la normativa vigente.

Dettagli:
- Data problema: {{issue_date}}
- Descrizione: {{issue_description}}
- Importo: €{{amount}}

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

Oggetto: RICHIESTA FORMALE DI RIMBORSO/COMPENSAZIONE - MESSA IN MORA

Il/La sottoscritto/a {{nome}}, residente in [INDIRIZZO], C.F. [CODICE_FISCALE],

PREMESSO CHE
`;
  
  const pecFooter = `

TUTTO CIÒ PREMESSO

DIFFIDO E METTO IN MORA

codesta Spett.le Società a provvedere entro e non oltre 15 giorni dal ricevimento della presente, al risarcimento/rimborso di quanto dovuto.

In difetto, mi vedrò costretto/a ad adire le vie legali per la tutela dei miei diritti, con aggravio di spese a Vostro carico.

Con riserva di ogni diritto, azione e ragione.

{{nome}}
{{email}}

Allegati:
- Documento d'identità
- Documentazione a supporto`;

  return pecHeader + baseTemplate + pecFooter;
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
