import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideMessageSquareText, LucidePlus, LucideUser, LucideEllipsis, WandSparkles, SquarePen, History } from 'lucide-react'
import { useState, DragEvent, useEffect } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { initActor } from '@/lib/canisters'
import { Principal } from '@dfinity/principal'
import { AskButton } from '../ai/chatbot'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Drawer } from 'vaul'
import { DataTable } from './table/data-table'
import { dashboardcolumns, ITable } from './table/dashboard-columns'

export const KanbanCard = ({ task, tabs, aiRef }: any) => {
    const [todo, setTodo] = useState<object[]>([])
    const [ongoing, setOngoing] = useState<object[]>()
    // const [review, setReview] = useState<object[]>()
    const [completed, setCompleted] = useState<object[]>()

    const setTask = () => {
        const todoData = []
        const ongoingData = []
        const doneData = []
        for (let obj in task) {
            const typeTask: string = Object.keys(task[obj].status).toString()
            task[obj].id = Number(task[obj].id)
            task[obj].projectId = Number(task[obj].projectId)
            task[obj].dueDateText = formatDate(task[obj].dueDate)

            console.log(task[obj]);


            var assign = ''
            for (let i in task[obj].assignees) {
                task[obj].assignees[i].createdAt = Number(task[obj].assignees[i].createdAt)
                assign += task[obj].assignees[i].firstName + ' ' + task[obj].assignees[i].lastName + '\n'
            }
            task[obj].name = assign
            switch (typeTask) {
                case 'todo':
                    todoData.push(task[obj])
                    break;
                case 'in_progress':
                    ongoingData.push(task[obj])
                    break;
                case 'done':
                    doneData.push(task[obj])
                    break;
            }

        }
        setTodo(todoData)
        setOngoing(ongoingData)
        setCompleted(doneData)
    }

    const handleOnDragOver = (e: DragEvent) => {
        e.preventDefault();
    }

    const handleOnDrag = (e: DragEvent, item: object) => {
        e.dataTransfer.setData("item", JSON.stringify(item))
    }

    const handleOnDrop = async (e: DragEvent, kanban: string) => {
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
                    const actorTask_ = await initActor('task')
                    const resTask = await actorTask_.updateStatus(parseFloat(item.id), { ["todo"]: null })
                    if (resTask.err) {
                        return alert(resTask.err)
                    }
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
                    const actorTask_ = await initActor('task')
                    const resTask = await actorTask_.updateStatus(parseFloat(item.id), { ["in_progress"]: null })
                    if (resTask.err) {
                        return alert(resTask.err)
                    }
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
                    const actorTask_ = await initActor('task')
                    const resTask = await actorTask_.updateStatus(parseFloat(item.id), { ["done"]: null })
                    if (resTask.err) {
                        return alert(resTask.err)
                    }
                    aiRef.current?.triggerGamified(item.title);
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

    const [formData, setFormData]: any = useState({
        title: '',
        taskTag: [],
        desc: '',
        assignees_: ''
    })
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
            const tag: any = document.querySelectorAll('[name="tags"]')
            formData.taskTag = {}
            for (let i = 0; i < tag.length; i++) {
                if (tag[i].checked) {
                    formData.tag = { [tag[i].value]: null }
                    break
                }
            }
            const dueDate_: any = document.querySelector('#due_date')
            const [year, month, day] = dueDate_.value.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            formData.dueDate = Math.floor(date.getTime() / 1000)
            formData.assignees = [Principal.fromText(formData.assignees_)]
            formData.projectId = parseFloat(tabs.id)
            console.log(formData);

            const actor = await initActor('task')
            await actor.createTask(formData)
            alert('Success Create Task...')
            setTimeout(() => {
                window.location.href = '/'
            }, 100);
        } catch (error) {
            console.error(error)
            alert('Failed Register User...');
        }
    }

    const handleTriggerAsk = (taskTitle: string) => {
        aiRef.current?.triggerContext(taskTitle);
    };

    useEffect(() => {
        setTask()
    }, [task])

    const data: ITable[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${200250 + i}`,
        receptionist: {
            image: '/images/avatar.svg',
            name: `User ${i + 1}`,
        },
        sales_id: `#${200250 + i}`,
        amount: `$${(Math.random() * 1000).toFixed(2)}`,
        due_date: `Mar ${25 + i}, 2024`,
        status: i % 2 === 0 ? 'done' : 'pending',
    }));

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
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant={'ghost'}>
                                            <LucidePlus className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="min-w-lg p-3">
                                        <Card>
                                            <CardContent className='max-h-[300px] p-2 overflow-auto'>
                                                <form className="space-y-[30px]" onSubmit={handleSubmit}>
                                                    <div className="relative space-y-1">
                                                        <Input
                                                            name='title'
                                                            type="text"
                                                            variant={'input-form'}
                                                            placeholder="Enter title..."
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="relative space-y-1">
                                                        <Textarea
                                                            name='desc'
                                                            placeholder='Enter description...'
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="relative space-y-1 flex align-items-center">
                                                        <label className="block font-semibold leading-none text-black">
                                                            Task Deadline
                                                        </label>
                                                        <input type="date"
                                                            id="due_date"
                                                            name='dueDate_'
                                                            className='ms-3 border'
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="relative space-y-1">
                                                        <Input
                                                            name='assignees_'
                                                            type="text"
                                                            variant={'input-form'}
                                                            placeholder="Enter id to assign task..."
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className='relative space-y-1'>
                                                        <fieldset className="border border-gray-300 p-4 rounded-md">
                                                            <legend className="text-sm font-medium text-gray-700 mb-2">Tags</legend>
                                                            <div className="space-y-2">
                                                                <label className="flex items-center space-x-2">
                                                                    <input type="radio" name="tags" value="frontend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                                    <span className="text-sm text-gray-700">Frontend Developer</span>
                                                                </label>
                                                                <label className="flex items-center space-x-2">
                                                                    <input type="radio" name="tags" value="backend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                                    <span className="text-sm text-gray-700">Backend Developer</span>
                                                                </label>
                                                                <label className="flex items-center space-x-2">
                                                                    <input type="radio" name="tags" value="ui" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                                    <span className="text-sm text-gray-700">UI/UX Design</span>
                                                                </label>
                                                                <label className="flex items-center space-x-2">
                                                                    <input type="radio" name="tags" value="bussines_analist" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                                                                    <span className="text-sm text-gray-700">Bussiness Analyst</span>
                                                                </label>
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        variant={'black'}
                                                        size={'large'}
                                                        className="w-full"
                                                    >
                                                        Add Task
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="min-h-[200px]"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => { handleOnDrop(e, 'todo') }}
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
                                                        {/* <AskButton onTrigger={() => handleTriggerAsk(item.title)} /> */}
                                                        <div className='flex justify-between'>
                                                            <h4 className="font-bold leading-tight text-black dark:text-white">{item.title}</h4>
                                                            {/* <Badge variant="blue" size='icon' className='font-bold rounded-sm text-sm'>{item.title}</Badge> */}
                                                            {/* <div>
                                                                <Popover>
                                                                    <div className='flex items-center gap-2'>
                                                                        <PopoverTrigger asChild>
                                                                            <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                                <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                    </div>
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
                                                            </div> */}
                                                        </div>
                                                        <span className="hidden h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />
                                                        <p className="line-clamp-5 text-xs/5 font-medium overflow-auto">
                                                            {item.desc}
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 -space-x-4.5">
                                                            {[1, 2, 3, 4].map((team: any, i: number) => {
                                                                const rand = Math.floor(Math.random() * 4) + 1; // hasil 1,2,3,4
                                                                return (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Image
                                                                                    key={i}
                                                                                    src={`/images/kanban-avatar${rand}.svg`}
                                                                                    alt="avatar"
                                                                                    width={30}
                                                                                    height={30}
                                                                                    className={`size-[30px] rounded-full ${i < 2 ? "hidden xl:block" : ""}`}
                                                                                    title={"asd"}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {`team ${team}`}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>

                                                                )
                                                            })}
                                                            <Button
                                                                type="button"
                                                                className="grid h-[30px] min-w-[30px] shrink-0 place-content-center rounded-full border-2 border-white bg-gray-300 px-1 text-[11px]/none font-bold text-black shadow-sm"
                                                            >
                                                                +5
                                                            </Button>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center">
                                                                <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">
                                                                    {item.dueDateText}
                                                                </p>
                                                                <Button type="button" variant={'ghost'} className="pr-0">
                                                                    <LucideMessageSquareText className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                                    15
                                                                </Button>

                                                                <Drawer.Root>
                                                                    <Drawer.Trigger>
                                                                        <Button type="button" variant={'ghost'}>
                                                                            <History className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                                            15
                                                                        </Button>
                                                                    </Drawer.Trigger>
                                                                    <Drawer.Portal>
                                                                        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                                                                        <Drawer.Title />
                                                                        <Drawer.Content className="bg-gray-100 h-fit w-[calc(100%-260px)] fixed bottom-0 right-0 outline-none">
                                                                            <Card className="grow overflow-x-auto shadow-sm">
                                                                                <CardHeader className="flex items-center justify-between px-5 py-3.5">
                                                                                    <h2 className="whitespace-nowrap text-base/5 font-semibold text-black">
                                                                                        Task History
                                                                                    </h2>
                                                                                    <div className="flex items-center gap-2 sm:gap-4">
                                                                                        <div id="search-table" hidden></div>
                                                                                    </div>
                                                                                </CardHeader>
                                                                                <CardContent className="overflow-y-auto max-h-[375px]">
                                                                                    <DataTable
                                                                                        columns={dashboardcolumns}
                                                                                        data={data}
                                                                                        filterField={'sales_id'}
                                                                                        isRemovePagination={false}
                                                                                    />
                                                                                </CardContent>
                                                                            </Card>
                                                                        </Drawer.Content>
                                                                    </Drawer.Portal>
                                                                </Drawer.Root>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => console.log("asd")}
                                                                    className="flex-grow text-xs p-2 py-2 bg-linear-to-r from-danger/80 to-warning/50 text-white rounded flex items-center justify-center gap-1 rounded-md"
                                                                >
                                                                    <WandSparkles size={16} />
                                                                    Ask for Details
                                                                </button>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline-general"
                                                                            onClick={() => console.log("asd")}
                                                                        >
                                                                            <LucideEllipsis size={16} />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto! p-0" align="start">
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
                            onDrop={(e) => { handleOnDrop(e, 'ongoing') }}
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
                                                            <AskButton onTrigger={() => handleTriggerAsk(item.title)} />
                                                            <Badge variant="grey-300" radius='full' size='icon' className='font-bold'>{item.title}</Badge>
                                                            <div>
                                                                <Popover>
                                                                    <div className='flex items-center gap-2'>
                                                                        <PopoverTrigger asChild>
                                                                            <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                                <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                    </div>
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
                                                            {item.desc}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                                <LucideUser />
                                                            </div>
                                                            <span className="text-xs/tight font-medium text-black dark:text-white">{
                                                                item.name
                                                            }</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">{item.dueDateText}</p>
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
                            onDrop={(e) => { handleOnDrop(e, 'completed') }}
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
                                                            <AskButton onTrigger={() => handleTriggerAsk(item.title)} />
                                                            <Badge variant="green" radius='full' size='icon' className='font-bold'>{item.title}</Badge>
                                                            <div>
                                                                <Popover>
                                                                    <div className='flex items-center gap-2'>
                                                                        <PopoverTrigger asChild>
                                                                            <button type="button" className='outline rounded-[2px] outline-offset-2 outline-sky-500 focus:outline-1'>
                                                                                <LucideEllipsis className='size-[18px] text-black transition hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                    </div>
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
                                                            {item.desc}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                                <LucideUser />
                                                            </div>
                                                            <span className="text-xs/tight font-medium text-black dark:text-white">{
                                                                item.name
                                                            }</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">{item.dueDateText}</p>
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