import { useState } from 'react';
import {
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  FileQuestion,
  Phone,
  Zap,
  Train,
  Car,
  Smartphone,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Database di loghi aziendali comuni italiane
const companyLogos: Record<string, string> = {
  // Voli
  'ryanair': 'https://logo.clearbit.com/ryanair.com',
  'easyjet': 'https://logo.clearbit.com/easyjet.com',
  'ita airways': 'https://logo.clearbit.com/ita-airways.com',
  'ita': 'https://logo.clearbit.com/ita-airways.com',
  'alitalia': 'https://logo.clearbit.com/alitalia.com',
  'vueling': 'https://logo.clearbit.com/vueling.com',
  'wizz air': 'https://logo.clearbit.com/wizzair.com',
  'wizzair': 'https://logo.clearbit.com/wizzair.com',
  'wizz': 'https://logo.clearbit.com/wizzair.com',
  'lufthansa': 'https://logo.clearbit.com/lufthansa.com',
  'air france': 'https://logo.clearbit.com/airfrance.com',
  'british airways': 'https://logo.clearbit.com/britishairways.com',
  'emirates': 'https://logo.clearbit.com/emirates.com',
  'qatar airways': 'https://logo.clearbit.com/qatarairways.com',
  'turkish airlines': 'https://logo.clearbit.com/turkishairlines.com',
  'volotea': 'https://logo.clearbit.com/volotea.com',
  'neos': 'https://logo.clearbit.com/neosair.it',
  
  // Treni
  'trenitalia': 'https://logo.clearbit.com/trenitalia.com',
  'italo': 'https://logo.clearbit.com/italotreno.it',
  'italo treno': 'https://logo.clearbit.com/italotreno.it',
  'trenord': 'https://logo.clearbit.com/trenord.it',
  
  // Banche
  'unicredit': 'https://logo.clearbit.com/unicredit.it',
  'intesa sanpaolo': 'https://logo.clearbit.com/intesasanpaolo.com',
  'intesa': 'https://logo.clearbit.com/intesasanpaolo.com',
  'bnl': 'https://logo.clearbit.com/bnl.it',
  'n26': 'https://logo.clearbit.com/n26.com',
  'revolut': 'https://logo.clearbit.com/revolut.com',
  'fineco': 'https://logo.clearbit.com/fineco.it',
  'finecobank': 'https://logo.clearbit.com/fineco.it',
  'ing': 'https://logo.clearbit.com/ing.it',
  'ing direct': 'https://logo.clearbit.com/ing.it',
  'banca mediolanum': 'https://logo.clearbit.com/bancamediolanum.it',
  'mediolanum': 'https://logo.clearbit.com/bancamediolanum.it',
  'bper': 'https://logo.clearbit.com/bper.it',
  'banco bpm': 'https://logo.clearbit.com/bancobpm.it',
  'credem': 'https://logo.clearbit.com/credem.it',
  'mps': 'https://logo.clearbit.com/mps.it',
  'monte dei paschi': 'https://logo.clearbit.com/mps.it',
  'poste italiane': 'https://logo.clearbit.com/poste.it',
  'postepay': 'https://logo.clearbit.com/postepay.it',
  'wise': 'https://logo.clearbit.com/wise.com',
  'hype': 'https://logo.clearbit.com/hype.it',
  'buddybank': 'https://logo.clearbit.com/buddybank.com',
  
  // Telecom
  'tim': 'https://logo.clearbit.com/tim.it',
  'vodafone': 'https://logo.clearbit.com/vodafone.it',
  'windtre': 'https://logo.clearbit.com/windtre.it',
  'wind tre': 'https://logo.clearbit.com/windtre.it',
  'wind': 'https://logo.clearbit.com/windtre.it',
  'tre': 'https://logo.clearbit.com/windtre.it',
  'iliad': 'https://logo.clearbit.com/iliad.it',
  'fastweb': 'https://logo.clearbit.com/fastweb.it',
  'ho mobile': 'https://logo.clearbit.com/ho-mobile.it',
  'ho.': 'https://logo.clearbit.com/ho-mobile.it',
  'kena mobile': 'https://logo.clearbit.com/kenamobile.it',
  'poste mobile': 'https://logo.clearbit.com/postemobile.it',
  'very mobile': 'https://logo.clearbit.com/verymobile.it',
  'sky': 'https://logo.clearbit.com/sky.it',
  
  // Energia
  'enel': 'https://logo.clearbit.com/enel.it',
  'enel energia': 'https://logo.clearbit.com/enel.it',
  'eni': 'https://logo.clearbit.com/eni.com',
  'eni plenitude': 'https://logo.clearbit.com/eni.com',
  'plenitude': 'https://logo.clearbit.com/eni.com',
  'a2a': 'https://logo.clearbit.com/a2a.eu',
  'edison': 'https://logo.clearbit.com/edison.it',
  'sorgenia': 'https://logo.clearbit.com/sorgenia.it',
  'hera': 'https://logo.clearbit.com/grupphera.it',
  'iren': 'https://logo.clearbit.com/irenlucegas.it',
  'acea': 'https://logo.clearbit.com/acea.it',
  
  // E-commerce
  'amazon': 'https://logo.clearbit.com/amazon.it',
  'ebay': 'https://logo.clearbit.com/ebay.it',
  'zalando': 'https://logo.clearbit.com/zalando.it',
  'mediaworld': 'https://logo.clearbit.com/mediaworld.it',
  'unieuro': 'https://logo.clearbit.com/unieuro.it',
  'euronics': 'https://logo.clearbit.com/euronics.it',
  'esselunga': 'https://logo.clearbit.com/esselunga.it',
  'carrefour': 'https://logo.clearbit.com/carrefour.it',
  'lidl': 'https://logo.clearbit.com/lidl.it',
  'shein': 'https://logo.clearbit.com/shein.com',
  'temu': 'https://logo.clearbit.com/temu.com',
  'aliexpress': 'https://logo.clearbit.com/aliexpress.com',
  'wish': 'https://logo.clearbit.com/wish.com',
  
  // Auto
  'fiat': 'https://logo.clearbit.com/fiat.com',
  'stellantis': 'https://logo.clearbit.com/stellantis.com',
  'alfa romeo': 'https://logo.clearbit.com/alfaromeo.com',
  'jeep': 'https://logo.clearbit.com/jeep.com',
  'lancia': 'https://logo.clearbit.com/lancia.com',
  'citroen': 'https://logo.clearbit.com/citroen.it',
  'citroën': 'https://logo.clearbit.com/citroen.it',
  'peugeot': 'https://logo.clearbit.com/peugeot.it',
  'opel': 'https://logo.clearbit.com/opel.it',
  'volkswagen': 'https://logo.clearbit.com/volkswagen.it',
  'audi': 'https://logo.clearbit.com/audi.it',
  'bmw': 'https://logo.clearbit.com/bmw.it',
  'mercedes': 'https://logo.clearbit.com/mercedes-benz.it',
  'mercedes-benz': 'https://logo.clearbit.com/mercedes-benz.it',
  'toyota': 'https://logo.clearbit.com/toyota.it',
  'renault': 'https://logo.clearbit.com/renault.it',
  'ford': 'https://logo.clearbit.com/ford.it',
  'hyundai': 'https://logo.clearbit.com/hyundai.it',
  'kia': 'https://logo.clearbit.com/kia.it',
  'nissan': 'https://logo.clearbit.com/nissan.it',
  'tesla': 'https://logo.clearbit.com/tesla.com',
  
  // Assicurazioni
  'generali': 'https://logo.clearbit.com/generali.it',
  'allianz': 'https://logo.clearbit.com/allianz.it',
  'unipol': 'https://logo.clearbit.com/unipolsai.it',
  'unipolsai': 'https://logo.clearbit.com/unipolsai.it',
  'axa': 'https://logo.clearbit.com/axa.it',
  'zurich': 'https://logo.clearbit.com/zurich.it',
  'cattolica': 'https://logo.clearbit.com/cattolica.it',
  'vittoria': 'https://logo.clearbit.com/vittoriaassicurazioni.it',
  'sara': 'https://logo.clearbit.com/sara.it',
  'linear': 'https://logo.clearbit.com/linear.it',
  'prima': 'https://logo.clearbit.com/prima.it',
  'verti': 'https://logo.clearbit.com/verti.it',
  'quixa': 'https://logo.clearbit.com/quixa.it',
  
  // Tech
  'google': 'https://logo.clearbit.com/google.com',
  'apple': 'https://logo.clearbit.com/apple.com',
  'meta': 'https://logo.clearbit.com/meta.com',
  'facebook': 'https://logo.clearbit.com/facebook.com',
  'instagram': 'https://logo.clearbit.com/instagram.com',
  'whatsapp': 'https://logo.clearbit.com/whatsapp.com',
  'tiktok': 'https://logo.clearbit.com/tiktok.com',
  'linkedin': 'https://logo.clearbit.com/linkedin.com',
  'twitter': 'https://logo.clearbit.com/twitter.com',
  'x': 'https://logo.clearbit.com/x.com',
  'spotify': 'https://logo.clearbit.com/spotify.com',
  'netflix': 'https://logo.clearbit.com/netflix.com',
  'microsoft': 'https://logo.clearbit.com/microsoft.com',
  'samsung': 'https://logo.clearbit.com/samsung.com',
  'xiaomi': 'https://logo.clearbit.com/xiaomi.com',
  'huawei': 'https://logo.clearbit.com/huawei.com',
};

// Icone categoria come fallback
const categoryIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-full h-full" />,
  ecommerce: <ShoppingCart className="w-full h-full" />,
  bank: <Landmark className="w-full h-full" />,
  insurance: <Shield className="w-full h-full" />,
  warranty: <Package className="w-full h-full" />,
  telecom: <Phone className="w-full h-full" />,
  energy: <Zap className="w-full h-full" />,
  transport: <Train className="w-full h-full" />,
  automotive: <Car className="w-full h-full" />,
  tech: <Smartphone className="w-full h-full" />,
  class_action: <Users className="w-full h-full" />,
  other: <FileQuestion className="w-full h-full" />,
};

