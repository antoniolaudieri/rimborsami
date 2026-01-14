import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://rimborsami.lovable.app';
const FEED_TITLE = 'Rimborsami Magazine';
const FEED_DESCRIPTION = 'Guide, news e consigli per recuperare i tuoi soldi. Rimborsi voli, bollette, banche e molto altro.';
const FEED_LANGUAGE = 'it-IT';

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRFC822Date(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published articles with author info
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select(`
        slug,
        title,
        excerpt,
        meta_description,
        category,
        published_at,
        updated_at,
        reading_time_minutes,
        featured_image_url,
        keywords,
        news_authors (
          name,
          slug,
          role
        )
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    const now = new Date().toUTCString();
    const lastBuildDate = articles && articles.length > 0 
      ? formatRFC822Date(articles[0].published_at || articles[0].updated_at)
      : now;

    // Build RSS XML
    let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${lastBuildDate}</pubDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Rimborsami Magazine</generator>
    <copyright>© ${new Date().getFullYear()} Rimborsami. Tutti i diritti riservati.</copyright>
    <managingEditor>redazione@rimborsami.it (Redazione Rimborsami)</managingEditor>
    <webMaster>tech@rimborsami.it (Team Tecnico)</webMaster>
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${SITE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <category>Diritti dei Consumatori</category>
    <category>Rimborsi</category>
    <category>Finanza Personale</category>
`;

    // Add items
    if (articles) {
      for (const article of articles) {
        const articleUrl = `${SITE_URL}/news/${article.slug}`;
        const pubDate = formatRFC822Date(article.published_at || article.updated_at);
        const authorData = article.news_authors as unknown as { name: string; slug: string; role: string } | null;
        const authorName = authorData ? authorData.name : 'Redazione Rimborsami';
        const authorSlug = authorData ? authorData.slug : null;
        
        // Category mapping for RSS
        const categoryMap: Record<string, string> = {
          'voli': 'Rimborsi Voli',
          'energia': 'Energia e Bollette',
          'banche': 'Banche e Finanza',
          'telecomunicazioni': 'Telecomunicazioni',
          'ecommerce': 'E-commerce',
          'class-action': 'Class Action',
          'trasporti': 'Trasporti',
          'assicurazioni': 'Assicurazioni',
          'guide': 'Guide Pratiche',
          'news': 'News'
        };
        const categoryLabel = categoryMap[article.category] || article.category;

        rssXml += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.meta_description || article.excerpt)}</description>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
      <category>${escapeXml(categoryLabel)}</category>`;

        // Add featured image if available
        if (article.featured_image_url) {
          rssXml += `
      <media:content url="${escapeXml(article.featured_image_url)}" medium="image"/>
      <enclosure url="${escapeXml(article.featured_image_url)}" type="image/jpeg"/>`;
        }

        // Add keywords as additional categories
        if (article.keywords && article.keywords.length > 0) {
          for (const keyword of article.keywords.slice(0, 5)) {
            rssXml += `
      <category>${escapeXml(keyword)}</category>`;
          }
        }

        // Add reading time as custom element
        if (article.reading_time_minutes) {
          rssXml += `
      <dc:format>Tempo di lettura: ${article.reading_time_minutes} min</dc:format>`;
        }

        // Add author profile link if available
        if (authorSlug) {
          rssXml += `
      <atom:author>
        <atom:name>${escapeXml(authorName)}</atom:name>
        <atom:uri>${SITE_URL}/news/autore/${authorSlug}</atom:uri>
      </atom:author>`;
        }

        rssXml += `
    </item>`;
      }
    }

    rssXml += `
  </channel>
</rss>`;

    console.log(`RSS feed generated with ${articles?.length || 0} articles`);

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('RSS feed generation error:', error);
    
    // Return minimal valid RSS on error
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rimborsami Magazine</title>
    <link>${SITE_URL}</link>
    <description>Feed temporaneamente non disponibile</description>
  </channel>
</rss>`;

    return new Response(errorRss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  }
});
