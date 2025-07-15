'use client'
import React, { useEffect, useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import {
    ChevronDown,
    ClipboardType,
    Component,
    FileType,
    Fingerprint,
    Gauge,
    Gem,
    MessageSquareText,
    Minus,
    PanelLeftDashed,
    Phone,
    PieChart,
    RectangleEllipsis,
    Rocket,
    ScrollText,
    Settings,
    Sheet,
    SquareKanban,
    TableProperties,
    X,
    UserLock,
    FolderKanban
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import NavLink from '@/components/layout/nav-link'

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathName = usePathname()

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
            mainContent.style.marginLeft = isSidebarOpen ? '260px' : '60px' // Adjust this value as needed
        }
    }

    const toggleSidebarResponsive = () => {
        document.getElementById('sidebar')?.classList.remove('open')
        document.getElementById('overlay')?.classList.toggle('open')
    }

    const isOpen = () => {
        if (['/blog-list', '/blog-details', '/add-blog'].includes(pathName)) {
            return 'item-2'
        } else if (
            [
                '/',
                '/crypto-dashboard',
                '/product-card',
                '/add-product',
                '/product-details',
                '/product-checkout',
            ].includes(pathName)
        ) {
            return 'item-1'
        } else if (
            ['/invoice', '/invoice-details', '/create-invoice'].includes(
                pathName,
            )
        ) {
            return 'item-3'
        } else if (
            [
                '/accordion-page',
                '/alert',
                '/alert-dialog',
                '/avatar',
                '/breadcrumbs',
                '/buttons',
                '/card-page',
                '/carousel',
                '/dropdown',
                '/empty-stats',
                '/hover-card',
                '/modal',
                '/popover',
                '/scroll-area',
                '/sonner',
                '/tabs',
                '/tag',
                '/toasts',
                '/toggle-group',
                '/tooltip',
            ].includes(pathName)
        ) {
            return 'item-4'
        } else if (
            [
                '/checkbox',
                '/combobox',
                '/command',
                '/form',
                '/inputs',
                '/input-otp',
            ].includes(pathName)
        ) {
            return 'item-5'
        } else {
            return ''
        }
    }

    useEffect(() => {
        if (document?.getElementById('overlay')?.classList?.contains('open')) {
            toggleSidebarResponsive()
        }
    }, [pathName])

    return (
        <>
            <div
                id="overlay"
                className="fixed inset-0 z-30 hidden bg-black/50"
                onClick={toggleSidebarResponsive}
            ></div>
            <Card
                id="sidebar"
                className={`sidebar fixed -left-[260px] top-0 z-40 flex h-screen w-[260px] flex-col rounded-none transition-all duration-300 lg:left-0 lg:top-16 lg:h-[calc(100vh-64px)] ${isSidebarOpen ? 'closed' : ''}`}
            >
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="absolute -right-2.5 -top-3.5 hidden size-6 place-content-center rounded-full border border-gray-300 bg-white text-black lg:grid"
                >
                    <ChevronDown
                        className={`h-4 w-4 rotate-90 ${isSidebarOpen ? 'hidden' : ''}`}
                    />
                    <ChevronDown
                        className={`hidden h-4 w-4 -rotate-90 ${isSidebarOpen ? 'block!' : ''}`}
                    />
                </button>
                <div className="flex items-start justify-between border-b border-gray-300 px-4 py-5 lg:hidden">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/images/logo.svg"
                            width={145}
                            height={34}
                            alt="Logo"
                            className="h-auto w-auto"
                        />
                    </Link>
                    <button type="button" onClick={toggleSidebarResponsive}>
                        <X className="-mr-2 -mt-2 ml-auto size-4 hover:text-black" />
                    </button>
                </div>
                <Accordion
                    type="single"
                    defaultValue={isOpen()}
                    collapsible
                    className="sidemenu grow overflow-y-auto overflow-x-hidden px-2.5 pb-10 pt-2.5 transition-all"
                    key={pathName}
                >
                    <NavLink
                        href="/"
                        className={`nav-link ${pathName === '/' && 'text-black!'}`}
                    >
                        <Gauge className="size-[18px] shrink-0" />
                        <span>Dashboard</span>
                    </NavLink>

                    <h3 className="mt-2.5 whitespace-nowrap rounded-lg bg-gray-400 px-5 py-2.5 text-xs/tight font-semibold uppercase text-black">
                        <span>Settings</span>
                        <Minus className="hidden h-4 w-5 text-gray" />
                    </h3>

                    <NavLink
                        href="/users"
                        className={`nav-link ${pathName === '/users' && 'text-black!'}`}
                    >
                        <UserLock className="size-[18px] shrink-0" />
                        <span>Users</span>
                    </NavLink>

                    <NavLink
                        href="/scrumboard"
                        target="_blank"
                        className={`nav-link ${pathName === '/scrumboard' && 'text-black!'}`}
                    >
                        <FolderKanban className="size-[18px] shrink-0" />
                        <span>Projects</span>
                    </NavLink>

                    <h3 className="mt-2.5 whitespace-nowrap rounded-lg bg-gray-400 px-5 py-2.5 text-xs/tight font-semibold uppercase text-black">
                        <span>Workspaces</span>
                        <Minus className="hidden h-4 w-5 text-gray" />
                    </h3>

                    <AccordionItem value="item-4" className="p-0 shadow-none">
                        <AccordionTrigger className="nav-link">
                            <Component className="size-[18px] shrink-0" />
                            <span>Boards</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="submenu space-y-2 pl-12 pr-5">
                                <li>
                                    <NavLink
                                        href="/accordion-page"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Task & Progress
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        href="/alert"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Calendar
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        href="/alert-dialog"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Reports
                                    </NavLink>
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <NavLink
                        href="/pricing-plan"
                        target="_blank"
                        className={`nav-link`}
                        isProfessionalPlanRoute={true}
                    >
                        <Gem className="size-[18px] shrink-0" />
                        <span>SCRUM Boards</span>
                    </NavLink>

                    <h3 className="mt-2.5 whitespace-nowrap rounded-lg bg-gray-400 px-5 py-2.5 text-xs/tight font-semibold uppercase text-black">
                        <span>Pages</span>
                        <Minus className="hidden h-4 w-5 text-gray" />
                    </h3>

                    <NavLink
                        href="/setting"
                        className={`nav-link ${pathName === '/setting' && 'text-black!'}`}
                    >
                        <Settings className="size-[18px] shrink-0" />
                        <span>Settings</span>
                    </NavLink>

                    <AccordionItem value="item-6" className="p-0 shadow-none">
                        <AccordionTrigger className="nav-link">
                            <Fingerprint className="size-[18px] shrink-0" />
                            <span>Authentication</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="submenu space-y-2 pl-12 pr-5">
                                <li>
                                    <NavLink
                                        href="/login"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Login
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        href="/register"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        href="/forgot"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Forgot
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        href="/password"
                                        target="_blank"
                                        isAccordion={true}
                                    >
                                        Password
                                    </NavLink>
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <NavLink
                        href="/contact-us"
                        className={`nav-link ${pathName === '/contact-us' && 'text-black!'}`}
                    >
                        <Phone className="size-[18px] shrink-0" />
                        <span>Contact Us</span>
                    </NavLink>
                </Accordion>
                <div className="upgrade-menu sticky bottom-0 rounded-[10px] bg-light-theme p-4 transition-all">
                    <span className="absolute -right-0 left-0 top-0 -z-1">
                        <Image
                            src="/images/rectangle-gird.png"
                            width={250}
                            height={230}
                            alt="rectangle-grid"
                            className="h-full w-full rounded-[10px]"
                        />
                    </span>
                    <span className="grid size-9 place-content-center rounded-lg bg-white shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_1px_4px_0_rgba(0,0,0,0.03)]">
                        <Rocket className="size-5 text-primary" />
                    </span>
                    <p className="mb-4 mt-3 font-semibold leading-5 text-black">
                        Get detailed report, sales analysis, with pro plan
                    </p>
                    <Link
                        href="https://sbthemes.lemonsqueezy.com/buy/69aeae3f-6c81-4804-a211-7b96e7e0e56a"
                        target="_blank"
                    >
                        <Button type="button" variant={'black'}>
                            Upgrade Now
                        </Button>
                    </Link>
                </div>
            </Card>
        </>
    )
}

export default Sidebar
