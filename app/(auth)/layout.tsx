import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { AuthProvider } from '@/context/auth-context'

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    return (
        <AuthProvider>
            <div>
                <Header />
                <Sidebar />
                <div id="main-content" className="p-4 transition-all lg:ml-[260px] mt-[60px]">
                    {children}
                </div>
            </div>
        </AuthProvider>
    )
}
