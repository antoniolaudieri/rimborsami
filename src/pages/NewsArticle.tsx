import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsArticle } from '@/hooks/useNewsArticles';
import { NewsCTA } from '@/components/news/NewsCTA';
import { RelatedArticles } from '@/components/news/RelatedArticles';
import { ShareDropdown } from '@/components/news/ShareDropdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Clock, Calendar, ChevronLeft, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  telecom: 'Telefonia',
  energy: 'Energia',
  bank: 'Banche',
  ecommerce: 'E-commerce',
  class_action: 'Class Action',
  insurance: 'Assicurazioni',
};

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useNewsArticle(slug || '');
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.meta_description,
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "Rimborsami",
      "url": "https://rimborsami.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rimborsami",
      "url": "https://rimborsami.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rimborsami.app/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rimborsami.app/news/${article.slug}`
    },
    "keywords": article.keywords?.join(', '),
    "articleSection": categoryLabels[article.category] || article.category
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Rimborsami News</title>
        <meta name="description" content={article.meta_description} />
        <meta name="keywords" content={article.keywords?.join(', ')} />
        <link rel="canonical" href={`https://rimborsami.app/news/${article.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description} />
        <meta property="og:url" content={`https://rimborsami.app/news/${article.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.published_at || ''} />
        <meta property="article:section" content={categoryLabels[article.category] || article.category} />
        {article.keywords?.map((keyword, i) => (
          <meta key={i} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.meta_description} />
        
        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6" aria-label="Breadcrumb">
                <Link 
                  to="/news" 
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Torna alle News
                </Link>
              </nav>

              {/* Header */}
              <header className="mb-8">
                <Badge variant="secondary" className="mb-4">
                  {categoryLabels[article.category] || article.category}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {article.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4">
                  {publishedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {publishedDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.reading_time_minutes} min di lettura
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views_count} visualizzazioni
                  </span>
                  <div className="ml-auto">
                    <ShareDropdown 
                      title={article.title} 
                      excerpt={article.excerpt}
                    />
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="grid md:grid-cols-[1fr_280px] gap-8">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-semibold prose-headings:text-foreground
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-li:marker:text-primary"
                  dangerouslySetInnerHTML={{ __html: article.content }}
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
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12">
                <NewsCTA />
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
