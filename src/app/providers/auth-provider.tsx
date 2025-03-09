'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AuthState, 
  loadAuthFromStorage, 
  saveAuthToStorage, 
  signOut as authSignOut,
  generateSignInLink,
  verifySignIn,
  getUserProfile
} from '@/lib/auth';

// Create the context
interface AuthContextType {
  auth: AuthState | null;
  isLoading: boolean;
  signIn: (redirectUrl: string) => Promise<{ token: string, url: string }>;
  signOut: () => void;
  verifyAuth: (token: string) => Promise<AuthState>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from storage on mount
  useEffect(() => {
    const storedAuth = loadAuthFromStorage();
    if (storedAuth) {
      setAuth(storedAuth);
    }
    setIsLoading(false);
  }, []);

  // Sign in function
  const signIn = async (redirectUrl: string) => {
    return await generateSignInLink(redirectUrl);
  };

  // Verify auth function
  const verifyAuth = async (token: string) => {
    setIsLoading(true);
    try {
      const authState = await verifySignIn(token);
      setAuth(authState);
      return authState;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    authSignOut();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, isLoading, signIn, signOut, verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}