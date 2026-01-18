import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, CartItem, ProductWeight } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedWeight?: ProductWeight) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const localData = window.localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart items from localStorage", error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    // This effect runs once after initial render to set loading to false
    setIsLoading(false);
    try {
      window.localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error("Could not save cart items to localStorage", error);
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1, selectedWeight?: ProductWeight) => {
    setItems(prev => {
      const itemKey = selectedWeight ? `${product.id}-${selectedWeight.id}` : product.id;
      const existingItem = prev.find(item => {
        const existingKey = item.selectedWeight ? `${item.product.id}-${item.selectedWeight.id}` : item.product.id;
        return existingKey === itemKey;
      });
      if (existingItem) {
        return prev.map(item => {
          const existingKey = item.selectedWeight ? `${item.product.id}-${item.selectedWeight.id}` : item.product.id;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prev, { product, quantity, selectedWeight }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
