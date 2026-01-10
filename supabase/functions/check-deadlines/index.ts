import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting deadline check...");

    // Get current date and dates for notifications
    const today = new Date();
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find opportunities expiring within 7 days that haven't been notified yet
    // We'll check different urgency levels
    const deadlineRanges = [
      { days: 1, urgency: "urgente", label: "domani" },
      { days: 3, urgency: "alta", label: "tra 3 giorni" },
      { days: 7, urgency: "media", label: "tra 7 giorni" },
    ];

    let totalNotifications = 0;

    for (const range of deadlineRanges) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + range.days);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Find user_opportunities with deadline on this specific date
      // and status not completed or expired
      const { data: expiringOpportunities, error: fetchError } = await supabaseClient
        .from("user_opportunities")
        .select(`
          id,
          user_id,
          deadline,
          estimated_amount,
          status,
          opportunity:opportunities (
            title,
            category
          )
        `)
        .eq("deadline", targetDateStr)
        .not("status", "in", '("completed","expired")');

      if (fetchError) {
        console.error("Error fetching expiring opportunities:", fetchError);
        continue;
      }

      if (!expiringOpportunities || expiringOpportunities.length === 0) {
        console.log(`No opportunities expiring ${range.label}`);
        continue;
      }

      console.log(`Found ${expiringOpportunities.length} opportunities expiring ${range.label}`);

      // Create notifications for each expiring opportunity
      for (const opp of expiringOpportunities) {
        const opportunityArray = opp.opportunity as { title: string; category: string }[];
        const opportunity = opportunityArray[0] || { title: "Opportunità", category: "other" };
        
        // Check if a notification for this deadline already exists
        const { data: existingNotification } = await supabaseClient
          .from("notifications")
          .select("id")
          .eq("user_id", opp.user_id)
          .eq("type", "deadline")
          .ilike("message", `%${opp.id}%`)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (existingNotification) {
          console.log(`Notification already sent for opportunity ${opp.id}`);
          continue;
        }

        // Create notification
        const notificationTitle = range.days === 1 
          ? `⚠️ Scadenza urgente!`
          : `⏰ Scadenza imminente`;

        const notificationMessage = range.days === 1
          ? `La tua opportunità "${opportunity.title}" scade domani! Non perdere ${opp.estimated_amount ? `€${opp.estimated_amount}` : 'questo rimborso'}. [ID: ${opp.id}]`
          : `La tua opportunità "${opportunity.title}" scade ${range.label}. ${opp.estimated_amount ? `Valore stimato: €${opp.estimated_amount}.` : ''} Agisci ora! [ID: ${opp.id}]`;

        const { error: notifyError } = await supabaseClient
          .from("notifications")
          .insert({
            user_id: opp.user_id,
            type: "deadline",
            title: notificationTitle,
            message: notificationMessage,
            action_url: `/dashboard/opportunities/${opp.id}`,
            read: false,
          });

        if (notifyError) {
          console.error(`Error creating notification for ${opp.id}:`, notifyError);
        } else {
          console.log(`Created ${range.urgency} notification for opportunity ${opp.id}`);
          totalNotifications++;
        }
      }
    }

    // Also check for already expired opportunities and update their status
    const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().split("T")[0];
    
    const { data: expiredOpps, error: expiredError } = await supabaseClient
      .from("user_opportunities")
      .update({ status: "expired" })
      .lt("deadline", new Date().toISOString().split("T")[0])
      .not("status", "in", '("completed","expired")')
      .select("id");

    if (expiredError) {
      console.error("Error updating expired opportunities:", expiredError);
    } else if (expiredOpps && expiredOpps.length > 0) {
      console.log(`Marked ${expiredOpps.length} opportunities as expired`);
    }

    console.log(`Deadline check complete. Created ${totalNotifications} notifications.`);

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: totalNotifications,
        checked_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in check-deadlines:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
