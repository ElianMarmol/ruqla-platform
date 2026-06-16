'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  /** true después de leer localStorage en el cliente (evita hydration mismatch) */
  isCartHydrated: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hidratar desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('ruqla_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parseando el carrito local', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Persistir en localStorage ante cualquier cambio
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('ruqla_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    const maxStock = Math.max(0, Number(product.stock) || 0);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        const desiredQty = existing.quantity + quantity;
        const newQty = Math.min(desiredQty, maxStock);

        if (newQty <= existing.quantity) {
          toast.warning('No hay más stock disponible');
          return prev;
        }

        if (newQty < desiredQty) {
          toast.warning('No hay más stock disponible');
        } else {
          toast.success('Producto agregado al carrito.');
        }

        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }

      if (maxStock === 0) {
        toast.warning('No hay más stock disponible');
        return prev;
      }

      const initialQty = Math.min(quantity, maxStock);

      if (initialQty < quantity) {
        toast.warning('No hay más stock disponible');
      } else {
        toast.success('Producto agregado al carrito.');
      }

      return [...prev, { product, quantity: initialQty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = Math.max(0, Number(item.product.stock) || 0);
          const newQty = Math.max(1, Math.min(quantity, maxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      isCartHydrated: isInitialized,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
