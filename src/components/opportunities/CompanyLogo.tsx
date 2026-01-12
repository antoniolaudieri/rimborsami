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

// Configurazione colori per categoria (HSL format per tema)
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
  size = 'md',
  className 
}: CompanyLogoProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  
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
