'use client'

import { callbackSignIn, getPrincipal, initActor, signOut } from '@/lib/canisters'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AuthContextType = {
  isAuthenticated: boolean
  user: object
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<object>({})
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
    } else {
      const identity = authClient.getIdentity().getPrincipal().toString()
      const actor_ = await initActor()
      const { ok }: any = await actor_.getUserDetail(Principal.fromText(identity))
      setUser(ok)
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
    <AuthContext.Provider value={{ isAuthenticated, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
