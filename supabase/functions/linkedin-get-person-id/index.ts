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

    // Try /v2/userinfo first (requires openid scope)
    let response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("userinfo response:", data);
      return new Response(
        JSON.stringify({ 
          source: "userinfo",
          personId: data.sub,
          fullData: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("userinfo failed, trying /v2/me...");

    // Try /v2/me (requires profile scope)
    response = await fetch("https://api.linkedin.com/v2/me", {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("me response:", data);
      return new Response(
        JSON.stringify({ 
          source: "me",
          personId: data.id,
          fullData: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try introspect token
    console.log("me failed, trying introspect...");
    
    const clientId = "77kipv60wj05rm";
    const clientSecret = "WPL_AP1.AvcEZe3J1v697X83.rBvGxw==";
    
    const introspectBody = new URLSearchParams({
      token: accessToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    response = await fetch("https://www.linkedin.com/oauth/v2/introspectToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: introspectBody.toString(),
    });

    const introspectData = await response.json();
    console.log("introspect response:", introspectData);

    return new Response(
      JSON.stringify({ 
        source: "introspect",
        fullData: introspectData,
        personId: introspectData.authorized_user || introspectData.sub || null
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
