'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, ProductVariant, Product } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (variant: ProductVariant, product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultCart: Cart = {
  id: 'local_cart',
  items: [],
  subtotal: 0,
  totalItems: 0,
  quoteRequiredCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [isLoading, setIsLoading] = useState(false);

  // Recalculate totals helper
  const calculateTotals = (items: CartItem[]): Cart => {
    let subtotal = 0;
    let quoteRequiredCount = 0;
    let totalItems = 0;

    for (const item of items) {
      totalItems += item.quantity;
      if (item.variant?.price) {
        subtotal += item.variant.price * item.quantity;
      } else {
        quoteRequiredCount++;
      }
    }

    return {
      id: cart.id || 'cart',
      items,
      subtotal,
      totalItems,
      quoteRequiredCount,
    };
  };

  const refreshCart = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        const res = await api.getCart();
        if (res?.cart) {
          setCart(res.cart);
        }
      } catch (err) {
        console.warn('Failed to fetch server cart, using local cache');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Load from localStorage for guest
      try {
        const saved = localStorage.getItem('pcp_guest_cart');
        if (saved) {
          const parsedItems = JSON.parse(saved);
          setCart(calculateTotals(parsedItems));
        }
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (
    variant: ProductVariant,
    product: Product,
    quantity: number = 1
  ) => {
    if (user) {
      setIsLoading(true);
      try {
        await api.addToCart(variant.id, quantity);
        await refreshCart();
      } catch (err: any) {
        alert(err.message || 'Failed to add item to cart');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest cart
      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex((i) => i.variantId === variant.id);

      if (existingIdx > -1) {
        currentItems[existingIdx].quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `guest_item_${Date.now()}_${Math.random()}`,
          cartId: 'guest_cart',
          variantId: variant.id,
          quantity,
          variant: {
            ...variant,
            product,
          },
        };
        currentItems.push(newItem);
      }

      const updated = calculateTotals(currentItems);
      setCart(updated);
      localStorage.setItem('pcp_guest_cart', JSON.stringify(currentItems));
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    if (user) {
      try {
        await api.updateCartItem(itemId, quantity);
        await refreshCart();
      } catch (err: any) {
        alert(err.message || 'Failed to update quantity');
      }
    } else {
      const currentItems = cart.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      const updated = calculateTotals(currentItems);
      setCart(updated);
      localStorage.setItem('pcp_guest_cart', JSON.stringify(currentItems));
    }
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      try {
        await api.removeCartItem(itemId);
        await refreshCart();
      } catch (err: any) {
        console.error('Failed to remove cart item:', err);
      }
    } else {
      const currentItems = cart.items.filter((i) => i.id !== itemId);
      const updated = calculateTotals(currentItems);
      setCart(updated);
      localStorage.setItem('pcp_guest_cart', JSON.stringify(currentItems));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
        setCart(defaultCart);
      } catch {}
    } else {
      localStorage.removeItem('pcp_guest_cart');
      setCart(defaultCart);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
