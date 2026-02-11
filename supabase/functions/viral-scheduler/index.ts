import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContentFormat = "tip" | "thread" | "poll" | "dato" | "mito";
type TimeSlot = "morning" | "lunch" | "afternoon" | "evening";

// Map time slots to preferred formats and platforms
const SLOT_CONFIG: Record<TimeSlot, { formats: ContentFormat[]; platforms: string[] }> = {
  morning: {
    formats: ["dato", "tip"],
    platforms: ["linkedin", "twitter"],
  },
  lunch: {
    formats: ["mito", "tip", "dato"],
    platforms: ["facebook", "linkedin"],
  },
  afternoon: {
    formats: ["thread", "mito"],
    platforms: ["twitter", "facebook"],
  },
  evening: {
    formats: ["poll", "dato"],
    platforms: ["facebook", "twitter"],
  },
};

function getCurrentSlot(): TimeSlot {
  const hour = new Date().getUTCHours();
  // Italian time = UTC+1 (winter) or UTC+2 (summer)
  // Approximate: add 1-2 hours
  const italianHour = (hour + 1) % 24;
  
  if (italianHour >= 7 && italianHour < 10) return "morning";
  if (italianHour >= 11 && italianHour < 14) return "lunch";
  if (italianHour >= 16 && italianHour < 18) return "afternoon";
  return "evening";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const slot = getCurrentSlot();
    const config = SLOT_CONFIG[slot];
    
    console.log(`Viral scheduler running for slot: ${slot}`);
    console.log(`Preferred formats: ${config.formats.join(", ")}`);
    console.log(`Target platforms: ${config.platforms.join(", ")}`);

    // Check if we already posted in this slot today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { count: postsToday } = await supabase
      .from("content_reposts")
      .select("*", { count: "exact", head: true })
      .gte("posted_at", todayIso);

    console.log(`Repurposed posts today: ${postsToday || 0}`);

    // Max 8 repurposed posts per day (to avoid spam)
    if ((postsToday || 0) >= 8) {
      console.log("Daily repost limit reached (8). Skipping.");
      return new Response(
        JSON.stringify({ success: true, message: "Daily limit reached", postsToday }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check what formats we already used today to avoid repetition
    const { data: todayReposts } = await supabase
      .from("content_reposts")
      .select("format")
      .gte("posted_at", todayIso);

    const usedFormatsToday = (todayReposts || []).map(r => r.format);
    
    // Pick a format not yet used today, preferring slot-recommended formats
    let selectedFormat: ContentFormat | null = null;
    
    for (const fmt of config.formats) {
      if (!usedFormatsToday.includes(fmt)) {
        selectedFormat = fmt;
        break;
      }
    }
    
    // If all preferred formats used, try any format
    if (!selectedFormat) {
      const allFormats: ContentFormat[] = ["tip", "thread", "poll", "dato", "mito"];
      for (const fmt of allFormats) {
        if (!usedFormatsToday.includes(fmt)) {
          selectedFormat = fmt;
          break;
        }
      }
    }
    
    if (!selectedFormat) {
      // All formats used today, pick least used overall
      selectedFormat = config.formats[0];
      console.log("All formats used today, repeating:", selectedFormat);
    }

    console.log(`Selected format: ${selectedFormat}`);

    // Pick a random platform from slot config
    const selectedPlatform = config.platforms[Math.floor(Math.random() * config.platforms.length)];

    // Call content-repurposer
    console.log(`Calling content-repurposer with format=${selectedFormat}, platform=${selectedPlatform}`);
    
    const repurposeResp = await fetch(`${supabaseUrl}/functions/v1/content-repurposer`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        format: selectedFormat,
        platform: selectedPlatform,
      }),
    });

    const repurposeResult = await repurposeResp.json();
    
    if (!repurposeResp.ok || !repurposeResult.success) {
      console.error("Content repurposer failed:", repurposeResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          slot,
          error: repurposeResult.error || repurposeResult.reason || "repurposer_failed" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Viral scheduler completed successfully:", {
      slot,
      format: selectedFormat,
      platform: selectedPlatform,
      article: repurposeResult.articleTitle,
    });

    return new Response(
      JSON.stringify({
        success: true,
        slot,
        format: selectedFormat,
        platform: selectedPlatform,
        articleTitle: repurposeResult.articleTitle,
        postsToday: (postsToday || 0) + 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Viral scheduler error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
