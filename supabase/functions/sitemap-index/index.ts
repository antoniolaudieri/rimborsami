const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = "https://rimborsami.lovable.app";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const today = new Date().toISOString();

    // Generate sitemap index XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap-news</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

    console.log("Generated sitemap index");

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap index error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://rimborsami.lovable.app/sitemap.xml</loc>
  </sitemap>
</sitemapindex>`,
      { headers: corsHeaders }
    );
  }
});
