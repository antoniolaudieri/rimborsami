import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleData {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  category: string;
  articleId?: string;
}


async function postToLinkedIn(data: ArticleData): Promise<{ success: boolean; postId?: string; error?: string }> {
  const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  const personId = Deno.env.get("LINKEDIN_PERSON_ID");

  if (!accessToken || !personId) {
    throw new Error("LinkedIn credentials not configured (need LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID)");
  }

  console.log("Posting as person ID:", personId);

  // Build hashtags from category
  const categoryHashtags: Record<string, string[]> = {
    voli: ["rimborsi", "voli", "dirittideipasseggeri", "viaggi"],
    banche: ["banche", "finanza", "rimborsi", "consumatori"],
    ecommerce: ["ecommerce", "acquistionline", "consumatori", "rimborsi"],
    energia: ["energia", "bollette", "consumatori", "risparmio"],
    telecom: ["telefonia", "telecomunicazioni", "consumatori", "rimborsi"],
    assicurazioni: ["assicurazioni", "rimborsi", "diritti", "consumatori"],
    classaction: ["classaction", "diritti", "consumatori", "giustizia"],
    default: ["rimborsi", "diritti", "consumatori", "italia"]
  };

  const hashtags = categoryHashtags[data.category.toLowerCase()] || categoryHashtags.default;
  const hashtagString = hashtags.map(h => `#${h}`).join(" ");

  // LinkedIn API v2 - Create a share as personal profile
  const postBody: any = {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: `${data.title}\n\n${data.excerpt}\n\nScopri come far valere i tuoi diritti 👇\n\n${hashtagString}`
        },
        shareMediaCategory: data.imageUrl ? "ARTICLE" : "NONE",
        ...(data.imageUrl && {
          media: [{
            status: "READY",
            originalUrl: data.url,
            title: {
              text: data.title
            },
            description: {
              text: data.excerpt.substring(0, 200)
            }
          }]
        })
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  console.log("Posting to LinkedIn:", JSON.stringify(postBody, null, 2));

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify(postBody)
  });

  const responseText = await response.text();
  console.log("LinkedIn API response:", response.status, responseText);

  if (!response.ok) {
    // Try to parse error
    try {
      const errorData = JSON.parse(responseText);
      return { 
        success: false, 
        error: errorData.message || `LinkedIn API error: ${response.status}` 
      };
    } catch {
      return { 
        success: false, 
        error: `LinkedIn API error: ${response.status} - ${responseText}` 
      };
    }
  }

  // Extract post ID from response
  try {
    const result = JSON.parse(responseText);
    return { 
      success: true, 
      postId: result.id 
    };
  } catch {
    return { 
      success: true, 
      postId: response.headers.get("x-restli-id") || undefined 
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: ArticleData = await req.json();
    console.log("Received article data:", data);

    // Validate required fields
    if (!data.title || !data.excerpt || !data.url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, excerpt, url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(data);
    console.log("LinkedIn post result:", result);

    // Log the social post attempt
    if (data.articleId) {
      await supabase.from("social_posts").insert({
        article_id: data.articleId,
        platform: "linkedin",
        post_id: result.postId || null,
        status: result.success ? "posted" : "failed",
        error_message: result.error || null,
        posted_at: result.success ? new Date().toISOString() : null
      });
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: result.postId,
        message: "Article posted to LinkedIn successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error posting to LinkedIn:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
