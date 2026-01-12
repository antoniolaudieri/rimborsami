import { useState } from 'react';
import {
  Plane,
  ShoppingCart,
  Landmark,
  Shield,
  Package,
  HelpCircle,
  Phone,
  Zap,
  Train,
  Car,
  Smartphone,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mappa loghi aziendali - usando API logo affidabili
// Logo.dev API (gratuito, affidabile) - formato: https://img.logo.dev/{domain}?token=pk_X5gcGTSoSOyPOv0M3xLMhg
const LOGO_TOKEN = 'pk_X5gcGTSoSOyPOv0M3xLMhg';
const logoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}`;

const companyLogos: Record<string, string> = {
  // Big Tech / Class Action
  google: logoUrl('google.com'),
  apple: logoUrl('apple.com'),
  meta: logoUrl('meta.com'),
  facebook: logoUrl('facebook.com'),
  tiktok: logoUrl('tiktok.com'),
  amazon: logoUrl('amazon.com'),
  microsoft: logoUrl('microsoft.com'),
  netflix: logoUrl('netflix.com'),
  spotify: logoUrl('spotify.com'),
  paypal: logoUrl('paypal.com'),
  twitter: logoUrl('twitter.com'),
  x: logoUrl('x.com'),
  instagram: logoUrl('instagram.com'),
  whatsapp: logoUrl('whatsapp.com'),
  linkedin: logoUrl('linkedin.com'),
  
  // Travel & Booking
  booking: logoUrl('booking.com'),
  'booking.com': logoUrl('booking.com'),
  airbnb: logoUrl('airbnb.com'),
  expedia: logoUrl('expedia.com'),
  tripadvisor: logoUrl('tripadvisor.com'),
  skyscanner: logoUrl('skyscanner.com'),
  
  // Automotive
  volkswagen: logoUrl('volkswagen.com'),
  stellantis: logoUrl('stellantis.com'),
  citroen: logoUrl('citroen.com'),
  citroën: logoUrl('citroen.com'),
  opel: logoUrl('opel.com'),
  fiat: logoUrl('fiat.com'),
  peugeot: logoUrl('peugeot.com'),
  renault: logoUrl('renault.com'),
  bmw: logoUrl('bmw.com'),
  mercedes: logoUrl('mercedes-benz.com'),
  'mercedes-benz': logoUrl('mercedes-benz.com'),
  audi: logoUrl('audi.com'),
  toyota: logoUrl('toyota.com'),
  ford: logoUrl('ford.com'),
  jeep: logoUrl('jeep.com'),
  alfa: logoUrl('alfaromeo.com'),
  'alfa romeo': logoUrl('alfaromeo.com'),
  porsche: logoUrl('porsche.com'),
  tesla: logoUrl('tesla.com'),
  
  // Airlines
  ryanair: logoUrl('ryanair.com'),
  easyjet: logoUrl('easyjet.com'),
  vueling: logoUrl('vueling.com'),
  wizzair: logoUrl('wizzair.com'),
  'wizz air': logoUrl('wizzair.com'),
  lufthansa: logoUrl('lufthansa.com'),
  'air france': logoUrl('airfrance.com'),
  airfrance: logoUrl('airfrance.com'),
  alitalia: logoUrl('alitalia.com'),
  ita: logoUrl('ita-airways.com'),
  'ita airways': logoUrl('ita-airways.com'),
  emirates: logoUrl('emirates.com'),
  klm: logoUrl('klm.com'),
  volotea: logoUrl('volotea.com'),
  'british airways': logoUrl('britishairways.com'),
  
  // Banks
  intesa: logoUrl('intesasanpaolo.com'),
  'intesa sanpaolo': logoUrl('intesasanpaolo.com'),
  unicredit: logoUrl('unicredit.it'),
  bnl: logoUrl('bnl.it'),
  fineco: logoUrl('finecobank.com'),
  ing: logoUrl('ing.com'),
  n26: logoUrl('n26.com'),
  revolut: logoUrl('revolut.com'),
  mediolanum: logoUrl('bancamediolanum.it'),
  hype: logoUrl('hype.it'),
  'monte paschi': logoUrl('mps.it'),
  mps: logoUrl('mps.it'),
  
  // Telecom
  tim: logoUrl('tim.it'),
  vodafone: logoUrl('vodafone.it'),
  windtre: logoUrl('windtre.it'),
  'wind tre': logoUrl('windtre.it'),
  wind: logoUrl('windtre.it'),
  iliad: logoUrl('iliad.it'),
  fastweb: logoUrl('fastweb.it'),
  sky: logoUrl('sky.it'),
  
  // Energy
  enel: logoUrl('enel.it'),
  eni: logoUrl('eni.com'),
  a2a: logoUrl('a2a.eu'),
  iren: logoUrl('irenenergia.it'),
  edison: logoUrl('edison.it'),
  sorgenia: logoUrl('sorgenia.it'),
  
  // E-commerce
  ebay: logoUrl('ebay.com'),
  zalando: logoUrl('zalando.com'),
  shein: logoUrl('shein.com'),
  temu: logoUrl('temu.com'),
  mediaworld: logoUrl('mediaworld.it'),
  unieuro: logoUrl('unieuro.it'),
  eprice: logoUrl('eprice.it'),
  
  // Transport
  trenitalia: logoUrl('trenitalia.com'),
  italo: logoUrl('italotreno.it'),
  flixbus: logoUrl('flixbus.com'),
  
  // Insurance
  generali: logoUrl('generali.it'),
  allianz: logoUrl('allianz.it'),
  unipol: logoUrl('unipolsai.it'),
  unipolsai: logoUrl('unipolsai.it'),
  axa: logoUrl('axa.it'),
  zurich: logoUrl('zurich.it'),
  
  // Other
  infocert: logoUrl('infocert.it'),
  poste: logoUrl('poste.it'),
  'poste italiane': logoUrl('poste.it'),
};

// Estrai nome azienda dai dati salvati o dal titolo
function extractCompanyName(matchedData?: Record<string, unknown>, title?: string): string | null {
  // Prima prova dal campo company_name salvato nel form
  if (matchedData?.company_name && typeof matchedData.company_name === 'string') {
    const savedName = matchedData.company_name.toLowerCase();
    // Cerca corrispondenza esatta nella mappa
    if (companyLogos[savedName]) {
      return savedName;
    }
    // Cerca corrispondenza parziale
    for (const company of Object.keys(companyLogos)) {
      if (savedName.includes(company) || company.includes(savedName)) {
        return company;
      }
    }
  }
  
  // Fallback: cerca nel titolo dell'opportunità
  if (!title) return null;
  
  const lowerTitle = title.toLowerCase();
  
  // Cerca corrispondenze con le aziende note
  for (const company of Object.keys(companyLogos)) {
    // Usa word boundary per evitare falsi positivi
    const regex = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerTitle)) {
      return company;
    }
  }
  
  return null;
}

// Configurazione icone per categoria
const categoryConfig: Record<string, { icon: React.ReactNode; bgClass: string; iconClass: string }> = {
  flight: {
    icon: <Plane className="w-full h-full" />,
    bgClass: 'bg-blue-500',
    iconClass: 'text-white',
  },
  transport: {
    icon: <Train className="w-full h-full" />,
    bgClass: 'bg-indigo-500',
    iconClass: 'text-white',
  },
  bank: {
    icon: <Landmark className="w-full h-full" />,
    bgClass: 'bg-emerald-600',
    iconClass: 'text-white',
  },
  telecom: {
    icon: <Phone className="w-full h-full" />,
    bgClass: 'bg-violet-500',
    iconClass: 'text-white',
  },
  energy: {
    icon: <Zap className="w-full h-full" />,
    bgClass: 'bg-amber-500',
    iconClass: 'text-white',
  },
  ecommerce: {
    icon: <ShoppingCart className="w-full h-full" />,
    bgClass: 'bg-orange-500',
    iconClass: 'text-white',
  },
  automotive: {
    icon: <Car className="w-full h-full" />,
    bgClass: 'bg-slate-600',
    iconClass: 'text-white',
  },
  insurance: {
    icon: <Shield className="w-full h-full" />,
    bgClass: 'bg-cyan-600',
    iconClass: 'text-white',
  },
  warranty: {
    icon: <Package className="w-full h-full" />,
    bgClass: 'bg-rose-500',
    iconClass: 'text-white',
  },
  tech: {
    icon: <Smartphone className="w-full h-full" />,
    bgClass: 'bg-purple-600',
    iconClass: 'text-white',
  },
  class_action: {
    icon: <Users className="w-full h-full" />,
    bgClass: 'bg-red-600',
    iconClass: 'text-white',
  },
  other: {
    icon: <HelpCircle className="w-full h-full" />,
    bgClass: 'bg-gray-500',
    iconClass: 'text-white',
  },
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

interface CompanyLogoProps {
  category: string;
  matchedData?: Record<string, unknown>;
  opportunityTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogo({ 
  category, 
  matchedData,
  opportunityTitle,
  size = 'md',
  className 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const companyName = extractCompanyName(matchedData, opportunityTitle);
  const logoUrl = companyName ? companyLogos[companyName] : null;
  const config = categoryConfig[category] || categoryConfig.other;
  
  // Genera iniziali per fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Genera colore basato sul nome
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 45%)`;
  };
  
  // Se abbiamo un logo e non c'è errore, mostra il logo
  if (logoUrl && !imageError) {
    return (
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white p-1.5 border border-border/50",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={logoUrl}
          alt={companyName || 'Company logo'}
          className="w-full h-full object-contain rounded-lg"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }
  
  // Se abbiamo un nome azienda ma il logo non si carica, mostra iniziali colorate
  if (companyName && imageError) {
    return (
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: getColorFromName(companyName) }}
      >
        <span 
          className={cn(
            "font-bold text-white",
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}
        >
          {getInitials(companyName)}
        </span>
      </div>
    );
  }
  
  // Fallback: icona di categoria colorata
  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
        config.bgClass,
        sizeClasses[size],
        className
      )}
    >
      <div className={cn(iconSizeClasses[size], config.iconClass)}>
        {config.icon}
      </div>
    </div>
  );
}
