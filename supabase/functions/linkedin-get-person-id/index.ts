const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "LINKEDIN_ACCESS_TOKEN not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching LinkedIn profile...");

    // Try /v2/userinfo (requires openid scope)
    const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    
    const userInfoText = await userInfoResponse.text();
    console.log("userinfo response status:", userInfoResponse.status);
    console.log("userinfo response body:", userInfoText);

    if (userInfoResponse.ok) {
      try {
        const data = JSON.parse(userInfoText);
        return new Response(
          JSON.stringify({ 
            source: "userinfo",
            personId: data.sub,
            fullData: data 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.log("Failed to parse userinfo JSON:", e);
      }
    }

    console.log("userinfo failed, trying /v2/me...");

    // Try /v2/me (requires profile scope)
    const meResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    const meText = await meResponse.text();
    console.log("me response status:", meResponse.status);
    console.log("me response body:", meText);

    if (meResponse.ok) {
      try {
        const data = JSON.parse(meText);
        return new Response(
          JSON.stringify({ 
            source: "me",
            personId: data.id,
            fullData: data 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.log("Failed to parse me JSON:", e);
      }
    }

    // Return what we got for debugging
    return new Response(
      JSON.stringify({ 
        error: "Could not get person ID",
        userInfoStatus: userInfoResponse.status,
        userInfoBody: userInfoText,
        meStatus: meResponse.status,
        meBody: meText
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
