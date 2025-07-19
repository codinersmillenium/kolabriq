import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideMessageSquareText, LucidePlus, LucideUser, LucideEllipsis } from 'lucide-react'
import { useState, DragEvent } from 'react'

export const KanbanCard = () => {
    const taskTodo: Object[] = [
        {
            id: '1',
            tags: 'frontend',
            user: 'Burhan Loli',
            task: 'Engaging and welcoming tone of voice for the new and excising users.',
            date: 'January 01, 2024',
            comment: {
                id: '1',
                total: 15
            }
        },
        {
            id: '2',
            tags: 'frontend',
            user: 'Burhan Loli',
            task: 'Engaging and welcoming tone of voice for the new and excising users.',
            date: 'January 01, 2024',
            comment: {
                id: '1',
                total: 15
            }
        }
    ]
    const [todo, setTodo] = useState<object[]>(taskTodo)
    const [ongoing, setOngoing] = useState<object[]>()
    const [review, setReview] = useState<object[]>()
    const [completed, setCompleted] = useState<object[]>()

    const handleOnDragOver = (e: DragEvent) => {
        e.preventDefault();
    }

    const handleOnDrag = (e: DragEvent, item: object) => {
        e.dataTransfer.setData("item", JSON.stringify(item))
    }

    const handleOnDrop = (e: DragEvent, kanban: string) => {
        const item = JSON.parse(e.dataTransfer.getData("item"))
        const resetCard = (flow: any = []) => {
            if (flow.indexOf('todo') !== -1) {
                todo?.forEach((task: any) => {
                    if (task.id === item.id) {
                        setTodo([
                            ...todo.filter(
                                (obj: any) =>
                                    obj.id !== item.id
                            )
                        ])
                        return
                    }
                })
            }
            if (flow.indexOf('ongoing') !== -1) {
                ongoing?.forEach((task: any) => {
                    if (task.id === item.id) {
                        setOngoing([
                            ...ongoing.filter(
                                (obj: any) =>
                                    obj.id !== item.id
                            )
                        ])
                        return
                    }
                })
            }
            if (flow.indexOf('completed')) {
                completed?.forEach((task: any) => {
                    if (task.id === item.id) {
                        setCompleted([
                            ...completed.filter(
                                (obj: any) =>
                                    obj.id !== item.id
                            )
                        ])
                        return
                    }
                })
            }
        }
        switch (kanban) {
            case 'todo':
                if (todo) {
                    setTodo([
                        ...todo.filter(
                            (obj: any) =>
                                obj.id !== item.id
                        ),
                        item
                    ])
                } else {
                    setTodo([item])
                }
                resetCard(['ongoing', 'completed'])
                break;
            case 'ongoing':
                if (ongoing) {
                    setOngoing([
                        ...ongoing.filter(
                            (obj: any) =>
                                obj.id !== item.id
                        ),
                        item
                    ])
                } else {
                    setOngoing([item])
                }
                resetCard(['todo', 'completed'])
                break;
            case 'completed':
                if (completed) {
                    setCompleted([
                        ...completed.filter(
                            (obj: any) =>
                                obj.id !== item.id
                        ),
                        item
                    ])
                } else {
                    setCompleted([item])
                }
                resetCard(['ongoing', 'todo'])
                break;
        }
    }
    return (
        <div className="overflow-x-auto pb-2 mt-5">
            <div className="flex justify-start gap-4 pb-2" id="scoreboard">
                <Card className='h-fit w-[275px] shrink-0 space-y-2 rounded-lg bg-white p-2 dark:bg-white/10 hover:cursor-pointer'>
                    <CardHeader className="font-semibold text-black">
                        <div className="dark:bg-black-dark rounded-lg bg-white shadow-3xl dark:shadow-sm flex items-center justify-between px-4 py-2.5" id="toDo">
                            <div className="inline-flex items-center gap-2.5">
                                <span className="size-1.5 rounded-full bg-primary"></span>
                                <h3 className="text-xs/tight font-bold lowercase text-black first-letter:uppercase dark:text-white">to do</h3>
                            </div>
                            <div className="inline-flex items-center">
                                <Button type="button" variant={'ghost'}>
                                    <LucidePlus className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="min-h-[200px]"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => {handleOnDrop(e, 'todo')}}
                        >
                            {todo &&
                                todo.map((item: any, i) => {
                                    return (
                                            <div
                                            className='mb-3'
                                            draggable
                                            key={i}
                                            onDragStart={(e) => {
                                                handleOnDrag(e, item);
                                            }}
                                        >
                                        <Card key={i}>
                                            <CardContent>
                                                <div className="space-y-4 p-3">
                                                    <div className='flex justify-between'>
                                                        <Badge variant="orange" radius='full' size='icon' className='font-bold'>{ item.id }</Badge>
                                                        <div>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                        <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500'/>
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto! p-0">
                                                                    <Card>
                                                                        <CardContent className='p-2'>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Edit</Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Delete</Button>
                                                                        </CardContent>
                                                                    </Card>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div> 
                                                    <p className="line-clamp-5 text-xs/5 font-medium overflow-auto">
                                                        Engaging and welcoming tone of voice for the new and excising users.
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">Borhan Loli</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">January 01, 2024</p>
                                                        <Button type="button" variant={'ghost'}>
                                                            <LucideMessageSquareText className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                            15 
                                                        </Button>
                                                    </div>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card className='h-fit w-[275px] shrink-0 space-y-2 rounded-lg bg-white p-2 dark:bg-white/10'>
                    <CardHeader className="font-semibold text-black">
                        <div className="dark:bg-black-dark rounded-lg bg-white shadow-3xl dark:shadow-sm flex items-center justify-between px-4 py-2.5" id="toDo">
                            <div className="inline-flex items-center gap-2.5">
                                <span className="size-1.5 rounded-full bg-warning"></span>
                                <h3 className="text-xs/tight font-bold lowercase text-black first-letter:uppercase dark:text-white">in progress</h3>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="min-h-[200px]"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => {handleOnDrop(e, 'ongoing')}}
                        >
                            {ongoing &&
                                ongoing.map((item: any, i) => {
                                    return (
                                            <div
                                            className='mb-3'
                                            draggable
                                            key={i}
                                            onDragStart={(e) => {
                                                handleOnDrag(e, item);
                                            }}
                                        >
                                        <Card key={i}>
                                            <CardContent>
                                                <div className="space-y-4 p-3">
                                                    <div className='flex justify-between'>
                                                        <Badge variant="orange" radius='full' size='icon' className='font-bold'>{ item.id }</Badge>
                                                        <div>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                        <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500'/>
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto! p-0">
                                                                    <Card>
                                                                        <CardContent className='p-2'>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Edit</Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Delete</Button>
                                                                        </CardContent>
                                                                    </Card>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div> 
                                                    <p className="line-clamp-5 text-xs/5 font-medium overflow-auto">
                                                        Engaging and welcoming tone of voice for the new and excising users.
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">Sofia Walker</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">January 01, 2024</p>
                                                        <Button type="button" variant={'ghost'}>
                                                            <LucideMessageSquareText className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                            15 
                                                        </Button>
                                                    </div>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card className='h-fit w-[275px] shrink-0 space-y-2 rounded-lg bg-white p-2 dark:bg-white/10'>
                    <CardHeader className="font-semibold text-black">
                        <div className="dark:bg-black-dark rounded-lg bg-white shadow-3xl dark:shadow-sm flex items-center justify-between px-4 py-2.5" id="toDo">
                            <div className="inline-flex items-center gap-2.5">
                                <span className="size-1.5 rounded-full bg-success"></span>
                                <h3 className="text-xs/tight font-bold lowercase text-black first-letter:uppercase dark:text-white">done</h3>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="min-h-[200px]"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => {handleOnDrop(e, 'completed')}}
                        >
                            {completed &&
                                completed.map((item: any, i) => {
                                    return (
                                            <div
                                            className='mb-3'
                                            draggable
                                            key={i}
                                            onDragStart={(e) => {
                                                handleOnDrag(e, item);
                                            }}
                                        >
                                        <Card key={i}>
                                            <CardContent>
                                                <div className="space-y-4 p-3">
                                                    <div className='flex justify-between'>
                                                        <Badge variant="orange" radius='full' size='icon' className='font-bold'>{ item.id }</Badge>
                                                        <div>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                        <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500'/>
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto! p-0">
                                                                    <Card>
                                                                        <CardContent className='p-2'>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Edit</Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant={'ghost'}
                                                                                className="block w-full rounded-lg px-2.5 py-1.5 text-xs/tight font-medium text-black outline-hidden hover:bg-light-theme ltr:text-left rtl:text-right dark:text-gray-500 dark:hover:bg-gray-200/10 dark:hover:text-white"
                                                                            >Delete</Button>
                                                                        </CardContent>
                                                                    </Card>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div> 
                                                    <p className="line-clamp-5 text-xs/5 font-medium overflow-auto">
                                                        Engaging and welcoming tone of voice for the new and excising users.
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">Borhan Loli</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">January 01, 2024</p>
                                                        <Button type="button" variant={'ghost'}>
                                                            <LucideMessageSquareText className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                            15 
                                                        </Button>
                                                    </div>
                                                    </div>
                                            </CardContent>
                                        </Card>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}