import type { Metadata } from 'next'
import '@/app/globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
    title: 'Kolabriq',
    description: 'SASS Project Management By Kolabriq',
}

const PlusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
})

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="scroll-smooth light">
            <body
                className={cn(
                    'text-gray bg-gray-400 text-sm/[22px] font-normal antialiased',
                    PlusJakartaSans.className,
                )}
            >
                {children}
            </body>
        </html>
    )
}
