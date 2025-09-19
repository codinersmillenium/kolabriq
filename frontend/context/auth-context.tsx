'use client'

import { authClient, callbackSignIn, ensureClient, getPrincipal, identity, initActor, signOut } from '@/lib/canisters'
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
  const [loading, setLoading] = useState<boolean>(true)

  const router = useRouter()

  const isAuth = async () => {
    await ensureClient();

    const isAuthenticated = await authClient!.isAuthenticated();
    const sign = await callbackSignIn()

    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!sign) {
      router.replace('/register')
    } else {
      const actor_ = await initActor()
      const { ok }: any = await actor_.getUserDetail(identity.getPrincipal())
      setUser(ok)
    }

    setIsAuthenticated(isAuthenticated)
    setLoading(false)
  }

  useEffect(() => {
    isAuth()
  }, [])

  const logout = () => {
    signOut()
    setIsAuthenticated(false);
    window.location.href = '/login'
  };

  if (loading) {
    return AnimatedLoading();
  }

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

const AnimatedLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="text-center">
        {/* Logo Container with Multiple Animations */}
        <div className="relative mb-8">
          {/* Rotating Border Ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-transparent rounded-lg animate-spin" style={{ borderTopColor: '#11B4B1', borderRightColor: '#2E3F46' }}></div>

          {/* Pulsing Outer Glow */}
          <div className="absolute inset-2 w-28 h-28 mx-auto rounded-lg opacity-20 animate-pulse" style={{ background: 'linear-gradient(45deg, #11B4B1, #2E3F46)' }}></div>

          {/* Logo Container */}
          <div className="relative w-32 h-32 mx-auto bg-white rounded-lg shadow-2xl flex items-center justify-center animate-bounce" style={{ boxShadow: '0 25px 50px -12px rgba(17, 180, 177, 0.25)' }}>
            <img
              src="/images/logos.png"
              alt="Kolabriq Logo"
              className="w-20 h-20 rounded-md animate-pulse"
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute top-0 left-8 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#11B4B1' }}></div>
          <div className="absolute top-8 right-4 w-1 h-1 rounded-full animate-ping animation-delay-100" style={{ backgroundColor: '#2E3F46' }}></div>
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full animate-ping animation-delay-200" style={{ backgroundColor: '#11B4B1' }}></div>
          <div className="absolute bottom-0 right-8 w-2 h-2 rounded-full animate-ping animation-delay-300" style={{ backgroundColor: '#2E3F46' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-progress {
          0% { width: 0% }
          50% { width: 70% }
          100% { width: 100% }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.5 }
          50% { opacity: 1 }
        }
        
        .animate-loading-progress {
          animation: loading-progress 2s ease-in-out infinite;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};
