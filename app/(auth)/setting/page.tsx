'use client'

import PageHeading from '@/components/layout/page-heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, LockKeyhole, LockKeyholeOpen, Mail, Phone, User } from 'lucide-react'
import Image from 'next/image'
import 'react-quill-new/dist/quill.snow.css'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
    billingColumn,
    ITable,
} from '@/components/custom/table/billing-columns'
import { DataTable } from '@/components/custom/table/data-table'
import { Badge } from '@/components/ui/badge'
import IconVisacard from '@/components/icons/icon-visacard'

export default function Setting() {
    const data: ITable[] = [
        {
            id: 'WEST1000342576-001',
            invoice: 'WEST1000342576-001',
            billing_date: 'Mar 31, 2024',
            amount: '$710.68',
            plan: 'AI Assistant',
            status: 'paid',
        },
        {
            id: 'WEST1000342588-001',
            invoice: 'WEST1000342588-001',
            billing_date: 'Mar 29, 2024',
            amount: '$928.41',
            plan: 'Premium plan',
            status: 'pending',
        },
        {
            id: 'WEST1000342578-001',
            invoice: 'WEST1000342578-001',
            billing_date: 'Mar 20, 2024',
            amount: '$169.43',
            plan: 'Premium plan',
            status: 'cancelled',
        },
        {
            id: 'WEST1000342577-001',
            invoice: 'WEST1000342577-001',
            billing_date: 'Feb 20, 2024',
            amount: '$589.99',
            plan: 'Basic plan',
            status: 'pending',
        },
        {
            id: 'WEST1000342580-001',
            invoice: 'WEST1000342580-001',
            billing_date: 'Feb 16, 2024',
            amount: '$601.13',
            plan: 'Basic plan',
            status: 'paid',
        },
        {
            id: 'WEST1000342573-001',
            invoice: 'WEST1000342573-001',
            billing_date: 'Jan 28, 2024',
            amount: '$450.54',
            plan: 'Basic plan',
            status: 'pending',
        },
        {
            id: 'WEST1000342597-001',
            invoice: 'WEST1000342597-001',
            billing_date: 'Jan 28, 2024',
            amount: '$406.27',
            plan: 'Basic plan',
            status: 'pending',
        },
        {
            id: 'WEST1000342596-001',
            invoice: 'WEST1000342596-001',
            billing_date: 'Jan 22, 2024',
            amount: '$943.65',
            plan: 'Premium plan',
            status: 'pending',
        },
        {
            id: 'WEST1000342579-001',
            invoice: 'WEST1000342579-001',
            billing_date: 'Jan 18, 2013',
            amount: '$106.58',
            plan: 'Basic plan',
            status: 'paid',
        },
        {
            id: 'WEST1000342595-001',
            invoice: 'WEST1000342595-001',
            billing_date: 'Jan 07, 2024',
            amount: '$854.08',
            plan: 'Premium plan',
            status: 'paid',
        },
        {
            id: 'WEST1000342900-001',
            invoice: 'WEST1000342900-001',
            billing_date: 'Jan 02, 2024',
            amount: '$598.78',
            plan: 'Premium plan',
            status: 'paid',
        },
    ]
    return (
        <div className="space-y-4">
            <PageHeading heading={'Settings'} />

            <div className="min-h-[calc(100vh-160px)] w-full rounded-lg">
                <Tabs defaultValue="my-profile">
                    <TabsList className="mb-5 overflow-x-auto rounded-lg bg-white shadow-sm">
                        <div className="inline-flex gap-2.5 px-5 py-[11px] text-sm/[18px] font-semibold">
                            <TabsTrigger
                                value="my-profile"
                                className="leading-3 data-[state=active]:bg-black data-[state=active]:text-white"
                            >
                                My Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="billing"
                                className="leading-3 data-[state=active]:bg-black data-[state=active]:text-white"
                            >
                                Billing
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="leading-3 data-[state=active]:bg-black data-[state=active]:text-white"
                            >
                                Notifications
                            </TabsTrigger>
                        </div>
                    </TabsList>
                    <TabsContent
                        value="my-profile"
                        className="font-medium text-black"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                                    <h3>Personal info</h3>
                                    <p className="text-sm/tight font-medium text-gray-700">
                                        Update your photo and personal details.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-5 p-4">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <div className="size-[50px] shrink-0 overflow-hidden rounded-full">
                                                <Image
                                                    src="/images/upload.svg"
                                                    alt="upload"
                                                    width={50}
                                                    height={50}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold leading-tight">
                                                    Update profile image
                                                </p>
                                                <p className="text-xs/tight text-gray">
                                                    Min 400*400px, PNG or JPEG
                                                </p>
                                            </div>
                                            <div className="relative ml-3 cursor-pointer">
                                                <Input
                                                    type="file"
                                                    className="absolute inset-0 h-full w-full cursor-pointer p-0 text-[0] leading-none opacity-0"
                                                />
                                                <Button
                                                    type="button"
                                                    variant={'outline-general'}
                                                    size={'large'}
                                                >
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                First name
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Carla"
                                                    className="pl-9"
                                                />
                                                <User className="absolute left-3 top-3 size-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Last name
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Williams"
                                                    className="pl-9"
                                                />
                                                <User className="absolute left-3 top-3 size-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Email address
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="CarlaVWilliams@gmail.com"
                                                    className="pl-9"
                                                />
                                                <Mail className="absolute left-3 top-3 size-4" />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-0 rounded-lg bg-white p-2 font-semibold text-primary transition hover:text-black"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Phone number
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="tel"
                                                    placeholder="+1 660-794-6621"
                                                    className="pl-9"
                                                />
                                                <Phone className="absolute left-3 top-3 size-4" />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-0 rounded-lg bg-white p-2 font-semibold text-primary transition hover:text-black"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-7! flex items-center justify-end gap-4">
                                            <Button
                                                variant={'outline-general'}
                                                size={'large'}
                                                className="text-danger"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant={'black'}
                                                size={'large'}
                                            >
                                                Save changes
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                                    <h3>Profile details</h3>
                                    <p className="text-sm/tight font-medium text-gray-700">
                                        This will be displayed on your profile.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-5 p-4">
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Areas of interest
                                            </label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Singing, learning" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Dancing">
                                                        Dancing
                                                    </SelectItem>
                                                    <SelectItem value="Riding">
                                                        Riding
                                                    </SelectItem>
                                                    <SelectItem value="Travelling">
                                                        Travelling
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Professions
                                            </label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ex. software engineer, ect.." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Web Developer">
                                                        Web Developer
                                                    </SelectItem>
                                                    <SelectItem value="Marketing Manager">
                                                        Marketing Manager
                                                    </SelectItem>
                                                    <SelectItem value="Graphics Designer">
                                                        Graphics Designer
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Skills
                                            </label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ex. developing, designing ect.." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Creativity">
                                                        Creativity
                                                    </SelectItem>
                                                    <SelectItem value="Data Analytics">
                                                        Data Analytics
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="font-semibold leading-tight inline-block">
                                                Bio
                                            </label>
                                            <Textarea
                                                rows={5}
                                                placeholder="Aliquam pulvinar vestibulum blandit. Donec sed nisl libero. Fusce dignissim luctus sem eu dapibus. P"
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-4">
                                            <Button
                                                variant={'outline-general'}
                                                size={'large'}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant={'black'}
                                                size={'large'}
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="billing"
                        className="space-y-4 font-medium text-black dark:text-white"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 *:font-semibold">
                                                <h3 className="text-base/5">
                                                    AI Assistant
                                                </h3>
                                                <Badge
                                                    size={'small'}
                                                    variant={'green'}
                                                >
                                                    Active
                                                </Badge>
                                            </div>
                                            <p className="text-xs/snug text-gray-700 lg:text-sm/tight dark:text-gray-600">
                                                Our most popular plan for small
                                                teams.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-end justify-end sm:gap-1">
                                            <span className="text-[30px]/tight font-extrabold">
                                                $49.99
                                            </span>
                                            &nbsp;
                                            <span className="text-sm/tight font-semibold italic text-primary">
                                                Per month
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-5 inline-flex items-center -space-x-2.5">
                                        <Image
                                            src="/images/kanban-avatar1.svg"
                                            width={30}
                                            height={30}
                                            alt="avatar"
                                            className="rounded-full"
                                        />
                                        <Image
                                            src="/images/kanban-avatar2.svg"
                                            width={30}
                                            height={30}
                                            alt="avatar"
                                            className="rounded-full"
                                        />
                                        <Image
                                            src="/images/kanban-avatar3.svg"
                                            width={30}
                                            height={30}
                                            alt="avatar"
                                            className="rounded-full"
                                        />
                                        <Image
                                            src="/images/kanban-avatar4.svg"
                                            width={30}
                                            height={30}
                                            alt="avatar"
                                            className="rounded-full"
                                        />
                                        <button
                                            type="button"
                                            className="grid h-[30px] min-w-[30px] shrink-0 place-content-center rounded-full border-2 border-white bg-gray-300 px-1 text-[11px]/none font-bold text-black shadow-sm"
                                        >
                                            +5
                                        </button>
                                    </div>
                                    <div className="mt-4 space-y-2.5 font-semibold">
                                        <p>14 of 20 users</p>
                                        <div className="h-2 w-full max-w-96 overflow-hidden rounded-full bg-gray-300">
                                            <span className="block h-full w-full max-w-48 rounded-full bg-primary"></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="space-y-5 p-4">
                                    <div className="space-y-1.5">
                                        <h3 className="text-base/5 font-semibold">
                                            Payment method
                                        </h3>
                                        <p className="text-xs/snug text-gray-700 lg:text-sm/tight dark:text-gray-600">
                                            Change how you pay for your plan.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-start gap-4 rounded-lg bg-gray-400 p-4 dark:bg-black/50">
                                        <span className="mt-0.5 inline-grid h-[26px] w-10 place-content-center rounded-sm bg-white shadow-3xl">
                                            <IconVisacard className="h-4 w-8" />
                                        </span>
                                        <div className="grow space-y-1.5 text-xs/tight">
                                            <p className="text-sm/tight font-semibold">
                                                Visa ending in 1548
                                            </p>
                                            <p className="text-gray dark:text-gray-600">
                                                Expiry 06/2024
                                            </p>
                                            <p>AlfredbJorgensen@gmail.com</p>
                                        </div>
                                        <Button
                                            type="submit"
                                            variant={'black'}
                                            className="ml-auto"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="overflow-hidden bg-transparent! shadow-none!">
                            <CardHeader className="flex flex-wrap items-center justify-between gap-2 bg-white px-5 py-4 dark:bg-black-dark">
                                <div className="space-y-1.5">
                                    <h3 className="text-base/5 font-semibold">
                                        Billing history
                                    </h3>
                                    <p className="text-xs/snug text-gray-700 lg:text-sm/tight dark:text-gray-600">
                                        Download your previous plan receipts and
                                        usage details.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 ltr:ml-auto rtl:mr-auto">
                                    <div id="search-table" hidden></div>
                                    <Button type="button" variant={'black'}>
                                        <Download />
                                        Download all
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={billingColumn}
                                    data={data}
                                    filterField={'invoice'}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent
                        value="notifications"
                        className="font-medium text-black dark:text-white"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black dark:border-gray-700/50 dark:bg-black/30 dark:text-white">
                                    <h3>Comments</h3>
                                    <p className="text-xs/snug font-medium text-gray-700 sm:text-sm/tight dark:text-gray-600">
                                        Notifications for post comments and
                                        comment replies.
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <RadioGroup
                                        defaultValue="notify"
                                        className="gap-5 sm:gap-[30px]"
                                    >
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="notify" />
                                            </span>
                                            <h3 className="font-semibold leading-tight">
                                                Do not notify me
                                            </h3>
                                        </label>
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="mentions" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    Mentions only
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Only notify me if I&apos;m
                                                    mentioned in a comment.
                                                </p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="Morning Boost" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight text-black dark:text-white">
                                                    All comments
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Notify me for all comments
                                                    on my posts.
                                                </p>
                                            </div>
                                        </label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black dark:border-gray-700/50 dark:bg-black/30 dark:text-white">
                                    <h3>Reminders</h3>
                                    <p className="text-xs/snug font-medium text-gray-700 sm:text-sm/tight dark:text-gray-600">
                                        Notifications for your post comments and
                                        replies.
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <RadioGroup
                                        defaultValue="notify"
                                        className="gap-5 sm:gap-[30px]"
                                    >
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="notify" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    Do not notify me
                                                </h3>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="reminders" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    Important reminders only
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Only notify me if the
                                                    reminder is tagged as
                                                    important.
                                                </p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="All reminders" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight text-black dark:text-white">
                                                    All reminders
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Notify me for all reminders.
                                                </p>
                                            </div>
                                        </label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black dark:border-gray-700/50 dark:bg-black/30 dark:text-white">
                                    <h3>Notifications from us</h3>
                                    <p className="text-xs/snug font-medium text-gray-700 sm:text-sm/tight dark:text-gray-600">
                                        Receive the latest news, updates and
                                        industry tutorials from us.
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-5 sm:gap-[30px]">
                                        <label className="flex items-start gap-3">
                                            <Checkbox className="mt-0.5" />
                                            <div className="space-y-2.5">
                                                <h3 className="font-semibold leading-tight">
                                                    News and updates
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    News about the product and
                                                    features updates.
                                                </p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3">
                                            <Checkbox className="mt-0.5" />
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    Tips and tutorials
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Tips on getting more out of
                                                    NexaDash
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black dark:border-gray-700/50 dark:bg-black/30 dark:text-white">
                                    <h3>More activity about you</h3>
                                    <p className="text-xs/snug font-medium text-gray-700 sm:text-sm/tight dark:text-gray-600">
                                        Notifications for profile posts, likes,
                                        and reactions.
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <RadioGroup
                                        defaultValue="notify"
                                        className="gap-5 sm:gap-[30px]"
                                    >
                                        <label className="flex items-baseline gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="notify" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    Do not notify me
                                                </h3>
                                            </div>
                                        </label>
                                        <label className="flex items-baseline gap-3">
                                            <span className="mt-1">
                                                <RadioGroupItem value="reminders" />
                                            </span>
                                            <div className="space-y-1.5">
                                                <h3 className="font-semibold leading-tight">
                                                    All reminders
                                                </h3>
                                                <p className="text-xs/snug text-gray sm:text-sm/tight dark:text-gray-600">
                                                    Notify me for all other
                                                    activity.
                                                </p>
                                            </div>
                                        </label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
