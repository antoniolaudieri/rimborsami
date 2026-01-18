import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const categoryLabels: Record<string, string> = {
  flight: "voli",
  ecommerce: "ecommerce",
  bank: "banche",
  insurance: "assicurazioni",
  warranty: "garanzie",
  telecom: "telefonia",
  energy: "energia",
  transport: "trasporti",
  automotive: "auto",
  tech: "tecnologia",
  class_action: "class-action",
  other: "altro",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active opportunities
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("id, title, category, updated_at, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching opportunities:", error);
      throw error;
    }

    const baseUrl = "https://rimborsami.app";

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Opportunities Index Page -->
  <url>
    <loc>${baseUrl}/opportunita</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${opportunities?.map((opp) => {
    const lastMod = opp.updated_at || opp.created_at;
    const categorySlug = categoryLabels[opp.category] || opp.category;
    
    return `
  <url>
    <loc>${baseUrl}/opportunita/${categorySlug}/${opp.id}</loc>
    <lastmod>${lastMod ? new Date(lastMod).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("") || ""}
</urlset>`;

    console.log(`Generated opportunities sitemap with ${opportunities?.length || 0} opportunities`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Opportunities sitemap error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rimborsami.app/opportunita</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
