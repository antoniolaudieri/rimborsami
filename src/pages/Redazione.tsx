import { Helmet } from 'react-helmet-async';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { AuthorCard } from '@/components/news/AuthorCard';
import { useNewsAuthors } from '@/hooks/useNewsAuthors';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, Shield, Users, Target } from 'lucide-react';

const Redazione = () => {
  const { data: authors, isLoading, error } = useNewsAuthors();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': 'https://rimborsami.app/#organization',
    name: 'Rimborsami Magazine',
    alternateName: 'Rimborsami',
    url: 'https://rimborsami.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://rimborsami.app/favicon.png',
    },
    sameAs: [],
    publishingPrinciples: 'https://rimborsami.app/redazione#policy',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Alessandro Ferrante',
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>La Redazione | Rimborsami Magazine - Chi Siamo</title>
        <meta 
          name="description" 
          content="Scopri il team di Rimborsami Magazine: giornalisti ed esperti specializzati in diritti dei consumatori, rimborsi e tutela del cittadino." 
        />
        <link rel="canonical" href="https://rimborsami.app/redazione" />
        <meta property="og:title" content="La Redazione | Rimborsami Magazine" />
        <meta property="og:description" content="Il team di esperti che ogni giorno ti aiuta a conoscere e difendere i tuoi diritti di consumatore." />
        <meta property="og:url" content="https://rimborsami.app/redazione" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Newspaper className="h-4 w-4" />
                  Rimborsami Magazine
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  La Redazione
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Il magazine italiano dedicato ai diritti dei consumatori. 
                  Un team di giornalisti, analisti ed esperti legali al tuo servizio 
                  per informarti, guidarti e aiutarti a ottenere ciò che ti spetta.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 border-b">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">La Nostra Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    Informare i consumatori italiani sui loro diritti e sulle opportunità 
                    di recuperare denaro attraverso guide pratiche e news aggiornate.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Indipendenza</h3>
                  <p className="text-sm text-muted-foreground">
                    I nostri contenuti sono indipendenti e basati su fonti verificate. 
                    Non accettiamo compensi per recensioni o articoli promozionali.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Esperienza</h3>
                  <p className="text-sm text-muted-foreground">
                    Il nostro team combina competenze giornalistiche, legali ed economiche 
                    per offrirti contenuti affidabili e di qualità.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                  Il Nostro Team
                </h2>

                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="p-6 border rounded-lg">
                        <div className="flex gap-4">
                          <Skeleton className="h-16 w-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <p className="text-center text-muted-foreground">
                    Errore nel caricamento della redazione.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {authors?.map((author) => (
                      <AuthorCard key={author.id} author={author} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Editorial Policy Section */}
          <section id="policy" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Policy Editoriale</h2>
                
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fonti e Verifiche</h3>
                    <p className="text-sm">
                      Tutti i nostri articoli si basano su fonti ufficiali: normative europee e nazionali, 
                      sentenze di tribunali, delibere di autorità garanti (AGCM, ARERA, AGCOM) e comunicati 
                      stampa verificati. Ogni informazione viene controllata prima della pubblicazione.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Trasparenza</h3>
                    <p className="text-sm">
                      Rimborsami Magazine è un progetto editoriale di Rimborsami. I nostri articoli 
                      possono contenere riferimenti al servizio Rimborsami, sempre chiaramente identificati. 
                      Non pubblichiamo contenuti sponsorizzati senza indicarlo esplicitamente.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Correzioni</h3>
                    <p className="text-sm">
                      In caso di errori o imprecisioni, ci impegniamo a correggere tempestivamente 
                      i contenuti e a segnalare la modifica ai lettori. Per segnalazioni, contattaci 
                      all'indirizzo redazione@rimborsami.app.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Conflitti di Interesse</h3>
                    <p className="text-sm">
                      I nostri autori dichiarano eventuali conflitti di interesse relativi agli 
                      argomenti trattati. Non accettiamo compensi da aziende per scrivere recensioni 
                      o articoli che le riguardano.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-background border rounded-lg">
                  <p className="text-sm">
                    <strong>Contatti Redazione:</strong><br />
                    Email: <a href="mailto:redazione@rimborsami.app" className="text-primary hover:underline">redazione@rimborsami.app</a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Redazione;
