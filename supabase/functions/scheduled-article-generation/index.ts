import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting scheduled article generation v2 (multi-agent)...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check how many articles were published today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { count: articlesToday, error: countError } = await supabase
      .from("news_articles")
      .select("*", { count: "exact", head: true })
      .gte("published_at", todayIso);

    if (countError) {
      console.error("Error counting today's articles:", countError);
    }

    console.log(`Articles published today: ${articlesToday || 0}`);

    // Target: 2 articles per day maximum (reduced for quality)
    const targetDaily = 2;
    const remaining = targetDaily - (articlesToday || 0);

    if (remaining <= 0) {
      console.log("Daily article limit reached (2/day). Skipping generation.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Daily limit reached", 
          articlesToday: articlesToday || 0,
          targetDaily,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the new multi-agent generate-article-v2 function
    console.log("Calling generate-article-v2 (multi-agent system)...");
    
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-article-v2`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Category auto-selected by v2
    });

    const result = await generateResponse.json();

    if (!generateResponse.ok || !result.success) {
      console.error("Article generation failed:", result);
      
      // Log failure reason for monitoring
      if (result.reason === "duplicate") {
        console.log("Skipped: duplicate content detected");
      } else if (result.reason === "low_quality") {
        console.log(`Skipped: quality score ${result.score} below threshold`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          reason: result.reason || "generation_failed",
          details: result,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Article generated successfully:", {
      title: result.article?.title,
      slug: result.article?.slug,
      qualityScore: result.article?.qualityScore,
      needsReview: result.article?.needsReview,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Article generated with multi-agent system",
        article: result.article,
        articlesToday: (articlesToday || 0) + 1,
        remainingToday: remaining - 1,
        generationVersion: "v2-multiagent",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduled generation error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
