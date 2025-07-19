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
import ProjectCard from '@/components/custom/project-card'
import { Input } from '@/components/ui/input'

const Table = () => {
    const [date, setDate] = useState<Date>()
    const [mainDate, setMainDate] = useState<Date>()
    const [isDialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="space-y-4">
            <PageHeading heading={'Project Setting'} />
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
                                <SelectValue placeholder="Project Manager" />
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
                        <DialogUI open={isDialogOpen} onOpenChange={setDialogOpen} title='Init Project'
                            content={
                                <Card>
                                    <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                                        <h3>Project Setting</h3>
                                        <p className="text-sm/tight font-medium text-gray-700">
                                            Init Project
                                        </p>
                                    </CardHeader>
                                    <CardContent className='max-h-[60vh] overflow-auto'>
                                        <form className="space-y-5 p-3">
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter name here"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Description
                                                </label>
                                                <Textarea
                                                    rows={6}
                                                    placeholder="Enter desc here"
                                                />
                                            </div>
                                            <div className="space-y-2.5 hidden">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Background
                                                </label>
                                                <Input
                                                    type="imag"
                                                    placeholder="Enter tags here"
                                                />
                                            </div>
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
                                                                <span>Start Project</span>
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
                                                                <span>End Project</span>
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
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Tags
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter tags here"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="font-semibold leading-tight inline-block">
                                                    Project Manager
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
                                            <div className="flex items-center justify-between gap-4">
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
                                                    Save
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            }
                        />
                        <Button variant={'black'} onClick={() => setDialogOpen(true)}>
                            <Plus />
                            Create Project
                        </Button>
                    </div>
                </div>
                <ProjectCard />
            </div>
        </div>
    )
}

export default Table
