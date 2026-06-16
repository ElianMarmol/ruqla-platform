import {
  CreditCard,
  Gift,
  Headphones,
  MessageCircle,
  Package,
  Shield,
  ShieldCheck,
  Star,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const TOP_BAR_ICON_OPTIONS = [
  { value: 'truck', label: 'Envíos / Camión' },
  { value: 'credit-card', label: 'Pagos / Tarjeta' },
  { value: 'shield-check', label: 'Seguridad (check)' },
  { value: 'shield', label: 'Garantía / Escudo' },
  { value: 'star', label: 'Calidad / Estrella' },
  { value: 'gift', label: 'Regalo / Promo' },
  { value: 'zap', label: 'Rápido / Rayo' },
  { value: 'package', label: 'Paquete' },
  { value: 'headphones', label: 'Atención' },
  { value: 'message-circle', label: 'WhatsApp / Mensaje' },
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  'credit-card': CreditCard,
  'shield-check': ShieldCheck,
  shield: Shield,
  star: Star,
  gift: Gift,
  zap: Zap,
  package: Package,
  headphones: Headphones,
  'message-circle': MessageCircle,
};

export function getTopBarIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey.toLowerCase()] ?? Truck;
}
