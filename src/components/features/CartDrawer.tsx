'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { getProductHref } from '@/lib/product-url';
import { generateWhatsAppLink, openWhatsAppLink } from '@/services/whatsapp';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TruncatedText } from '@/components/ui/truncated-text';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { whatsappNumber } = useStoreSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isCartOpen && cartItems.length === 0 && !isSubmitting) {
    // Si no está abierto y está vacío, podemos no renderizar nada para ahorrar recursos, 
    // pero si queremos la animación de cierre, debemos mantenerlo montado o manejarlo con delays.
    // Para simplificar, lo ocultamos mediante pointer-events y opacidad en el wrapper.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos
    
    // 1. Sanitización y Validación Estricta
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    // Validación de teléfono (permite el prefijo +, números, espacios y guiones)
    const phoneRegex = /^\+?[\d\s\-]{8,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Por favor, ingresá un número de teléfono válido.');
      return;
    }
    
    // 2. Estado de Carga (Prevención de Race Conditions)
    setIsSubmitting(true);

    try {
      // 3. Auditoría en Supabase
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: trimmedName,
          customer_phone: trimmedPhone,
          total: cartTotal,
          items: cartItems
        }),
      });

      if (!response.ok) {
        throw new Error('El backend falló al registrar el pedido.');
      }

      // 4. Éxito: Generar link de WhatsApp y finalizar
      const waLink = generateWhatsAppLink(cartItems, {
        name: trimmedName,
        phone: trimmedPhone,
      }, whatsappNumber);
      openWhatsAppLink(waLink);
      
      // Solo limpiamos si el registro en DB fue exitoso
      clearCart();
      closeCart();
      setName('');
      setPhone('');
    } catch (err: any) {
      console.error('Submit Error:', err);
      // 5. Manejo de Errores: Preservamos el carrito para no perder la venta
      setError('Hubo un problema al registrar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false); // Liberar el botón
    }
  };


  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-background shadow-2xl">
        <SheetHeader className="p-6 border-b border-border bg-card text-left">
          <SheetTitle className="font-sans font-bold text-2xl text-foreground">Tu Carrito</SheetTitle>
        </SheetHeader>

        {/* Content (Listado de productos) */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-sans font-bold text-xl text-foreground">Tu carrito está vacío</p>
              <p className="font-body text-muted-foreground">¿No sabés qué comprar? Miles de productos te esperan.</p>
              <Button 
                onClick={closeCart}
                className="mt-6 font-bold rounded-full hover:shadow-[0_0_15px_rgba(159,192,48,0.4)] transition-all"
              >
                Seguir Comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-start bg-card p-4 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                  <div className="w-20 h-20 bg-muted rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-border">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-muted rounded" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={getProductHref(item.product.id)}
                        onClick={closeCart}
                        className="block min-w-0 max-w-full hover:text-primary transition-colors"
                      >
                        <TruncatedText
                          text={item.product.name}
                          className="font-sans font-bold text-sm text-foreground"
                        />
                      </Link>
                      <p className="font-body text-xs text-primary font-bold mb-2">${Number(item.product.price).toLocaleString('es-AR')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-background border border-border rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 py-1 text-muted-foreground hover:text-foreground font-bold"
                        >
                          -
                        </button>
                        <span className="font-body text-sm px-2 min-w-[28px] text-center font-semibold text-foreground">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="px-3 py-1 text-muted-foreground hover:text-foreground font-bold disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-muted-foreground hover:text-destructive font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Formulario */}
        {cartItems.length > 0 && (
          <SheetFooter className="border-t border-border p-6 bg-card flex flex-col sm:flex-col items-stretch space-y-0">
            <div className="flex justify-between items-center mb-6 w-full">
              <span className="font-body text-muted-foreground font-bold">Total a pagar</span>
              <span className="font-sans font-extrabold text-3xl text-foreground">
                ${cartTotal.toLocaleString('es-AR')}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div>
                <Input
                  type="text"
                  placeholder="Nombre Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full font-body bg-accent/5 focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-transparent py-6 rounded-xl"
                  required
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Teléfono (ej: +54 9 11...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full font-body bg-accent/5 focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-transparent py-6 rounded-xl"
                  required
                />
              </div>

              {error && <p className="text-destructive text-sm font-body font-bold">{error}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 font-sans font-bold text-lg rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(159,192,48,0.4)] mt-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Procesando pedido...</span>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Enviar por WhatsApp
                  </>
                )}
              </Button>
            </form>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
