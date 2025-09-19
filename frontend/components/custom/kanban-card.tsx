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
import { formatDate, isOverdue, nowStr } from '@/lib/utils'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Drawer } from 'vaul'
import { DataTable } from './table/data-table'
import { dashboardcolumns, ITable } from './table/dashboard-columns'
import Loader from '../ui/loader'
import { historyColumns } from './table/block-history-columns'
import DialogUi from '../ui/dialog'
import { Calendar } from '../ui/calendar'
import { format } from 'date-fns'
import { log } from 'console'

export const KanbanCard = ({ task, tabs, aiRef }: any) => {
    const [todo, setTodo] = useState<object[]>([])
    const [ongoing, setOngoing] = useState<object[]>()
    // const [review, setReview] = useState<object[]>()
    const [completed, setCompleted] = useState<object[]>()

    // MARK: Actors
    const [taskActor, setTaskActor] = useState<any>(null);
    const [projectActor, setProjectActor] = useState<any>(null)
    const [userActor, setUserActor] = useState<any>(null)

    const initActors = async (): Promise<{ tActor: any; pActor: any; uActor: any }> => {
        const tActor = await initActor("task");
        const pActor = await initActor("project");
        const uActor = await initActor("user");

        setTaskActor(tActor);
        setProjectActor(pActor);
        setUserActor(uActor);

        return {
            tActor,
            pActor,
            uActor,
        };
    };

    const setTask = async (actors: any) => {
        const todoData = []
        const ongoingData = []
        const doneData = []
        for (let obj in task) {
            const typeTask: string = Object.keys(task[obj].status).toString()
            task[obj].id = Number(task[obj].id)
            task[obj].projectId = Number(task[obj].projectId)
            task[obj].dueDate = Number(task[obj].dueDate)
            task[obj].dueDateText = formatDate(task[obj].dueDate)

            // Get task history
            task[obj].history = []
            const history = await actors.tActor.getTaskHistory(parseFloat(task[obj].id))
            if (typeof history.ok !== 'undefined') {
                // Naturalize big int
                task[obj].history = history.ok.map((h: any) => {
                    return {
                        hash: h.hash,
                        id: Number(h.id),
                        timestamp: Number(h.timestamp),
                    }
                })
            }
            console.log("history", task[obj].history);

            // Get user assignees
            const user = await actors.uActor.getUserDetail(task[obj].assignees[0])
            task[obj].assignees = []
            if (typeof user.ok !== 'undefined') {
                task[obj].assignees = [user.ok]
            }

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

        // MARK: Reset kanban card
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

        // MARK: Update status task
        let taskId = parseFloat(item.id)
        switch (kanban) {
            case 'todo':
                if (todo) {
                    const resTask = await taskActor.updateTaskStatus(taskId, { ["todo"]: null })
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
                    const resTask = await taskActor.updateTaskStatus(taskId, { ["in_progress"]: null })
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
                    const resTask = await taskActor.updateTaskStatus(taskId, { ["done"]: null })
                    if (resTask.err) {
                        return alert(resTask.err)
                    }
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
        const init = async () => {
            const actors = await initActors();

            const id: any = localStorage.getItem('project_id');
            setTask(actors);
        };

        init();
    }, [task])

    // MARK: Task item
    const taskItem = (item: any, key: any) => {
        return (
            <div
                className='mb-3'
                draggable
                key={key}
                onDragStart={(e) => handleOnDrag(e, item)}
            >
                <Card key={key}>
                    <CardContent>
                        <div className="space-y-4 p-3">
                            <div>
                                {isOverdue(item.dueDate) && (
                                    <Badge variant="danger" size="small" className="font-bold text-xs mb-2">
                                        Overdue
                                    </Badge>
                                )}
                                <h4 className="font-bold leading-tight text-black dark:text-white">
                                    {item.title}
                                </h4>
                            </div>
                            <span className="hidden h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />
                            <p className="line-clamp-5 text-xs/5 font-medium overflow-auto">
                                {item.desc}
                            </p>
                            <div className="inline-flex items-center gap-1">
                                {item.assignees.map((team: any, i: number) => {
                                    const rand = Math.floor(Math.random() * 4) + 1; // Random 1-4
                                    return (
                                        <>
                                            <Image
                                                key={key}
                                                src={`/images/kanban-avatar${rand}.svg`}
                                                alt="avatar"
                                                width={28}
                                                height={28}
                                                className={`size-[28px] rounded-full ${i < 2 ? "hidden xl:block" : ""}`}
                                            />
                                            <span className='text-xs'>{team.firstName} {team.lastName}</span>
                                        </>
                                    )
                                })}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center">
                                    <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">
                                        {item.dueDateText}
                                    </p>
                                    <Button type="button" variant={'ghost'} className="pr-0">
                                        <LucideMessageSquareText className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
                                    </Button>

                                    <Drawer.Root>
                                        <Drawer.Trigger asChild>
                                            <Button type="button" variant={'ghost'} className='pr-0'>
                                                <History className='size-2 text-black hover:text-gray dark:text-white dark:hover:text-gray-500' />
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
                                                            columns={historyColumns}
                                                            data={item.history}
                                                            filterField={'id'}
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
                                            <Button variant="outline-general">
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
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="min-h-[200px]"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => { handleOnDrop(e, 'todo') }}
                        >
                            {todo && todo.map((item: any, i) => {
                                return taskItem(item, i)
                            })}
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
                            {ongoing && ongoing.map((item: any, i) => {
                                return taskItem(item, i)
                            })}
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
                            {completed && completed.map((item: any, i) => {
                                return taskItem(item, i)
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}