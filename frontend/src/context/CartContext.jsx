import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../auth/AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCartCount = async () => {
    if (user) {
      try {
        const cart = await cartApi.getCart();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (err) {
        console.error("Failed to fetch cart count", err);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, isCartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
