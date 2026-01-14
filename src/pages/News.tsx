import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { useNewsAuthors } from '@/hooks/useNewsAuthors';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFilters } from '@/components/news/NewsFilters';
import { NewsCTA } from '@/components/news/NewsCTA';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Newspaper, Rss, Users, ArrowRight } from 'lucide-react';
import { getAuthorAvatar } from '@/lib/authorAvatars';

const categoryMeta: Record<string, { title: string; description: string; keywords: string }> = {
  all: {
    title: "Rimborsami Magazine | News e Guide sui Rimborsi in Italia",
    description: "Scopri come ottenere rimborsi per voli cancellati, bollette errate, class action e diritti consumatori. Guide pratiche 2026 per recuperare i tuoi soldi.",
    keywords: "rimborso voli Italia, class action 2026, rimborso bollette luce gas, diritti consumatori, risarcimento ritardo aereo, EU261, contestare bolletta"
  },
  flight: {
    title: "Rimborso Voli: Guide e News su Ritardi e Cancellazioni | Rimborsami",
    description: "Come ottenere rimborso e risarcimento per voli cancellati o in ritardo. Guida EU261, moduli Ryanair, Easyjet, ITA Airways. Calcola quanto ti spetta.",
    keywords: "rimborso volo cancellato, risarcimento ritardo aereo, EU261 Italia, rimborso Ryanair, rimborso Easyjet, modulo rimborso volo"
  },
  telecom: {
    title: "Rimborso Bollette Telefono: Come Contestare TIM, Vodafone | Rimborsami",
    description: "Guida per contestare bollette telefoniche errate e servizi non richiesti. Moduli reclamo TIM, Vodafone, WindTre, Fastweb. Ottieni il rimborso.",
    keywords: "rimborso bolletta telefono, contestare TIM, reclamo Vodafone, servizi non richiesti, disdetta WindTre, Agcom reclamo"
  },
  bank: {
    title: "Rimborso Commissioni Bancarie e Truffe Phishing | Rimborsami",
    description: "Come richiedere rimborso per commissioni nascoste, phishing bancario e addebiti non autorizzati. Guida ABF e reclami banche italiane.",
    keywords: "rimborso commissioni banca, phishing rimborso, ABF ricorso, reclamo Intesa Sanpaolo, truffa banca rimborso"
  },
  energy: {
    title: "Contestare Bollette Luce e Gas: Conguagli e Bonus Energia | Rimborsami",
    description: "Come contestare conguagli eccessivi e richiedere bonus sociale energia. Guide Enel, Eni, A2A. Verifica se hai diritto al rimborso.",
    keywords: "contestare bolletta luce, conguaglio gas, bonus sociale energia 2026, reclamo Enel, bolletta errata rimborso"
  },
  ecommerce: {
    title: "Diritti Acquisti Online: Reso, Garanzia e Rimborsi | Rimborsami",
    description: "Guida ai diritti del consumatore online: recesso 14 giorni, garanzia legale 2 anni, rimborsi Amazon, Zalando. Come far valere i tuoi diritti.",
    keywords: "diritto recesso online, garanzia legale 2 anni, rimborso Amazon, reso Zalando, prodotto difettoso rimborso"
  },
  class_action: {
    title: "Class Action Italia 2026: Come Aderire e Ottenere Risarcimento | Rimborsami",
    description: "Elenco class action attive in Italia: Dieselgate, tech, banche. Come aderire alle azioni collettive e quanto puoi ottenere di risarcimento.",
    keywords: "class action Italia 2026, Dieselgate risarcimento, azione collettiva, class action attive, aderire class action"
  }
};

const RSS_FEED_URL = "https://vizrvcmgqkpuwhxfienp.supabase.co/functions/v1/rss-feed";

