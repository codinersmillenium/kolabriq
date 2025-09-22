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
import { HTMLAttributes, use, useEffect, useRef, useState } from 'react'
import DialogUI from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Search } from 'lucide-react'
import ProjectCard from '@/components/custom/project-card'
import { Input } from '@/components/ui/input'
import { getPrincipal, initActor } from '@/lib/canisters'
import { useAuth } from '@/context/auth-context'
import ProjectPlanner from '@/components/ai/project-planner'
import Chatbot, { ChatbotRef } from '@/components/ai/chatbot'
import { TeamKey } from '@/types/project'
import { toE8s } from '@/lib/utils'

const Table = () => {
    const [filter, setFilter] = useState<object>({
        status: '',
        type: ''
    })
    const [isDialogProjectOpen, setDialogProjectOpen] = useState<boolean>(false)
    const [dialogTitle, setDialogTitle] = useState("Add project")
    const [formData, setFormData] = useState<any>({
        name: '',
        desc: '',
        tags_: [],
        projectType_: [],
        reward: 0,
        thumbnail: null,
    })
    const [rewards, setRewards] = useState(false)

    type Team = Record<TeamKey, boolean>;
    const [team, useTeam] = useState<Team>({
        frontend: false,
        backend: false,
        ui: false,
        bussines_analist: false,
    })

    const roles: { label: string; key: TeamKey }[] = [
        { label: "Frontend Developer", key: "frontend" },
        { label: "Backend Developer", key: "backend" },
        { label: "UI/UX Designer", key: "ui" },
        { label: "Business Analyst", key: "bussines_analist" },
    ];
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
    const projectReward = (rewardKey: string) => {
        setRewards(rewardKey == "rewarded")
        setFormData({
            ...formData,
            ["projectType_"]: rewardKey
        })
    }
    const handleChange = (e: any) => {
        const { name, value, files, type } = e.target

        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : value
        })
    }
    const handleChangeReward = (e: any) => {
        // Only number and decimal
        let value = e.target.value.replace(/[^0-9.]/g, "");

        // Max 8 decimal (e8s)
        if (value.includes(".")) {
            const [int, decimal] = value.split(".");
            value = int + "." + decimal.slice(0, 8);
        }

        e.target.value = value;
        handleChange(e);
    }
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            formData.tags = []
            document.querySelectorAll<HTMLInputElement>('[name="tags[]"]').forEach((tag) => {
                if (tag.checked) {
                    formData.tags.push({ [tag.value]: null })
                }
            })

            formData.projectType = { [formData.projectType_]: null }
            formData.reward = toE8s(Number(formData.reward) || 0)

            // handle file data
            const arrayBuffer = await formData.thumbnail.arrayBuffer();
            formData.thumbnail = Array.from(new Uint8Array(arrayBuffer));
            const actor = await initActor('project')
            const ok = await actor.createProject(formData)
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

    const aiRef = useRef<ChatbotRef>(null);

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
                        <Button variant={'black'} onClick={() => setDialogProjectOpen(true)}>
                            <Plus />
                            Add Project
                        </Button>
                        <DialogUI open={isDialogProjectOpen} onOpenChange={setDialogProjectOpen} title={dialogTitle} content={
                            <div>
                                <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />
                                <div className='pt-4'>
                                    <form className="px-[3px]" onSubmit={handleSubmit}>
                                        <div className='space-y-5 max-h-[350px] overflow-y-scroll ps-[2px] pr-[10px]'>
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter project name (e.g., Mobile App Redesign)"
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
                                                    placeholder="Write a brief description about your project, goals, or requirements..."
                                                    name='desc'
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Thumbnail
                                                </label>
                                                <Input
                                                    type="file"
                                                    name="thumbnail"
                                                    accept="image/*"
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2.5">
                                                <label className="block font-semibold leading-tight text-black">
                                                    Project Tags
                                                </label>
                                                {roles.map((role) => (
                                                    <div key={role.key} className="flex justify-between">
                                                        <label className="flex items-center space-x-2 w-full">
                                                            <input
                                                                type="checkbox"
                                                                name="tags[]"
                                                                value={role.key}
                                                                className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                                                                onChange={setTeam}
                                                            />
                                                            <span className="text-sm text-black w-full">{role.label}</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-2.5 pb-4">
                                                <label className="font-semibold leading-tight inline-block">
                                                    Project Reward
                                                </label>
                                                <div className='flex gap-2'>
                                                    <Select onValueChange={projectReward}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Reward Option" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="rewarded">
                                                                Yes, this project has rewards
                                                            </SelectItem>
                                                            <SelectItem value="free">
                                                                No reward
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {rewards && (
                                                        <div className="relative max-w-[200px]">
                                                            <Input
                                                                autoFocus
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder="Total"
                                                                name="reward"
                                                                className="w-full pr-12"
                                                                onChange={handleChangeReward}
                                                            />
                                                            <span className="absolute inset-y-0 right-3 flex items-center text-black text-sm">
                                                                ICP
                                                            </span>
                                                        </div>

                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50 mb-4" />
                                        <div className="flex items-center justify-between gap-4">
                                            <Button
                                                variant={'outline-general'}
                                                size={'large'}
                                                onClick={() => {
                                                    setDialogTitle("Add Project")
                                                    setDialogProjectOpen(false)
                                                }}
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
                                </div>
                            </div>
                        } />
                        <ProjectPlanner />
                    </div>
                </div>
                <ProjectCard filter={filter} page={pages} dialogProjectOpen={setDialogProjectOpen} dialogTitle={setDialogTitle} />
                <Chatbot ref={aiRef} />
            </div>
        </div>
    )
}

export default Table
