import { CartItem } from '@/context/CartContext';
import { normalizePhoneNumber } from '@/lib/phone';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/store-settings-defaults';
import type { Product } from '@/types';

type CustomerData = {
  name: string;
  phone: string;
};

export function buildWhatsAppUrl(
  message: string,
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER
): string {
  const digitsOnly = normalizePhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
}

/** Consulta directa por un producto desde la ficha (sin pasar por el carrito). */
export function generateProductWhatsAppLink(
  product: Pick<Product, 'name' | 'price' | 'description'>,
  quantity = 1,
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER
): string {
  const emojiHola = '\u{1F44B}';
  const emojiFlecha = '\u{25B6}';
  const lines: string[] = [];

  lines.push(`¡Hola RUQLA! ${emojiHola}`);
  lines.push('Me interesa este producto:');
  lines.push('');
  lines.push(`*${product.name.trim()}*`);
  lines.push(
    `${emojiFlecha} Cantidad: ${quantity} · $${Number(product.price).toLocaleString('es-AR')} c/u`
  );
  lines.push(
    `${emojiFlecha} Total estimado: $${(Number(product.price) * quantity).toLocaleString('es-AR')}`
  );
  if (product.description?.trim()) {
    lines.push('');
    lines.push(`_${product.description.trim().slice(0, 280)}_`);
  }
  lines.push('');
  lines.push('¿Podrían confirmarme stock, envío y formas de pago? ¡Gracias!');

  return buildWhatsAppUrl(lines.join('\n'), phoneNumber);
}

export const generateWhatsAppLink = (
  cartItems: CartItem[],
  customerData: CustomerData,
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER
): string => {
  const emojiSaludo = '\u{1F44B}';
  const emojiCarrito = '\u{1F6D2}';
  const emojiFlecha = '\u{25B6}';
  const emojiBolsa = '\u{1F4B0}';
  const emojiCohete = '\u{1F680}';

  const lines: string[] = [];

  lines.push(`¡Hola RUQLA! ${emojiSaludo}`);
  lines.push(
    `Mi nombre es *${customerData.name.trim()}* y me gustaría confirmar el siguiente pedido:`
  );
  lines.push('');
  lines.push(`${emojiCarrito} *DETALLE DEL PEDIDO:*`);
  lines.push(`------------------------`);

  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = Number(item.product.price) * item.quantity;
    total += itemTotal;

    lines.push(`${index + 1}. *${item.product.name}*`);
    lines.push(
      `   ${emojiFlecha} Cantidad: ${item.quantity} x $${Number(item.product.price).toLocaleString('es-AR')}`
    );
    lines.push(`   ${emojiFlecha} Subtotal: $${itemTotal.toLocaleString('es-AR')}`);
    lines.push('');
  });

  lines.push(`------------------------`);
  lines.push(`${emojiBolsa} *TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*`);
  lines.push('');
  lines.push(
    `Por favor, indíquenme los pasos para coordinar el pago y envío. ¡Gracias! ${emojiCohete}`
  );

  return buildWhatsAppUrl(lines.join('\n'), phoneNumber);
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
