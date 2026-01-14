import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { useNewsAuthor, useAuthorArticles } from '@/hooks/useNewsAuthors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsCard } from '@/components/news/NewsCard';
import { Linkedin, Twitter, Mail, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthorAvatar } from '@/lib/authorAvatars';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const NewsAuthor = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: author, isLoading: authorLoading, error: authorError } = useNewsAuthor(slug || '');
  const { data: articles, isLoading: articlesLoading } = useAuthorArticles(author?.id || '', 12);

  if (authorLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-6 items-start mb-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (authorError || !author) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Autore non trovato</h1>
            <p className="text-muted-foreground mb-6">L'autore che stai cercando non esiste.</p>
            <Button asChild>
              <Link to="/redazione">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Redazione
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarSrc = getAuthorAvatar(author.slug, author.avatar_url);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `https://rimborsami.app/news/autore/${author.slug}`,
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: `https://rimborsami.app/news/autore/${author.slug}`,
    image: avatarSrc,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: 'Rimborsami Magazine',
      url: 'https://rimborsami.app',
    },
    knowsAbout: author.expertise,
    sameAs: [
      author.linkedin_url,
      author.twitter_url,
    ].filter(Boolean),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rimborsami.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Redazione',
        item: 'https://rimborsami.app/redazione',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: author.name,
        item: `https://rimborsami.app/news/autore/${author.slug}`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{author.name} | {author.role} - Rimborsami Magazine</title>
        <meta 
          name="description" 
          content={author.bio?.substring(0, 160) || `${author.name}, ${author.role} di Rimborsami Magazine.`} 
        />
        <link rel="canonical" href={`https://rimborsami.app/news/autore/${author.slug}`} />
        <meta property="og:title" content={`${author.name} | Rimborsami Magazine`} />
        <meta property="og:description" content={author.bio?.substring(0, 160) || ''} />
        <meta property="og:url" content={`https://rimborsami.app/news/autore/${author.slug}`} />
        <meta property="og:type" content="profile" />
        {avatarSrc && <meta property="og:image" content={avatarSrc} />}
        <script type="application/ld+json">
          {JSON.stringify(personSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="border-b bg-muted/30">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground">Home</Link>
                <span>/</span>
                <Link to="/redazione" className="hover:text-foreground">Redazione</Link>
                <span>/</span>
                <span className="text-foreground">{author.name}</span>
              </nav>
            </div>
          </div>

          {/* Author Profile */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20">
                        <AvatarImage src={getAuthorAvatar(author.slug, author.avatar_url)} alt={author.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                          {getInitials(author.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                          {author.name}
                        </h1>
                        <Badge className="mb-4">{author.role}</Badge>

                        {author.bio && (
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {author.bio}
                          </p>
                        )}

                        {author.expertise && author.expertise.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-foreground mb-2">Aree di competenza</h3>
                            <div className="flex flex-wrap gap-2">
                              {author.expertise.map((skill) => (
                                <Badge key={skill} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          {author.linkedin_url && (
                            <a 
                              href={author.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Linkedin className="h-5 w-5" />
                              LinkedIn
                            </a>
                          )}
                          {author.twitter_url && (
                            <a 
                              href={author.twitter_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Twitter className="h-5 w-5" />
                              Twitter
                            </a>
                          )}
                          {author.email && (
                            <a 
                              href={`mailto:${author.email}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="h-5 w-5" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Author Articles */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-8">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Articoli di {author.name}
                  </h2>
                </div>

                {articlesLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : articles && articles.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <NewsCard
                        key={article.id}
                        slug={article.slug}
                        title={article.title}
                        excerpt={article.excerpt}
                        category={article.category}
                        publishedAt={article.published_at || ''}
                        readingTime={article.reading_time_minutes || 5}
                        featuredImageUrl={article.featured_image_url}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun articolo pubblicato al momento.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NewsAuthor;
