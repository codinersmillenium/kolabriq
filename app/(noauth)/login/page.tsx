'use client'
import DfinityLogo from '@/components/icons/dfinity-logo'
import IconFacebook from '@/components/icons/icon-facebook'
import IconGoogle from '@/components/icons/icon-google'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { callbackSignIn, signIn, signOut } from '@/lib/canisters'
import { AtSign, TriangleAlert, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Login() {

    const router = useRouter()
    const callbackAfter = async () => {
        const sign = await callbackSignIn()
        if (sign !== 'init') {
            if (sign) {
                router.push('/')
            } else {
                router.push('./register')
            }
        }
    }
    useEffect(() => {
        callbackAfter()
    }, [])
    return (
        <div className="grid h-screen w-full gap-5 p-4 md:grid-cols-2">
            <div className="relative hidden overflow-hidden rounded-[20px] bg-[#3B06D2] p-4 md:block md:h-full">
                <Image
                    src="/images/login-cover-step.svg"
                    width={240}
                    height={240}
                    alt="Logo Cover Step"
                    className="absolute left-0 top-0.5 size-40 md:h-auto md:w-auto"
                />
                <Image
                    src="/images/login-cover-cartoon.svg"
                    width={145}
                    height={34}
                    alt="Logo Cover Cartoon"
                    className="absolute bottom-0 left-0 right-0 h-52 w-full md:h-96"
                />
                <div className="absolute left-1/2 top-1/4 w-full max-w-md -translate-x-1/2 space-y-3 px-3 text-center text-white">
                    <h2 className="text-lg font-bold sm:text-2xl lg:text-[30px]/9">
                        Turn your ideas into reality.
                    </h2>
                    <p className="text-sm lg:text-xl/[30px]">
                        Encourages making dreams tangible through effort and
                        creativity.
                    </p>
                </div>
            </div>
            <div className="flex overflow-y-auto py-2">
                <Card className="m-auto w-full max-w-[400px] space-y-[30px] p-5 shadow-sm md:w-[400px]">
                    <CardHeader className="space-y-2">
                        <h2 className="text-lg font-semibold text-black lg:text-xl/tight">
                            Sign In to your account
                        </h2>
                        <p className="font-medium leading-tight">
                            Enter your details to proceed future
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-[30px]">
                        <div className='flex justify-center'>
                            <DfinityLogo />
                        </div>
                        <div className="gap-4">
                            <Link href="#">
                                <Button
                                    variant={'black'}
                                    size={'large'}
                                    className="w-full"
                                    onClick={() => signIn()}
                                >
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
