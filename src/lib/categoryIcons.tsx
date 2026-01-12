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
  type LucideIcon,
} from 'lucide-react';

// Mappa icone per categoria
export const categoryIcons: Record<string, LucideIcon> = {
  flight: Plane,
  transport: Train,
  bank: Landmark,
  telecom: Phone,
  energy: Zap,
  ecommerce: ShoppingCart,
  automotive: Car,
  insurance: Shield,
  warranty: Package,
  tech: Smartphone,
  class_action: Users,
  other: HelpCircle,
};

// Colori per categoria
export const categoryColors: Record<string, { bg: string; text: string }> = {
  flight: { bg: 'bg-blue-500', text: 'text-blue-500' },
  transport: { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  bank: { bg: 'bg-emerald-600', text: 'text-emerald-600' },
  telecom: { bg: 'bg-violet-500', text: 'text-violet-500' },
  energy: { bg: 'bg-amber-500', text: 'text-amber-500' },
  ecommerce: { bg: 'bg-orange-500', text: 'text-orange-500' },
  automotive: { bg: 'bg-slate-600', text: 'text-slate-600' },
  insurance: { bg: 'bg-cyan-600', text: 'text-cyan-600' },
  warranty: { bg: 'bg-rose-500', text: 'text-rose-500' },
  tech: { bg: 'bg-purple-600', text: 'text-purple-600' },
  class_action: { bg: 'bg-red-600', text: 'text-red-600' },
  other: { bg: 'bg-gray-500', text: 'text-gray-500' },
};

// Labels per categoria
export const categoryLabels: Record<string, string> = {
  flight: 'Voli',
  ecommerce: 'E-commerce',
  bank: 'Banche',
  insurance: 'Assicurazioni',
  warranty: 'Garanzia',
  telecom: 'Telecomunicazioni',
  energy: 'Energia',
  transport: 'Trasporti',
  automotive: 'Auto',
  tech: 'Tech/Privacy',
  class_action: 'Class Action',
  other: 'Altro',
};

// Helper per ottenere icona con fallback
export function getCategoryIcon(category: string): LucideIcon {
  return categoryIcons[category] || categoryIcons.other;
}

// Helper per ottenere colore con fallback
export function getCategoryColor(category: string): { bg: string; text: string } {
  return categoryColors[category] || categoryColors.other;
}

// Helper per ottenere label con fallback
export function getCategoryLabel(category: string): string {
  return categoryLabels[category] || 'Altro';
}
