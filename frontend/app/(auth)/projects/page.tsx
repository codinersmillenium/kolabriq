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
import { HTMLAttributes, use, useEffect, useState } from 'react'
import DialogUI from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Search } from 'lucide-react'
import ProjectCard from '@/components/custom/project-card'
import { Input } from '@/components/ui/input'
import { getPrincipal, initActor } from '@/lib/canisters'
import { useAuth } from '@/context/auth-context'
import ProjectPlanner from '@/components/ai/project-planner'

const Table = () => {
    const [filter, setFilter] = useState<object>({
        status: 'new',
        type: 'free'
    })
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
    const [formData, setFormData] = useState<any>({
        name: '',
        desc: '',
        tags_: [],
        projectType_: [],
        reward: 0
    })
    const [rewards, setRewards] = useState(false)
    const [team, useTeam] = useState({
        frontend: false,
        backend: false,
        ui: false,
        bussines_analist: false,
    })
    const [pages, setPages] = useState({
        path: 'projects',
        role: ''
    }) 

    const setTeam = (e: any) => {
        const { value, checked } = e.target
        useTeam({
            ...team,
            [value]: checked
        })
        handleChange(e)
    }
    const openRewards = (e: any) => {
        if (e.target.value === 'free') {
            setRewards(false)
        } else {
            setRewards(true)
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
            formData.projectType = {[formData.projectType_]: null}
            formData.reward = parseFloat(formData.reward)
            for (let i = 0; i < tag.length; i++) {
                if (tag[i].checked) {
                    const tagDev: any = document.querySelector('[name="' + tag[i].value + '"]')
                    const index = parseInt(tagDev.value)
                    for (let j = 0; j < index; j++) {
                        formData.tags.push({[tag[i].value]: null})
                    }
                }
            }
            const actor = await initActor('project')
            const ok = await actor.createProject(formData)
            console.log(ok)
            alert('Success Create Project...');
            setTimeout(() => {
                window.location.href = '/projects'
            }, 1000);
        } catch (error) {
            alert('Failed Register User...');
        }
    }

    const { user }: any = useAuth()
    useEffect(() => {
        if (user.role) {
            setPages({
                ...pages,
                role: Object.keys(user.role).toString()
            })
        }
    }, [user.role])

    return (
        <div className="space-y-4">
            <PageHeading heading={'Project Setting'} />
            <div className="min-h-[calc(100vh-160px)] w-full">
                <div className="flex items-center justify-end gap-4 overflow-x-auto rounded-t-lg bg-white px-5 py-[17px]">
                    <div className="flex items-center gap-2.5">
                        <Select onValueChange={(e) => {
                            setFilter(prev => ({
                                ...prev,
                                status: e
                            }));
                        }} defaultValue='new'>
                            <SelectTrigger className="py-2 text-xs text-black shadow-sm ring-1 ring-gray-300" title='Project Status'>
                                <SelectValue placeholder="Project Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="space-y-1.5">
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="new"
                                        defaultChecked={true}
                                    >
                                        New
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="in_progress"
                                    >
                                        In Progress
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="done"
                                    >
                                        Done
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="review"
                                    >
                                        Review
                                    </SelectItem>
                                </div>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(e) => {
                            setFilter(prev => ({
                                ...prev,
                                type: e
                            }));
                        }}
                            defaultValue='free'>
                            <SelectTrigger className="py-2 text-xs text-black shadow-sm ring-1 ring-gray-300" title='Project Type'>
                                <SelectValue placeholder="Project Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="space-y-1.5">
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="free"
                                    >
                                        Without reward
                                    </SelectItem>
                                    <SelectItem
                                        className="text-xs/tight"
                                        value="rewarded"
                                    >
                                        Rewarded
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
                                        <form className="space-y-5 p-3" onSubmit={handleSubmit}>
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter name here"
                                                    name='name'
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Desc
                                                </label>
                                                <Textarea
                                                    placeholder="Enter desc here..."
                                                    name='desc'
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <fieldset className="border border-gray-300 p-4 rounded-md">
                                                    <legend className="text-sm font-medium text-gray-700 mb-2">Team</legend>
                                                    <div className="space-y-2">
                                                        <div className='flex justify-between'>
                                                            <label className="flex items-center space-x-2">
                                                                <input type="checkbox" name="tags[]" value="frontend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={setTeam} />
                                                                <span className="text-sm text-gray-700">Frontend Developer</span>
                                                            </label>
                                                            {team.frontend && (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Total"
                                                                    name='frontend'
                                                                    min={1}
                                                                    onChange={handleChange}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <label className="flex items-center space-x-2">
                                                                <input type="checkbox" name="tags[]" value="backend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={setTeam} />
                                                                <span className="text-sm text-gray-700">Backend Developer</span>
                                                            </label>
                                                            {team.backend && (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Total"
                                                                    name='backend'
                                                                    min={1}
                                                                    onChange={handleChange}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <label className="flex items-center space-x-2">
                                                                <input type="checkbox" name="tags[]" value="ui" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={setTeam}/>
                                                                <span className="text-sm text-gray-700">UI/UX Design</span>
                                                            </label>
                                                            {team.ui && (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Total"
                                                                    name='ui'
                                                                    min={1}
                                                                    onChange={handleChange}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <label className="flex items-center space-x-2">
                                                                <input type="checkbox" name="tags[]" value="bussines_analist" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={setTeam}/>
                                                                <span className="text-sm text-gray-700">Bussiness Analyst</span>
                                                            </label>
                                                            {team.bussines_analist && (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Total"
                                                                    name='bussines_analist'
                                                                    min={1}
                                                                    onChange={handleChange}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="font-semibold leading-tight inline-block">
                                                    Project Reward
                                                </label>
                                                <div className='flex'>
                                                    <select name="projectType_" onChange={openRewards}>
                                                        <option value="">Change Option</option>
                                                        <option value="rewarded">Yes</option>
                                                        <option value="free">No</option>
                                                    </select>
                                                    {rewards && (
                                                        <Input
                                                            type="number"
                                                            placeholder="Total Rewards"
                                                            name="reward"
                                                            className='ms-3'
                                                            onChange={handleChange}
                                                        />
                                                    )}
                                                </div>
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
                        <ProjectPlanner/>
                    </div>
                </div>
                <ProjectCard filter={filter} page={pages}/>
            </div>
        </div>
    )
}

export default Table
