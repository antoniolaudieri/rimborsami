import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published news articles
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("slug, updated_at, published_at, category")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }

    const baseUrl = "https://rimborsami.lovable.app";

    // Generate XML sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- News Index Page -->
  <url>
    <loc>${baseUrl}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${articles?.map((article) => {
    const lastMod = article.updated_at || article.published_at;
    const publishDate = article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : '';
    
    return `
  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${lastMod ? new Date(lastMod).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>Rimborsami</news:name>
        <news:language>it</news:language>
      </news:publication>
      <news:publication_date>${publishDate}</news:publication_date>
    </news:news>
  </url>`;
  }).join("") || ""}
</urlset>`;

    console.log(`Generated sitemap with ${articles?.length || 0} articles`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rimborsami.lovable.app/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
