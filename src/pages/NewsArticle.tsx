import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsArticle } from '@/hooks/useNewsArticles';
import { NewsCTA } from '@/components/news/NewsCTA';
import { OpportunityCTA } from '@/components/news/OpportunityCTA';
import { RelatedArticles } from '@/components/news/RelatedArticles';
import { ShareDropdown } from '@/components/news/ShareDropdown';
import { AuthorByline } from '@/components/news/AuthorByline';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Clock, Calendar, ChevronLeft, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useMemo } from 'react';

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  ecommerce: 'E-commerce',
  class_action: 'Class Action',
  insurance: 'Assicurazioni',
};

interface FAQItem {
  question: string;
  answer: string;
}

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useNewsArticle(slug || '');

  // Extract FAQ items from content for schema
  const faqItems = useMemo(() => {
    if (!article?.content) return [];
    
    const faqRegex = /<details[^>]*>\s*<summary[^>]*>([^<]+)<\/summary>\s*<p[^>]*>([^<]+)<\/p>\s*<\/details>/gi;
    const items: FAQItem[] = [];
    let match;
    
    while ((match = faqRegex.exec(article.content)) !== null) {
      items.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }
    
    return items;
  }, [article?.content]);

  // Extract HowTo steps if present
  const howToSteps = useMemo(() => {
    if (!article?.content) return [];
    
    const stepRegex = /<li[^>]*>(?:<strong[^>]*>)?(?:Passo|Step)\s*\d+[:\.]?\s*(?:<\/strong>)?([^<]+)/gi;
    const steps: string[] = [];
    let match;
    
    while ((match = stepRegex.exec(article.content)) !== null) {
      steps.push(match[1].trim());
    }
    
    return steps;
  }, [article?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Articolo non trovato</h1>
          <p className="text-muted-foreground mb-8">
            L'articolo che stai cercando non esiste o è stato rimosso.
          </p>
          <Link to="/news">
            <Button>Torna alle News</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedDate = article.published_at 
    ? format(new Date(article.published_at), 'd MMMM yyyy', { locale: it })
    : null;

  const articleUrl = `https://rimborsami.app/news/${article.slug}`;

  // Author info for schema
  const authorForSchema = article.news_authors ? {
    "@type": "Person",
    "name": article.news_authors.name,
    "url": `https://rimborsami.app/news/autore/${article.news_authors.slug}`,
    "jobTitle": article.news_authors.role,
    "worksFor": {
      "@type": "NewsMediaOrganization",
      "name": "Rimborsami Magazine",
      "url": "https://rimborsami.app"
    }
  } : {
    "@type": "Organization",
    "name": "Rimborsami Magazine",
    "url": "https://rimborsami.app"
  };

  // Main Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.meta_description,
    "image": article.featured_image_url || "https://rimborsami.app/og-image.png",
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": authorForSchema,
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Rimborsami Magazine",
      "url": "https://rimborsami.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rimborsami.app/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.keywords?.join(', '),
    "articleSection": categoryLabels[article.category] || article.category,
    "wordCount": article.content?.split(/\s+/).length || 0,
    "inLanguage": "it-IT"
  };

  // FAQ Schema for rich snippets
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // HowTo Schema for step-by-step guides
  const howToSchema = howToSteps.length >= 3 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": article.title,
    "description": article.meta_description,
    "image": article.featured_image_url,
    "step": howToSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": step
    }))
  } : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://rimborsami.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "News",
        "item": "https://rimborsami.app/news"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": categoryLabels[article.category] || article.category,
        "item": `https://rimborsami.app/news?category=${article.category}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": article.title,
        "item": articleUrl
      }
    ]
  };

  // Product Schema when opportunity is linked (for service rich snippets)
  const productSchema = article.opportunities ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Servizio Rimborso: ${article.opportunities.title}`,
    "description": article.opportunities.short_description || article.meta_description,
    "brand": {
      "@type": "Brand",
      "name": "Rimborsami"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "0",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Rimborsami"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }
  } : null;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{article.title} | Rimborsami</title>
        <meta name="title" content={`${article.title} | Rimborsami`} />
        <meta name="description" content={article.meta_description} />
        <meta name="keywords" content={article.keywords?.join(', ')} />
        <link rel="canonical" href={articleUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content={article.news_authors?.name || "Rimborsami Magazine"} />
        <meta name="language" content="Italian" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description} />
        <meta property="og:image" content={article.featured_image_url || "https://rimborsami.app/og-image.png"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Rimborsami Magazine" />
        <meta property="og:locale" content="it_IT" />
        <meta property="article:published_time" content={article.published_at || ''} />
        <meta property="article:modified_time" content={article.published_at || ''} />
        <meta property="article:section" content={categoryLabels[article.category] || article.category} />
        <meta property="article:author" content={article.news_authors ? `https://rimborsami.app/news/autore/${article.news_authors.slug}` : "https://rimborsami.app"} />
        {article.keywords?.slice(0, 5).map((keyword, i) => (
          <meta key={i} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={articleUrl} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.meta_description} />
        <meta name="twitter:image" content={article.featured_image_url || "https://rimborsami.app/og-image.png"} />
        
        {/* Structured Data - JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        {howToSchema && <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>}
        {productSchema && <script type="application/ld+json">{JSON.stringify(productSchema)}</script>}
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-8 md:py-12" itemScope itemType="https://schema.org/NewsArticle">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
                <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                  <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <Link to="/" className="hover:text-primary transition-colors" itemProp="item">
                      <span itemProp="name">Home</span>
                    </Link>
                    <meta itemProp="position" content="1" />
                  </li>
                  <span>/</span>
                  <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <Link to="/news" className="hover:text-primary transition-colors" itemProp="item">
                      <span itemProp="name">News</span>
                    </Link>
                    <meta itemProp="position" content="2" />
                  </li>
                  <span>/</span>
                  <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <span itemProp="name" className="text-foreground font-medium truncate max-w-[200px]">
                      {article.title}
                    </span>
                    <meta itemProp="position" content="3" />
                  </li>
                </ol>
              </nav>

              {/* Hero Image */}
              {article.featured_image_url && (
                <div className="aspect-video relative overflow-hidden rounded-xl mb-8 bg-muted">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="object-cover w-full h-full"
                    itemProp="image"
                    loading="eager"
                  />
                </div>
              )}

              {/* Header */}
              <header className="mb-8">
                <Badge variant="secondary" className="mb-4">
                  {categoryLabels[article.category] || article.category}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" itemProp="headline">
                  {article.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6" itemProp="description">
                  {article.excerpt}
                </p>

                {/* Author Byline */}
                {article.news_authors && (
                  <div className="mb-4">
                    <AuthorByline
                      name={article.news_authors.name}
                      slug={article.news_authors.slug}
                      avatarUrl={article.news_authors.avatar_url}
                      role={article.news_authors.role}
                      publishedAt={article.published_at || undefined}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4">
                  {!article.news_authors && publishedDate && (
                    <time 
                      dateTime={article.published_at || ''} 
                      className="flex items-center gap-1"
                      itemProp="datePublished"
                    >
                      <Calendar className="h-4 w-4" />
                      {publishedDate}
                    </time>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span itemProp="timeRequired" content={`PT${article.reading_time_minutes}M`}>
                      {article.reading_time_minutes} min di lettura
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views_count?.toLocaleString('it-IT')} visualizzazioni
                  </span>
                  <div className="ml-auto">
                    <ShareDropdown 
                      title={article.title} 
                      excerpt={article.excerpt}
                    />
                  </div>
                </div>
                
                {/* Author info for SEO */}
                {article.news_authors ? (
                  <div className="hidden" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{article.news_authors.name}</span>
                    <link itemProp="url" href={`https://rimborsami.app/news/autore/${article.news_authors.slug}`} />
                  </div>
                ) : (
                  <div className="hidden" itemProp="author" itemScope itemType="https://schema.org/Organization">
                    <span itemProp="name">Rimborsami Magazine</span>
                    <link itemProp="url" href="https://rimborsami.app" />
                  </div>
                )}
                <div className="hidden" itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                  <span itemProp="name">Rimborsami Magazine</span>
                  <link itemProp="url" href="https://rimborsami.app" />
                </div>
              </header>

              {/* Content */}
              <div className="grid md:grid-cols-[1fr_280px] gap-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-semibold prose-headings:text-foreground
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-li:marker:text-primary prose-li:my-1
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                    prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border
                    [&_details]:bg-muted/30 [&_details]:rounded-lg [&_details]:p-4 [&_details]:my-3
                    [&_summary]:font-semibold [&_summary]:cursor-pointer [&_summary]:text-foreground
                    [&_.info-box]:bg-primary/5 [&_.info-box]:border-l-4 [&_.info-box]:border-l-primary [&_.info-box]:p-4 [&_.info-box]:rounded-r [&_.info-box]:my-4"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  itemProp="articleBody"
                />

                {/* Sidebar */}
                <aside className="space-y-6">
                  <RelatedArticles currentSlug={article.slug} />
                </aside>
              </div>

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Tag:</h3>
                  <div className="flex flex-wrap gap-2" itemProp="keywords">
                    {article.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA - Use OpportunityCTA if opportunity is linked, otherwise generic NewsCTA */}
              <div className="mt-12">
                {article.opportunities ? (
                  <OpportunityCTA opportunity={article.opportunities} />
                ) : (
                  <NewsCTA />
                )}
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
