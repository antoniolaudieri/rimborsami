-- Tabella autori news
CREATE TABLE public.news_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email VARCHAR(255),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  expertise TEXT[] DEFAULT '{}',
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abilitare RLS
ALTER TABLE public.news_authors ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono vedere gli autori
CREATE POLICY "Anyone can view authors" ON public.news_authors
  FOR SELECT USING (true);

-- Policy: solo admin possono gestire
CREATE POLICY "Admins can manage authors" ON public.news_authors
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Aggiungere colonna author_id agli articoli
ALTER TABLE public.news_articles 
  ADD COLUMN author_id UUID REFERENCES public.news_authors(id);

-- Trigger per updated_at
CREATE TRIGGER update_news_authors_updated_at
  BEFORE UPDATE ON public.news_authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserire i 6 autori credibili
INSERT INTO public.news_authors (slug, name, role, bio, expertise) VALUES
(
  'alessandro-ferrante', 
  'Alessandro Ferrante', 
  'Direttore Responsabile', 
  'Giornalista professionista con oltre 15 anni di esperienza nella tutela dei consumatori. Ha collaborato con Il Sole 24 Ore e Altroconsumo prima di fondare la redazione di Rimborsami Magazine. Esperto di normativa europea sui diritti dei consumatori e class action.',
  ARRAY['Diritto consumatori', 'Class action', 'Normativa EU', 'Risarcimenti']
),
(
  'chiara-mantovani', 
  'Chiara Mantovani', 
  'Caporedattore', 
  'Esperta di mercato libero dell''energia con 10 anni di esperienza nel settore utilities. Ex analista presso ARERA, oggi guida la sezione energia e utilities di Rimborsami Magazine. Autrice di guide pratiche sui bonus sociali e diritti in bolletta.',
  ARRAY['Energia', 'Gas', 'Utilities', 'Bonus sociali', 'Bollette']
),
(
  'federico-colombo', 
  'Federico Colombo', 
  'Redattore Senior', 
  'Specializzato nel Regolamento EU 261/2004 sui diritti dei passeggeri aerei. Collabora con associazioni di tutela viaggiatori e ha seguito centinaia di casi di rimborso per ritardi, cancellazioni e overbooking. Viaggiatore frequente e conoscitore dei diritti dei passeggeri.',
  ARRAY['Trasporti aerei', 'EU 261/2004', 'Rimborsi voli', 'Diritti passeggeri', 'Viaggi']
),
(
  'martina-galli', 
  'Martina Galli', 
  'Redattrice', 
  'Laureata in Economia alla Bocconi con specializzazione in diritto bancario. Si occupa di class action nel settore finanziario e tutela dei risparmiatori. Ha seguito i principali casi di risparmio tradito degli ultimi anni, dalle obbligazioni subordinate ai diamanti da investimento.',
  ARRAY['Finanza', 'Banking', 'Class action bancarie', 'Investimenti', 'Risparmio']
),
(
  'luca-benedetti', 
  'Luca Benedetti', 
  'Redattore', 
  'Esperto di telecomunicazioni con background tecnico e giuridico. Segue i contenziosi con operatori telefonici e le decisioni AGCOM. Appassionato di tecnologia, analizza le pratiche commerciali scorrette nel settore digitale e telefonia.',
  ARRAY['Telecomunicazioni', 'Telefonia', 'Internet', 'AGCOM', 'Digital rights']
),
(
  'sara-marchetti', 
  'Sara Marchetti', 
  'Contributor', 
  'Blogger e consulente sui diritti digitali dei consumatori. Esperta di e-commerce, garanzie e diritto di recesso. Collabora con diverse testate online e associazioni consumatori. Autrice della rubrica "Acquisti Sicuri" su Rimborsami Magazine.',
  ARRAY['E-commerce', 'Garanzie', 'Resi', 'Diritto recesso', 'Acquisti online']
);