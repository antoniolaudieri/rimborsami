import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizAnswers {
  flights?: string;
  ecommerce?: string;
  returns?: string;
  bank?: string;
  cards?: string;
  insurance?: string;
  claims?: string;
  electronics?: string;
  defects?: string;
  telecom?: string;
  energy?: string;
  transport?: string;
  auto?: string;
  tech_accounts?: string;
  class_actions?: string;
  [key: string]: string | undefined;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid or expired token");
    }

    const { quiz_answers } = await req.json() as { quiz_answers: QuizAnswers };

    if (!quiz_answers) {
      throw new Error("Missing quiz_answers");
    }

    console.log(`Matching opportunities for user ${user.id} with answers:`, quiz_answers);

    // Fetch all active opportunities
    const { data: opportunities, error: oppError } = await supabaseClient
      .from("opportunities")
      .select("*")
      .eq("active", true);

    if (oppError) {
      console.error("Error fetching opportunities:", oppError);
      throw new Error("Failed to fetch opportunities");
    }

    // Check for existing user opportunities to avoid duplicates
    const { data: existingOps, error: existingError } = await supabaseClient
      .from("user_opportunities")
      .select("opportunity_id")
      .eq("user_id", user.id);

    if (existingError) {
      console.error("Error fetching existing opportunities:", existingError);
    }

    const existingOpIds = new Set((existingOps || []).map(o => o.opportunity_id));

    // Match opportunities based on quiz answers
    const matchedOps = [];

    for (const opp of opportunities || []) {
      // Skip if user already has this opportunity
      if (existingOpIds.has(opp.id)) {
        continue;
      }

      let shouldMatch = false;
      let estimatedAmount = Math.floor(((opp.min_amount || 0) + (opp.max_amount || 0)) / 2);
      let matchReason = "";

      switch (opp.category) {
        case "flight":
          if (quiz_answers.flights && quiz_answers.flights !== "no") {
            shouldMatch = true;
            estimatedAmount = quiz_answers.flights === "multiple" ? 600 : 400;
            matchReason = "Hai indicato problemi con voli";
          }
          break;

        case "ecommerce":
          if (
            (quiz_answers.ecommerce && quiz_answers.ecommerce !== "never") ||
            (quiz_answers.returns && quiz_answers.returns !== "no")
          ) {
            shouldMatch = true;
            matchReason = "Acquisti frequenti online";
          }
          break;

        case "bank":
          if (
            (quiz_answers.bank && quiz_answers.bank !== "no") ||
            (quiz_answers.cards && quiz_answers.cards !== "none")
          ) {
            shouldMatch = true;
            matchReason = "Utilizzi servizi bancari";
          }
          break;

        case "insurance":
          if (
            (quiz_answers.insurance && quiz_answers.insurance !== "no") ||
            (quiz_answers.claims && quiz_answers.claims !== "no")
          ) {
            shouldMatch = true;
            if (quiz_answers.claims === "multiple") {
              estimatedAmount = 500;
            }
            matchReason = "Hai polizze assicurative";
          }
          break;

        case "warranty":
          if (
            (quiz_answers.electronics && quiz_answers.electronics !== "no") ||
            (quiz_answers.defects && quiz_answers.defects !== "no")
          ) {
            shouldMatch = true;
            matchReason = "Acquisti di elettronica recenti";
          }
          break;

        case "telecom":
          if (quiz_answers.telecom && quiz_answers.telecom !== "no") {
            shouldMatch = true;
            matchReason = "Problemi con operatori telefonici";
          }
          break;

        case "energy":
          if (quiz_answers.energy && quiz_answers.energy !== "no") {
            shouldMatch = true;
            estimatedAmount = quiz_answers.energy === "often" ? 300 : 150;
            matchReason = "Anomalie nelle bollette";
          }
          break;

        case "transport":
          if (quiz_answers.transport && quiz_answers.transport !== "never") {
            shouldMatch = true;
            matchReason = "Uso frequente di trasporti pubblici";
          }
          break;

        case "automotive":
          if (quiz_answers.auto && quiz_answers.auto !== "no") {
            shouldMatch = true;
            matchReason = "Possiedi un'auto recente";
          }
          break;

        case "tech":
          if (quiz_answers.tech_accounts && quiz_answers.tech_accounts !== "no") {
            shouldMatch = true;
            matchReason = "Account su piattaforme tech";
          }
          break;

        case "class_action":
          if (quiz_answers.class_actions && quiz_answers.class_actions !== "no") {
            shouldMatch = true;
            estimatedAmount = quiz_answers.class_actions === "very" ? 500 : 300;
            matchReason = "Interesse per class action";
          }
          break;
      }

      if (shouldMatch) {
        matchedOps.push({
          user_id: user.id,
          opportunity_id: opp.id,
          status: "found",
          estimated_amount: estimatedAmount,
          matched_data: {
            quiz_answers,
            match_reason: matchReason,
            matched_at: new Date().toISOString(),
          },
        });
      }
    }

    console.log(`Found ${matchedOps.length} matching opportunities`);

    // Insert matched opportunities
    if (matchedOps.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("user_opportunities")
        .insert(matchedOps);

      if (insertError) {
        console.error("Error inserting user opportunities:", insertError);
        throw new Error("Failed to create user opportunities");
      }

      // Create notification for user
      await supabaseClient.from("notifications").insert({
        user_id: user.id,
        type: "new_opportunity",
        title: `${matchedOps.length} nuove opportunità trovate!`,
        message: `Abbiamo trovato ${matchedOps.length} potenziali rimborsi per te basati sul tuo profilo.`,
        action_url: "/dashboard/opportunities",
      });
    }

    // Update user profile with quiz completion
    await supabaseClient
      .from("profiles")
      .update({
        quiz_answers,
        onboarding_completed: true,
        estimated_total_recovery: matchedOps.reduce((sum, o) => sum + o.estimated_amount, 0),
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        matched_count: matchedOps.length,
        estimated_total: matchedOps.reduce((sum, o) => sum + o.estimated_amount, 0),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in match-opportunities:", error);
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
