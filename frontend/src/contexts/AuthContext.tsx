"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserType = "user" | "artisan";

export interface User {
  id: string;
  uid?: string;
  name: string;
  email?: string;
  phone?: string;
  type: UserType;
  avatar?: string;
  location?: string;
  state?: string;
  brandName?: string;
  artworkType?: string;
  bio?: string;
}

export const DEMO_USERS: Record<UserType, User> = {
  artisan: {
    id: "demo-artisan-1",
    uid: "demo-artisan-1",
    name: "Ramesh Kumar (Master Artisan)",
    email: "artisan@karigarsetu.com",
    phone: "+91 98765 43210",
    type: "artisan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
    location: "Jaipur, Rajasthan",
    state: "Rajasthan",
    brandName: "Jaipur Blue Craft",
    artworkType: "Pottery",
    bio: "Preserving Jaipur's 400-year-old traditional blue pottery art through handcrafted ceramic masterpieces.",
  },
  user: {
    id: "demo-customer-1",
    uid: "demo-customer-1",
    name: "Priya Sharma",
    email: "customer@karigarsetu.com",
    phone: "+91 91234 56789",
    type: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    bio: "Art enthusiast supporting traditional handcrafted heritage from Indian artisans.",
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (userData: User) => void;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored authentication data on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // ensure uid alias is present
        if (userData && !userData.uid && userData.id) {
          userData.uid = userData.id;
        }
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const signIn = (userData: User) => {
    const formattedUser: User = {
      ...userData,
      uid: userData.uid || userData.id,
    };
    setUser(formattedUser);
    localStorage.setItem("user", JSON.stringify(formattedUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: User = {
        ...prev,
        ...userData,
        uid: userData.id || userData.uid || prev.uid || prev.id,
      };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
