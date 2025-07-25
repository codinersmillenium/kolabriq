import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideMessageSquareText, LucidePlus, LucideUser, LucideEllipsis } from 'lucide-react'
import { useState, DragEvent, useEffect } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { initActor } from '@/lib/canisters'
import { Principal } from '@dfinity/principal'

export const KanbanCard = ({ task, tabs }: any) => {
    // const taskTodo: Object[] = [
    //     {
    //         id: '1',
    //         tags: 'frontend',
    //         user: 'Burhan Loli',
    //         task: 'Engaging and welcoming tone of voice for the new and excising users.',
    //         date: 'January 01, 2024',
    //         comment: {
    //             id: '1',
    //             total: 15
    //         }
    //     }
    // ]

    const [todo, setTodo] = useState<object[]>([])
    const [ongoing, setOngoing] = useState<object[]>()
    // const [review, setReview] = useState<object[]>()
    const [completed, setCompleted] = useState<object[]>()

    const setTask = () => {
        const todoData = []
        const ongoingData = []
        const doneData = []
        console.log(task)
        for (let obj in task) {
            const typeTask: string = Object.keys(task[obj].status).toString()
            task[obj].dueDate = Number(task[obj].dueDate);
            const date = new Date(task[obj].dueDate);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            task[obj].id = Number(task[obj].id)
            task[obj].projectId = Number(task[obj].projectId)
            task[obj].dueDateText = formattedDate
            var assign = ''
            for (let i in task[obj].assignees) {
                task[obj].assignees[i].createdAt = Number(task[obj].assignees[i].createdAt)
                assign += task[obj].assignees[i].firstName + ' ' + task[obj].assignees[i].lastName + '\n'
            }
            task[obj].name = assign
            switch(typeTask) {
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
    
    const [formData, setFormData]: any = useState({
        title: '',
        taskTag: [],
        description: '',
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
                    formData.taskTag = {[tag[i].value]: null}
                    break
                }
            }
            const dueDate_: any = document.querySelector('#due_date')
            const [year, month, day] = dueDate_.value.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            formData.dueDate = date.getTime()
            formData.assignees =[Principal.fromText(formData.assignees_)]
            formData.projectId = parseFloat(tabs.id)
            console.log(formData)
            const actor = await initActor('task')
            await actor.createTask(formData)
            alert('Success Create Task...')
            setTimeout(() => {
                window.location.href = '/'
            }, 100);
        } catch (error) {
            alert('Failed Register User...');
        }
    }

    useEffect(() => {
        setTask()
    }, [task])
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
                                                            name='description'
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
                                                                    <input type="radio" name="tags" value="ui" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange}/>
                                                                    <span className="text-sm text-gray-700">UI/UX Design</span>
                                                                </label>
                                                                <label className="flex items-center space-x-2">
                                                                    <input type="radio" name="tags" value="bussines_analist" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange}/>
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
                                                        <Badge variant="orange" radius='full' size='icon' className='font-bold'>{ item.title }</Badge>
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
                                                        { item.description }
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">{ 
                                                            item.name
                                                        }</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">{ item.dueDateText }</p>
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
                                                        <Badge variant="grey-300" radius='full' size='icon' className='font-bold'>{ item.title }</Badge>
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
                                                        { item.description }
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">{ 
                                                            item.name
                                                        }</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">{ item.dueDateText }</p>
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
                                                        <Badge variant="green" radius='full' size='icon' className='font-bold'>{ item.title }</Badge>
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
                                                        { item.description }
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 shrink-0 overflow-hidden rounded-lg">
                                                            <LucideUser/>
                                                        </div>
                                                        <span className="text-xs/tight font-medium text-black dark:text-white">{ 
                                                            item.name
                                                        }</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-xs/tight font-medium ltr:ml-0 ltr:mr-auto rtl:ml-auto rtl:mr-0">{ item.dueDateText }</p>
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