export default function News() {
  const [category, setCategory] = useState('all');
  const { data: articles, isLoading, error } = useNewsArticles(category, 24);
  const { data: authors } = useNewsAuthors();

  const meta = categoryMeta[category] || categoryMeta.all;
  const canonicalUrl = category === 'all' 
    ? 'https://rimborsami.app/news' 
    : `https://rimborsami.app/news?category=${category}`;

  // Split articles: featured (first) and rest
  const featuredArticle = articles?.[0];
  const restArticles = articles?.slice(1);

  // Collection Page Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": meta.title,
    "description": meta.description,
    "url": canonicalUrl,
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Rimborsami Magazine",
      "url": "https://rimborsami.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rimborsami.app/favicon.png"
      }
    },
    "inLanguage": "it-IT",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Rimborsami",
      "url": "https://rimborsami.app"
    }
  };

  // Breadcrumb Schema
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
        "name": "Magazine",
        "item": "https://rimborsami.app/news"
      }
    ]
  };

  // ItemList Schema for articles
  const itemListSchema = articles && articles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": articles.slice(0, 10).map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://rimborsami.app/news/${article.slug}`,
      "name": article.title
    }))
  } : null;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{meta.title}</title>
        <meta name="title" content={meta.title} />
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta name="author" content="Rimborsami Magazine" />
        <meta name="language" content="Italian" />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Rimborsami Magazine RSS" href={RSS_FEED_URL} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content="https://rimborsami.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Rimborsami Magazine" />
        <meta property="og:locale" content="it_IT" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content="https://rimborsami.app/og-image.png" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {itemListSchema && <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>}
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Magazine Header */}
          <section className="border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 py-8 md:py-12">
              
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Newspaper className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">
                        Rimborsami Magazine
                      </h1>
                      <p className="text-muted-foreground">Il magazine dei diritti dei consumatori</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">
                    Guide pratiche, news e approfondimenti per recuperare i tuoi soldi. 
                    Voli, bollette, class action e tutela dei consumatori.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link to="/redazione">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      La Redazione
                    </Button>
                  </Link>
                  <a 
                    href={RSS_FEED_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors"
                    title="Iscriviti al Feed RSS"
                  >
                    <Rss className="h-4 w-4 text-orange-500" />
                    <span className="hidden sm:inline">RSS</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-4 py-3">
              <NewsFilters 
                selectedCategory={category} 
                onCategoryChange={setCategory} 
              />
            </div>
          </section>

          {/* Featured Article */}
          {!isLoading && featuredArticle && category === 'all' && (
            <section className="py-8 md:py-10 border-b">
              <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">In Evidenza</span>
                </div>
                <NewsCard
                  slug={featuredArticle.slug}
                  title={featuredArticle.title}
                  excerpt={featuredArticle.excerpt}
                  category={featuredArticle.category}
                  publishedAt={featuredArticle.published_at}
                  readingTime={featuredArticle.reading_time_minutes}
                  featuredImageUrl={featuredArticle.featured_image_url}
                  author={featuredArticle.news_authors}
                  variant="featured"
                />
              </div>
            </section>
          )}

          {/* Main Grid */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Articles */}
                <div className="lg:col-span-2">
                  {error && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Si è verificato un errore nel caricamento degli articoli.</p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="h-48 w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && articles?.length === 0 && (
                    <div className="text-center py-12">
                      <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Nessun articolo trovato</h2>
                      <p className="text-muted-foreground">
                        {category !== 'all' 
                          ? 'Non ci sono articoli in questa categoria. Prova a selezionare "Tutti".'
                          : 'Nuovi articoli saranno pubblicati presto. Torna a trovarci!'}
                      </p>
                    </div>
                  )}

                  {!isLoading && (category === 'all' ? restArticles : articles) && (category === 'all' ? restArticles : articles)!.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {(category === 'all' ? restArticles : articles)!.map((article) => (
                        <NewsCard
                          key={article.id}
                          slug={article.slug}
                          title={article.title}
                          excerpt={article.excerpt}
                          category={article.category}
                          publishedAt={article.published_at}
                          readingTime={article.reading_time_minutes}
                          featuredImageUrl={article.featured_image_url}
                          author={article.news_authors}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                  {/* Team Box */}
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">La Nostra Redazione</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Un team di giornalisti ed esperti specializzati in diritti dei consumatori.
                    </p>
                    
                    {authors && authors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {authors.slice(0, 6).map((author) => (
                          <Link 
                            key={author.id} 
                            to={`/news/autore/${author.slug}`}
                            className="group"
                            title={author.name}
                          >
                            <Avatar className="h-10 w-10 border-2 border-background group-hover:border-primary transition-colors">
                              <AvatarImage 
                                src={getAuthorAvatar(author.slug, author.avatar_url)} 
                                alt={author.name} 
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    <Link to="/redazione">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        Scopri il Team
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* RSS Box */}
                  <div className="bg-muted/30 rounded-xl p-6 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Rss className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold">Resta Aggiornato</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Iscriviti al nostro feed RSS per ricevere gli ultimi articoli nel tuo aggregatore preferito.
                    </p>
                    <a 
                      href={RSS_FEED_URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" size="sm" className="w-full gap-2">
                        <Rss className="h-4 w-4" />
                        Iscriviti al Feed RSS
                      </Button>
                    </a>
                  </div>

                  {/* Quick Links */}
                  <div className="rounded-xl p-6 border">
                    <h3 className="font-semibold mb-4">Categorie Popolari</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'flight', label: '✈️ Rimborsi Voli' },
                        { key: 'energy', label: '💡 Bollette Energia' },
                        { key: 'bank', label: '🏦 Banche e Finanza' },
                        { key: 'class_action', label: '⚖️ Class Action' },
                        { key: 'ecommerce', label: '🛒 E-commerce' },
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setCategory(cat.key)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            category === cat.key 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 md:py-12 bg-muted/30 border-t">
            <div className="container mx-auto px-4">
              <NewsCTA />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
