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
import { useEffect, useRef, useState } from 'react'
import DialogUI from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Search } from 'lucide-react'
import { getPrincipal, initActor } from '@/lib/canisters'
import { Principal } from '@dfinity/principal'
import { Badge } from '@/components/ui/badge'

const Table = () => {
    const [date, setDate] = useState<Date>()
    const [mainDate, setMainDate] = useState<Date>()
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [data, setData] = useState<ITable[]>([])
    const [code, setCode] = useState([''])

    const findUser = async (id: any) => {
        const actor_ = await initActor()
        const { ok }: any = await actor_.getUserDetail(id)
        setCode([ok.personalRefCode])
    }

    const getUsers = async () => {
        const actor_ = await initActor()
        const { ok }: any = await actor_.getUsers()
        if (ok && ok.length > 0) {
            var data = []
            for (let obj in ok) {
                const role = Object.keys(ok[obj].role).toString()
                if (role === 'admin') {
                    setCode(ok[obj].personalRefCode)
                } else {
                    var tags: string = ''
                    for (let obj1 in ok[obj].tags) {
                        tags += Object.keys(ok[obj].tags[obj1]) + ', '
                    }
                    data.push({
                        key: {
                            id: ok[obj].id.toString(),
                            role: role,
                        },
                        fullName: ok[obj].firstName + ' ' + ok[obj].lastName,
                        tags: tags
                    })
                }
            }
            setData(data)
        } else {
            const principal = getPrincipal()
            findUser(principal[1])
        }
    }
    const isAsdCalled = useRef(false);

    useEffect(() => {
        getUsers()
        if (!isAsdCalled.current) {
            isAsdCalled.current = true;
        }
    }, [])

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
                <div className='w-full flex justify-end bg-white px-2 py-2'>
                    {code[0] && (
                        <Badge variant={'primary'}>
                            {code[0]}
                        </Badge>
                    )}
                </div>

                <DataTable columns={columns(getUsers)} data={data} filterField="id" />
            </div>
        </div>
    )
}

export default Table
