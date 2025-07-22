'use client'

import { callbackSignIn, signOut } from '@/lib/canisters';
import { AuthClient } from '@dfinity/auth-client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const router = useRouter()

  const isAuth = async () => {
    const authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    const sign = await callbackSignIn()
    if (!isAuthenticated) {
      alert('Login Not Valid...')
      router.replace('/login')
    } else if (!sign) {
      alert('User Not Regist...')
      router.replace('/register')
    }
    setIsAuthenticated(isAuthenticated)
  }

  useEffect(() => {
    isAuth()
  }, [])

  const logout = () => {
    signOut()
    setIsAuthenticated(false);
    window.location.href = '/login'
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
