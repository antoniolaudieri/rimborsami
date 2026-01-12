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

// Mappa loghi aziendali pubblici
const companyLogos: Record<string, string> = {
  // Class Action / Tech
  google: 'https://logo.clearbit.com/google.com',
  apple: 'https://logo.clearbit.com/apple.com',
  meta: 'https://logo.clearbit.com/meta.com',
  facebook: 'https://logo.clearbit.com/facebook.com',
  tiktok: 'https://logo.clearbit.com/tiktok.com',
  amazon: 'https://logo.clearbit.com/amazon.com',
  microsoft: 'https://logo.clearbit.com/microsoft.com',
  
  // Automotive
  volkswagen: 'https://logo.clearbit.com/volkswagen.com',
  stellantis: 'https://logo.clearbit.com/stellantis.com',
  citroen: 'https://logo.clearbit.com/citroen.com',
  citroën: 'https://logo.clearbit.com/citroen.com',
  opel: 'https://logo.clearbit.com/opel.com',
  fiat: 'https://logo.clearbit.com/fiat.com',
  peugeot: 'https://logo.clearbit.com/peugeot.com',
  renault: 'https://logo.clearbit.com/renault.com',
  bmw: 'https://logo.clearbit.com/bmw.com',
  mercedes: 'https://logo.clearbit.com/mercedes-benz.com',
  audi: 'https://logo.clearbit.com/audi.com',
  toyota: 'https://logo.clearbit.com/toyota.com',
  ford: 'https://logo.clearbit.com/ford.com',
  
  // Airlines
  ryanair: 'https://logo.clearbit.com/ryanair.com',
  easyjet: 'https://logo.clearbit.com/easyjet.com',
  vueling: 'https://logo.clearbit.com/vueling.com',
  wizzair: 'https://logo.clearbit.com/wizzair.com',
  'wizz air': 'https://logo.clearbit.com/wizzair.com',
  lufthansa: 'https://logo.clearbit.com/lufthansa.com',
  'air france': 'https://logo.clearbit.com/airfrance.com',
  airfrance: 'https://logo.clearbit.com/airfrance.com',
  alitalia: 'https://logo.clearbit.com/alitalia.com',
  ita: 'https://logo.clearbit.com/ita-airways.com',
  'ita airways': 'https://logo.clearbit.com/ita-airways.com',
  emirates: 'https://logo.clearbit.com/emirates.com',
  british: 'https://logo.clearbit.com/britishairways.com',
  klm: 'https://logo.clearbit.com/klm.com',
  
  // Banks
  intesa: 'https://logo.clearbit.com/intesasanpaolo.com',
  'intesa sanpaolo': 'https://logo.clearbit.com/intesasanpaolo.com',
  unicredit: 'https://logo.clearbit.com/unicredit.it',
  bnl: 'https://logo.clearbit.com/bnl.it',
  fineco: 'https://logo.clearbit.com/finecobank.com',
  ing: 'https://logo.clearbit.com/ing.com',
  n26: 'https://logo.clearbit.com/n26.com',
  mediolanum: 'https://logo.clearbit.com/bancamediolanum.it',
  'monte paschi': 'https://logo.clearbit.com/mps.it',
  mps: 'https://logo.clearbit.com/mps.it',
  
  // Telecom
  tim: 'https://logo.clearbit.com/tim.it',
  vodafone: 'https://logo.clearbit.com/vodafone.it',
  windtre: 'https://logo.clearbit.com/windtre.it',
  'wind tre': 'https://logo.clearbit.com/windtre.it',
  wind: 'https://logo.clearbit.com/windtre.it',
  iliad: 'https://logo.clearbit.com/iliad.it',
  fastweb: 'https://logo.clearbit.com/fastweb.it',
  sky: 'https://logo.clearbit.com/sky.it',
  
  // Energy
  enel: 'https://logo.clearbit.com/enel.it',
  eni: 'https://logo.clearbit.com/eni.com',
  a2a: 'https://logo.clearbit.com/a2a.eu',
  iren: 'https://logo.clearbit.com/irenenergia.it',
  edison: 'https://logo.clearbit.com/edison.it',
  sorgenia: 'https://logo.clearbit.com/sorgenia.it',
  
  // E-commerce
  ebay: 'https://logo.clearbit.com/ebay.com',
  zalando: 'https://logo.clearbit.com/zalando.com',
  shein: 'https://logo.clearbit.com/shein.com',
  eprice: 'https://logo.clearbit.com/eprice.it',
  'e-price': 'https://logo.clearbit.com/eprice.it',
  mediaworld: 'https://logo.clearbit.com/mediaworld.it',
  unieuro: 'https://logo.clearbit.com/unieuro.it',
  
  // Transport
  trenitalia: 'https://logo.clearbit.com/trenitalia.com',
  italo: 'https://logo.clearbit.com/italotreno.it',
  flixbus: 'https://logo.clearbit.com/flixbus.com',
  
  // Insurance
  generali: 'https://logo.clearbit.com/generali.it',
  allianz: 'https://logo.clearbit.com/allianz.it',
  unipol: 'https://logo.clearbit.com/unipolsai.it',
  axa: 'https://logo.clearbit.com/axa.it',
  zurich: 'https://logo.clearbit.com/zurich.it',
  
  // Other
  infocert: 'https://logo.clearbit.com/infocert.it',
  poste: 'https://logo.clearbit.com/poste.it',
  'poste italiane': 'https://logo.clearbit.com/poste.it',
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