// Campi possibili dove cercare il nome azienda
const companyFields = [
  'compagnia',
  'azienda', 
  'fornitore',
  'venditore',
  'banca',
  'operatore',
  'compagnia_aerea',
  'vettore',
  'assicurazione',
  'gestore',
  'brand',
  'negozio',
  'sito',
  'shop',
];

function extractCompanyName(matchedData?: Record<string, unknown>, opportunityTitle?: string): string | null {
  // Prima cerca nei matchedData
  if (matchedData) {
    for (const field of companyFields) {
      const value = matchedData[field];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim().toLowerCase();
      }
    }
    
    // Cerca anche in campi con nomi simili
    for (const [key, value] of Object.entries(matchedData)) {
      if (typeof value === 'string' && value.trim()) {
        const keyLower = key.toLowerCase();
        if (companyFields.some(f => keyLower.includes(f))) {
          return value.trim().toLowerCase();
        }
      }
    }
  }
  
  // Se non trovato, prova a estrarre dal titolo dell'opportunità
  if (opportunityTitle) {
    const titleLower = opportunityTitle.toLowerCase();
    
    // Cerca se il titolo contiene un nome azienda conosciuto
    for (const companyKey of Object.keys(companyLogos)) {
      if (titleLower.includes(companyKey)) {
        return companyKey;
      }
    }
  }
  
  return null;
}

function findLogoUrl(companyName: string): string | null {
  // Match esatto
  if (companyLogos[companyName]) {
    return companyLogos[companyName];
  }
  
  // Match parziale
  for (const [key, url] of Object.entries(companyLogos)) {
    if (companyName.includes(key) || key.includes(companyName)) {
      return url;
    }
  }
  
  return null;
}

interface CompanyLogoProps {
  category: string;
  matchedData?: Record<string, unknown>;
  opportunityTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function CompanyLogo({ 
  category, 
  matchedData, 
  opportunityTitle,
  size = 'md',
  className 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const companyName = extractCompanyName(matchedData, opportunityTitle);
  const logoUrl = companyName ? findLogoUrl(companyName) : null;
  
  const showLogo = logoUrl && !imageError;
  
  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
        showLogo ? "bg-white p-1.5 border border-border/50" : "bg-primary/10 text-primary",
        sizeClasses[size],
        className
      )}
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt={companyName || 'Company logo'}
          className="w-full h-full object-contain rounded-lg"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className={iconSizeClasses[size]}>
          {categoryIcons[category] || categoryIcons.other}
        </div>
      )}
    </div>
  );
}
