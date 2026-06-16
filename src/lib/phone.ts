/** Deja solo dígitos (formato wa.me). */
export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/** Muestra un número argentino de forma legible (solo visual). */
export function formatPhoneDisplay(digits: string): string {
  const d = normalizePhoneNumber(digits);
  if (d.length < 10) return digits;
  if (d.startsWith('54') && d.length >= 12) {
    const rest = d.slice(2);
    const area = rest.slice(0, 1);
    const prefix = rest.slice(1, 5);
    const line = rest.slice(5, 7);
    const end = rest.slice(7);
    return `+54 ${area} ${prefix} ${line}-${end}`.trim();
  }
  return `+${d}`;
}
