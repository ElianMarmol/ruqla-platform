import { CartItem } from '@/context/CartContext';

type CustomerData = {
  name: string;
  phone: string;
};

export const generateWhatsAppLink = (cartItems: CartItem[], customerData: CustomerData): string => {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';

  // Declaramos las secuencias de escape de forma segura (Inmunes a la codificación del archivo)
  const emojiSaludo = '\u{1F44B}'; // 👋
  const emojiCarrito = '\u{1F6D2}'; // 🛒
  const emojiFlecha = '\u{25B6}';  // ▶
  const emojiBolsa = '\u{1F4B0}'; // 💰
  const emojiCohete = '\u{1F680}'; // 🚀

  const lines: string[] = [];

  lines.push(`¡Hola RUQLA! ${emojiSaludo}`);
  lines.push(`Mi nombre es *${customerData.name.trim()}* y me gustaría confirmar el siguiente pedido:`);
  lines.push('');
  lines.push(`${emojiCarrito} *DETALLE DEL PEDIDO:*`);
  lines.push(`------------------------`);

  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = Number(item.product.price) * item.quantity;
    total += itemTotal;

    lines.push(`${index + 1}. *${item.product.name}*`);
    lines.push(`   ${emojiFlecha} Cantidad: ${item.quantity} x $${Number(item.product.price).toLocaleString('es-AR')}`);
    lines.push(`   ${emojiFlecha} Subtotal: $${itemTotal.toLocaleString('es-AR')}`);
    lines.push('');
  });

  lines.push(`------------------------`);
  lines.push(`${emojiBolsa} *TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*`);
  lines.push('');
  lines.push(`Por favor, indíquenme los pasos para coordinar el pago y envío. ¡Gracias! ${emojiCohete}`);

  const message = lines.join('\n');
  const encodedMessage = encodeURIComponent(message);
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // wa.me abre la app nativa con más confiabilidad en móviles que api.whatsapp.com
  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
};

/** Abre WhatsApp. En móvil usa navegación directa (evita bloqueo de popups tras fetch async). */
export function openWhatsAppLink(url: string): void {
  if (typeof window === 'undefined') return;

  const isMobile =
    window.matchMedia('(max-width: 768px)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    window.location.assign(url);
    return;
  }

  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    window.location.assign(url);
  }
}