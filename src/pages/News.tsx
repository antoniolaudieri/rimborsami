import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFilters } from '@/components/news/NewsFilters';
import { NewsCTA } from '@/components/news/NewsCTA';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Newspaper } from 'lucide-react';

const categoryMeta: Record<string, { title: string; description: string; keywords: string }> = {
  all: {
    title: "News e Guide sui Rimborsi in Italia | Rimborsami",
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

export default function News() {
  const [category, setCategory] = useState('all');
  const { data: articles, isLoading, error } = useNewsArticles(category, 24);

  const meta = categoryMeta[category] || categoryMeta.all;
  const canonicalUrl = category === 'all' 
    ? 'https://rimborsami.app/news' 
    : `https://rimborsami.app/news?category=${category}`;

  // Collection Page Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": meta.title,
    "description": meta.description,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Rimborsami",
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
        "name": "News",
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
        <meta name="author" content="Rimborsami" />
        <meta name="language" content="Italian" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content="https://rimborsami.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Rimborsami" />
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
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
            <div className="container mx-auto px-4">
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                  <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                  <span>/</span>
                  <li className="text-foreground font-medium">News</li>
                </ol>
              </nav>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Blog & Guide sui Rimborsi</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {category === 'all' ? 'News e Guide sui Rimborsi in Italia' : meta.title.split('|')[0].trim()}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category === 'all' 
                  ? 'Articoli, guide pratiche e ultime novità su rimborsi voli, bollette, class action e tutela dei consumatori. Scopri come recuperare i tuoi soldi.'
                  : meta.description
                }
              </p>
            </div>
          </section>

          {/* Filters */}
          <section className="border-b">
            <div className="container mx-auto px-4 py-4">
              <NewsFilters 
                selectedCategory={category} 
                onCategoryChange={setCategory} 
              />
            </div>
          </section>

          {/* Articles Grid */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              {error && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Si è verificato un errore nel caricamento degli articoli.</p>
                </div>
              )}

              {isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

              {!isLoading && articles && articles.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <NewsCard
                      key={article.id}
                      slug={article.slug}
                      title={article.title}
                      excerpt={article.excerpt}
                      category={article.category}
                      publishedAt={article.published_at}
                      readingTime={article.reading_time_minutes}
                      featuredImageUrl={article.featured_image_url}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 md:py-12 bg-muted/30">
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
