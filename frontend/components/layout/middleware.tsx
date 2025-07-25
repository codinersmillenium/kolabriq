'use client'
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react';

export const Middleware = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter()
    useEffect(() => {
        // login()
        // console.log(isAuthenticated)
        if (!isAuthenticated) {
            alert('Login Not Valid...')
            router.push('/login')
        }
    }, [isAuthenticated])

    if (!isAuthenticated) return null

    return <>{ children }</>
}