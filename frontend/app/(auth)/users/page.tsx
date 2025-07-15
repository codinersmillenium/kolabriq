'use client'


import { columns, ITable } from '@/components/custom/table/columns'
import { DataTable } from '@/components/custom/table/data-table'
import PageHeading from '@/components/layout/page-heading'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { CalendarCheck, Divide, Plus } from 'lucide-react'
import { useState } from 'react'
import DialogUI from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Search } from 'lucide-react'

const Table = () => {
    const [date, setDate] = useState<Date>()
    const [mainDate, setMainDate] = useState<Date>()

    const data: ITable[] = [
        {
            id: '200257',
            receptionist: {
                image: '/images/avatar.svg',
                name: 'Jerome Bell',
            },
            sales_id: '#200257',
            category: 'Workforce Management',
            location: 'Lafayette, California',
            date: 'Mar 31, 2024',
            status: 'done',
        },
        {
            id: '#526587',
            receptionist: {
                image: '/images/avatar-two.svg',
                name: 'Victoria Alonso',
            },
            sales_id: '#526587',
            category: 'Quality Monitoring',
            location: 'Kent, Utah',
            date: 'Mar 29, 2024',
            status: 'pending',
        },
        {
            id: '#696589',
            receptionist: {
                image: '/images/avatar-three.svg',
                name: 'Arlene McCoy',
            },
            sales_id: '#696589',
            category: 'CTI and Screen Pop',
            location: 'Corona, Michigan',
            date: 'Mar 20, 2024',
            status: 'cancelled',
        },
        {
            id: '#256584',
            receptionist: {
                image: '/images/avatar-four.svg',
                name: 'Grace Hopper',
            },
            sales_id: '#256584',
            category: 'Queue Callback',
            location: 'Corona, Michigan',
            date: 'Feb 20, 2024',
            status: 'pending',
        },
        {
            id: '#105986',
            receptionist: {
                image: '/images/avatar-six.svg',
                name: 'Darrell Steward',
            },
            sales_id: '#105986',
            category: 'Mobile Customer Care',
            location: 'Great Falls, Maryland',
            date: 'Feb 16, 2024',
            status: 'done',
        },
        {
            id: '#526534',
            receptionist: {
                image: '/images/avatar-seven.svg',
                name: 'Elizabeth Feinler',
            },
            sales_id: '#526534',
            category: 'Sidekick',
            location: 'Pasadena, Oklahoma',
            date: 'Jan 28, 2024',
            status: 'pending',
        },
        {
            id: '#526584',
            receptionist: {
                image: '/images/avatar-eight.svg',
                name: 'Courtney Henry',
            },
            sales_id: '#526584',
            category: 'Web Callback',
            location: 'Lafayette, California',
            date: 'Jan 28, 2024',
            status: 'pending',
        },
        {
            id: '#526589',
            receptionist: {
                image: '/images/avatar-nine.svg',
                name: 'Radia Perlman',
            },
            sales_id: '#526589',
            category: 'Agent Scripting',
            location: 'Stockton, New Hampshire',
            date: 'Jan 22, 2024',
            status: 'pending',
        },
        {
            id: '#526587',
            receptionist: {
                image: '/images/avatar-ten.svg',
                name: 'Jane Cooper',
            },
            sales_id: '#526587',
            category: 'Skills-based Routing',
            location: 'Portland, Illinois',
            date: 'Jan 18, 2013',
            status: 'done',
        },
        {
            id: '#200257',
            receptionist: {
                image: '/images/avatar-eleven.svg',
                name: 'Barbara Liskov',
            },
            sales_id: '#200257',
            category: 'UC Integrations',
            location: 'Syracuse, Connecticut',
            date: 'Jan 7, 2024',
            status: 'done',
        },
        {
            id: '#200287',
            receptionist: {
                image: '/images/avatar-eleven.svg',
                name: 'Barbara Liskov',
            },
            sales_id: '#200257',
            category: 'UC Integrations',
            location: 'Syracuse, Connecticut',
            date: 'Jan 7, 2024',
            status: 'done',
        },
    ]

    const [isDialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="space-y-4">
            <PageHeading heading={'Users Setting'} />
            <div className="min-h-[calc(100vh-160px)] w-full">
                <div className="flex items-center justify-between gap-4 overflow-x-auto rounded-t-lg bg-white px-5 py-[17px]">
                    <div className="flex items-center gap-2.5">
                        <Button
                            type="button"
                            variant={'outline'}
                            className="bg-light-theme ring-0"
                        >
                            All
                        </Button>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={'outline-general'}
                                    >
                                        <CalendarCheck />
                                        {date ? (
                                            format(date, 'PP')
                                        ) : (
                                            <span>Start date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto! p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <span className="text-xs font-medium text-gray-700">
                                To
                            </span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={'outline-general'}
                                    >
                                        <CalendarCheck />
                                        {mainDate ? (
                                            format(mainDate, 'PPP')
                                        ) : (
                                            <span>End date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto! p-0">
                                    <Calendar
                                        mode="single"
                                        selected={mainDate}
                                        onSelect={setMainDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div id="search-table"></div>
                        <Select>
                            <SelectTrigger className="py-2 text-xs text-black shadow-sm ring-1 ring-gray-300">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="space-y-1.5">
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="Weekly"
                                    >
                                        Weekly
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="Monthly"
                                    >
                                        Monthly
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="Yearly"
                                    >
                                        Yearly
                                    </SelectItem>
                                </div>
                            </SelectContent>
                        </Select>
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
                        <DialogUI open={isDialogOpen} onOpenChange={setDialogOpen} title='Users Setting'
                            content={
                                <Card>
                                    <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                                        <h3>Users Setting</h3>
                                        <p className="text-sm/tight font-medium text-gray-700">
                                            Assign Users by Role Project
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <form className="space-y-5 p-4">
                                            <div>
                                                <label className="font-semibold leading-tight inline-block">
                                                    Role
                                                </label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Maintenance, Developer" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="2">
                                                            Maintenance
                                                        </SelectItem>
                                                        <SelectItem value="3">
                                                            Developer
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center max-w-md mx-auto mt-5">
                                                <input
                                                    type="text"
                                                    placeholder="Search User ID..."
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    className="px-4 py-2 rounded-r-md border border-gray-300 border-s-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <Search />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-end gap-4">
                                                <Button
                                                    variant={'outline-general'}
                                                    size={'large'}
                                                    onClick={() => setDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant={'black'}
                                                    size={'large'}
                                                >
                                                    Invite
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            }
                        />
                        <Button variant={'black'} onClick={() => setDialogOpen(true)}>
                            <Plus />
                            Add Users
                        </Button>
                    </div>
                </div>

                <DataTable columns={columns} data={data} filterField="name" />
            </div>
        </div>
    )
}

export default Table
