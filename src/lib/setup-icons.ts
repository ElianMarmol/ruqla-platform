import {
  Box,
  Cable,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Monitor,
  Smartphone,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const SETUP_ICON_OPTIONS = [
  { value: 'box', label: 'Caja / Fundas' },
  { value: 'zap', label: 'Rayo / Cargadores' },
  { value: 'monitor', label: 'Monitor / PC' },
  { value: 'smartphone', label: 'Celular' },
  { value: 'watch', label: 'Reloj / Smartwatches' },
  { value: 'headphones', label: 'Auriculares' },
  { value: 'cable', label: 'Cables' },
  { value: 'cpu', label: 'Procesador' },
  { value: 'hard-drive', label: 'Almacenamiento' },
  { value: 'gamepad2', label: 'Gaming' },
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  box: Box,
  zap: Zap,
  monitor: Monitor,
  smartphone: Smartphone,
  watch: Watch,
  headphones: Headphones,
  cable: Cable,
  cpu: Cpu,
  'hard-drive': HardDrive,
  gamepad2: Gamepad2,
};

export function getSetupIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey.toLowerCase()] ?? Box;
}
