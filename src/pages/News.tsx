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

export default function News() {
  const [category, setCategory] = useState('all');
  const { data: articles, isLoading, error } = useNewsArticles(category, 24);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "News e Guide - Rimborsami",
    "description": "Articoli, guide e novità su rimborsi, compensazioni e diritti dei consumatori in Italia",
    "url": "https://rimborsami.app/news",
    "publisher": {
      "@type": "Organization",
      "name": "Rimborsami",
      "url": "https://rimborsami.app"
    }
  };

  return (
    <>
      <Helmet>
        <title>News e Guide sui Rimborsi | Rimborsami</title>
        <meta 
          name="description" 
          content="Scopri le ultime novità su rimborsi voli, bollette, class action e diritti dei consumatori. Guide pratiche per recuperare i tuoi soldi." 
        />
        <meta name="keywords" content="rimborso voli, class action Italia, rimborso bollette, diritti consumatori, compensazione ritardo aereo" />
        <link rel="canonical" href="https://rimborsami.app/news" />
        
        {/* Open Graph */}
        <meta property="og:title" content="News e Guide sui Rimborsi | Rimborsami" />
        <meta property="og:description" content="Scopri le ultime novità su rimborsi voli, bollette, class action e diritti dei consumatori." />
        <meta property="og:url" content="https://rimborsami.app/news" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:title" content="News e Guide sui Rimborsi | Rimborsami" />
        <meta name="twitter:description" content="Scopri le ultime novità su rimborsi voli, bollette, class action e diritti dei consumatori." />
        
        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Blog & Guide</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                News e Guide sui Rimborsi
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Rimani aggiornato sulle ultime novità in tema di rimborsi, compensazioni e tutela dei consumatori. 
                Guide pratiche per far valere i tuoi diritti.
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
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
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
