"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  name: string;
  artist: string;
  state: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  rating: number;
  inStock: boolean;
  stockCount?: number;
}

export interface WishlistItem {
  id: string | number;
  name: string;
  artist?: string;
  state?: string;
  price?: number;
  image?: string;
}

export interface Order {
  id: string;
  trackingId: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'online' | 'cod';
  address?: {
    name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  createdAt: string;
  status: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  wishlist: WishlistItem[];
  orders: Order[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => boolean;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string | number) => boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string | number) => boolean;
  placeOrder: (order: Omit<Order, 'id' | 'trackingId' | 'createdAt' | 'status'> & { trackingId?: string }) => Order;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const cartData = JSON.parse(storedCart);
        setCartItems(cartData);
      } catch (error) {
        console.error("Error parsing stored cart data:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Load wishlist
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing wishlist', e);
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  // Load orders
  useEffect(() => {
    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing orders', e);
        localStorage.removeItem('orders');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Sign in first to buy.");
        return false;
      }
    }

    let toastMessage = "";
    let toastVariant: "success" | "error" = "success";

    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => String(cartItem.id) === String(item.id));
      
      if (existingItem) {
        // Item already in cart, update quantity
        const newQuantity = existingItem.quantity + quantity;
        const maxStock = item.stockCount ?? 99;
        
        if (newQuantity > maxStock) {
          toastMessage = `Cannot add more items. Only ${maxStock} in stock.`;
          toastVariant = "error";
          return prevItems;
        }
        
        toastMessage = `Updated ${item.name} quantity to ${newQuantity}`;
        return prevItems.map(cartItem =>
          String(cartItem.id) === String(item.id)
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // New item, add to cart
        const newItem: CartItem = { ...item, quantity };
        toastMessage = `${item.name} added to cart!`;
        return [...prevItems, newItem];
      }
    });

    if (toastMessage) {
      toast[toastVariant](toastMessage);
    }

    return true;
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.some(i => String(i.id) === String(item.id))) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlist(prev => prev.filter(i => String(i.id) !== String(id)));
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.some(i => String(i.id) === String(item.id))) {
        return prev.filter(i => String(i.id) !== String(item.id));
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (id: string | number) => {
    return wishlist.some(i => String(i.id) === String(id));
  };

  const placeOrder = (order: Omit<Order, 'id' | 'trackingId' | 'createdAt' | 'status'> & { trackingId?: string }): Order => {
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      trackingId: order.trackingId || `TRK${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'placed',
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const removeFromCart = (id: string | number) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => String(item.id) === String(id));
      if (item) {
        toast.success(`${item.name} removed from cart`);
      }
      return prevItems.filter(item => String(item.id) !== String(id));
    });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (String(item.id) === String(id)) {
          const maxStock = item.stockCount ?? 99;
          if (quantity > maxStock) {
            toast.error(`Cannot add more items. Only ${maxStock} in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const isInCart = (id: string | number) => {
    return cartItems.some(item => String(item.id) === String(id));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    wishlist,
    orders,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
