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
  const lines: string[] = [];

  lines.push('Hola RUQLA!');
  lines.push('Me interesa este producto:');
  lines.push('');
  lines.push(`*${product.name.trim()}*`);
  lines.push(
    `- Cantidad: ${quantity} x $${Number(product.price).toLocaleString('es-AR')} c/u`
  );
  lines.push(
    `- Total estimado: $${(Number(product.price) * quantity).toLocaleString('es-AR')}`
  );
  if (product.description?.trim()) {
    lines.push('');
    lines.push(product.description.trim().slice(0, 280));
  }
  lines.push('');
  lines.push('Podrian confirmarme stock, envio y formas de pago? Gracias!');

  return buildWhatsAppUrl(lines.join('\n'), phoneNumber);
}

export const generateWhatsAppLink = (
  cartItems: CartItem[],
  customerData: CustomerData,
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER
): string => {
  const lines: string[] = [];

  lines.push('Hola RUQLA!');
  lines.push(
    `Mi nombre es *${customerData.name.trim()}* y me gustaria confirmar el siguiente pedido:`
  );
  lines.push('');
  lines.push('*DETALLE DEL PEDIDO:*');
  lines.push('------------------------');

  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = Number(item.product.price) * item.quantity;
    total += itemTotal;

    lines.push(`${index + 1}. *${item.product.name}*`);
    lines.push(
      `   Cantidad: ${item.quantity} x $${Number(item.product.price).toLocaleString('es-AR')}`
    );
    lines.push(`   Subtotal: $${itemTotal.toLocaleString('es-AR')}`);
    lines.push('');
  });

  lines.push('------------------------');
  lines.push(`*TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*`);
  lines.push('');
  lines.push(
    'Por favor, indiquenme los pasos para coordinar el pago y envio. Gracias!'
  );

  return buildWhatsAppUrl(lines.join('\n'), phoneNumber);
};

/** Abre WhatsApp. En móvil navega en la misma pestaña; en desktop, solo en una nueva. */
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

  // noopener hace que window.open devuelva null aunque la pestaña se abra;
  // un <a target="_blank"> evita redirigir la pestaña actual por error.
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
