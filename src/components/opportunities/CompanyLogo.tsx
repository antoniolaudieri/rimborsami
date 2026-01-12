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

// Import local SVG logos
import ryanairLogo from "@/assets/logos/ryanair.svg";
import easyjetLogo from "@/assets/logos/easyjet.svg";
import lufthansaLogo from "@/assets/logos/lufthansa.svg";
import vodafoneLogo from "@/assets/logos/vodafone.svg";
import googleLogo from "@/assets/logos/google.svg";
import appleLogo from "@/assets/logos/apple.svg";
import metaLogo from "@/assets/logos/meta.svg";
import zalandoLogo from "@/assets/logos/zalando.svg";
import netflixLogo from "@/assets/logos/netflix.svg";
import spotifyLogo from "@/assets/logos/spotify.svg";
import airbnbLogo from "@/assets/logos/airbnb.svg";
import paypalLogo from "@/assets/logos/paypal.svg";
import aliexpressLogo from "@/assets/logos/aliexpress.svg";
import uberLogo from "@/assets/logos/uber.svg";
import bookingLogo from "@/assets/logos/booking.svg";
import revolutLogo from "@/assets/logos/revolut.svg";
import n26Logo from "@/assets/logos/n26.svg";
import ebayLogo from "@/assets/logos/ebay.svg";
import samsungLogo from "@/assets/logos/samsung.svg";

// Mappa loghi aziendali locali
const companyLogos: Record<string, string> = {
  // Airlines
  ryanair: ryanairLogo,
  easyjet: easyjetLogo,
  lufthansa: lufthansaLogo,
  
  // Big Tech
  google: googleLogo,
  apple: appleLogo,
  meta: metaLogo,
  facebook: metaLogo,
  netflix: netflixLogo,
  spotify: spotifyLogo,
  samsung: samsungLogo,
  
  // Telecom
  vodafone: vodafoneLogo,
  
  // E-commerce
  zalando: zalandoLogo,
  ebay: ebayLogo,
  aliexpress: aliexpressLogo,
  
  // Travel & Booking
  airbnb: airbnbLogo,
  booking: bookingLogo,
  'booking.com': bookingLogo,
  
  // Fintech
  paypal: paypalLogo,
  revolut: revolutLogo,
  n26: n26Logo,
  
  // Transport
  uber: uberLogo,
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
  const logoSrc = companyName ? companyLogos[companyName] : null;
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
  
  // Se abbiamo un logo locale e non c'è errore, mostra il logo
  if (logoSrc && !imageError) {
    return (
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white p-2 border border-border/50",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={logoSrc}
          alt={companyName || 'Company logo'}
          className="w-full h-full object-contain"
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
