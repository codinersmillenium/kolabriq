'use client'

import DfinityLogo from '@/components/icons/dfinity-logo'
import IconFacebook from '@/components/icons/icon-facebook'
import IconGoogle from '@/components/icons/icon-google'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { initActor } from '@/lib/canisters'
import { AtSign, Key, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register() {
    const [tags, useTags] = useState(false)
    const [formData, setFormData]: any = useState({
        userName: '',
        lastName: '',
        firstName: '',
        tags: [],
        role_: null,
        role: [],
        referrerCode_: ''
    })
    const setTags = (e: any) => {
        if (e.target.value === 'developer') {
            useTags(true)
        } else {
            useTags(false)
        }
        handleChange(e)
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const tag: any = document.querySelectorAll('[name="tags[]"]')
            formData.tags = []
            formData.referrerCode = [formData.referrerCode_]
            formData.role = { [formData.role_]: null }
            for (let i = 0; i < tag.length; i++) {
                if (tag[i].checked) {
                    formData.tags.push({ [tag[i].value]: null })
                }
            }
            const actor = await initActor()
            await actor.registerUser(formData)
            alert('Success Register User...')
            setTimeout(() => {
                window.location.href = '/'
            }, 300);
        } catch (error) {
            alert('Failed Register User...');
        }
    }
    return (
        <div className="grid h-screen w-full gap-5 p-4 md:grid-cols-2">
            <div className="relative hidden overflow-hidden rounded-[20px] bg-[#3B06D2] p-4 md:block md:h-[calc(100vh-32px)]">
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
                        <h2 className="text-xl/tight font-semibold text-black">
                            Getting started
                        </h2>
                        <p className="font-medium leading-tight">
                            Register an user to connect with people.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-[30px]">
                        <div className='flex justify-center'>
                            <DfinityLogo />
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="h-px w-full bg-[#E2E4E9]"></span>
                        </div>
                        <form className="space-y-[30px]" onSubmit={handleSubmit}>
                            <div className="relative space-y-3">
                                <label className="block font-semibold leading-none text-black">
                                    Username
                                </label>
                                <Input
                                    name='userName'
                                    type="text"
                                    variant={'input-form'}
                                    placeholder="Username"
                                    iconRight={<User className="size-[18px]" />}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="relative space-y-3">
                                <label className="block font-semibold leading-none text-black">
                                    First Name
                                </label>
                                <Input
                                    type="text"
                                    variant={'input-form'}
                                    placeholder="First Name"
                                    iconRight={<User className="size-[18px]" />}
                                    name='firstName'
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="relative space-y-3">
                                <label className="block font-semibold leading-none text-black">
                                    Last Name
                                </label>
                                <Input
                                    type="text"
                                    variant={'input-form'}
                                    placeholder="Last Name"
                                    iconRight={<User className="size-[18px]" />}
                                    name='lastName'
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='relative space-y-3'>
                                <label className="block font-semibold leading-none text-black">
                                    Regist As
                                </label>
                                <select name="role_" onChange={setTags} required>
                                    <option value="">
                                        Change Option
                                    </option>
                                    <option value="admin">Company</option>
                                    <option value="developer">Developer</option>
                                </select>
                            </div>
                            {tags && (
                                <div className='relative space-y-3'>
                                    <div className="relative space-y-3">
                                        <label className="block font-semibold leading-none text-black">
                                            Reference Code
                                        </label>
                                        <Input
                                            type="text"
                                            variant={'input-form'}
                                            placeholder="The code is provided by the company..."
                                            iconRight={<Key className="size-[18px]" />}
                                            name='referrerCode_'
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <fieldset className="border border-gray-300 p-4 rounded-md">
                                        <legend className="text-sm font-medium text-gray-700 mb-2">Tags</legend>
                                        <div className="space-y-2">
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" name="tags[]" value="frontend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                <span className="text-sm text-gray-700">Frontend Developer</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" name="tags[]" value="backend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                <span className="text-sm text-gray-700">Backend Developer</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" name="tags[]" value="ui" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                <span className="text-sm text-gray-700">UI/UX Design</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input type="checkbox" name="tags[]" value="business_analyst" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                <span className="text-sm text-gray-700">Bussiness Analyst</span>
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>
                            )}
                            <Button
                                type="submit"
                                variant={'black'}
                                size={'large'}
                                className="w-full"
                            >
                                Register
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
