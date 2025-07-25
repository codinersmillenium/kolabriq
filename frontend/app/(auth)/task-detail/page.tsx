'use client'


import PageHeading from '@/components/layout/page-heading'
import { Button } from '@/components/ui/button'
import { Star, Settings, Plus, FilePlus2, Share2, LucideSearch, LucideListFilter } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScheduleTimeline } from '@/components/custom/schedule-timeline'
import { KanbanCard } from '@/components/custom/kanban-card'
import { getPrincipal, initActor } from '@/lib/canisters'
import { Badge } from '@/components/ui/badge'
import AIProjectGenerator, { AIProjectGeneratorRef, AnalysisButton } from '@/components/ai/chatbot'

const Table = () => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [task, setTask] = useState<[]>([])
    const [taskId, setTaskId] = useState<any>([])
    const [idProject, setIdProject] = useState()

    const getTask = async (id: any) => {
      setIdProject(id)
      const actor_ = await initActor('task')
      const { ok } = await actor_.getProjectTasks(parseFloat(id))
      // console.log(ok)
      if (typeof ok !== 'undefined') {
        setTask(ok)
      }
    }
    const getTaskByid = async (id: any) => {
      const actor_ = await initActor('task')
      const { ok } = await actor_.getUserProjectTasks(getPrincipal()[1], parseFloat(id))
      if (typeof ok !== 'undefined') {
        setTaskId([ok])
      }
    }

    useEffect(() => {
      const id :any = localStorage.getItem('project_id')
      getTask(id)
      getTaskByid(id)
      aiRef.current?.triggerDailyStandUp(id);
    }, [])

    const handleTriggerAnalysis = (idProject: any) => {
      idProject
        ? aiRef.current?.triggerContext(idProject)
        : console.warn("id project not found");
    };

    const aiRef = useRef<AIProjectGeneratorRef>(null);
    
    return (
        <div className="space-y-4">
            <PageHeading heading={'Workspace'} />
            <div className="min-h-[calc(100vh-160px)] w-full">
                <div className="dark:bg-black-dark rounded-lg bg-white dark:shadow-sm flex flex-col justify-between gap-4 rounded-b-none px-5 py-3.5 shadow-sm md:flex-row md:items-center">
      {/* Left Side: Title & Status */}
      <div className="flex shrink-0 grow flex-col items-start gap-1.5">
        <div className="inline-flex items-center gap-2.5">
          <h2 className="text-lg/tight font-semibold text-black dark:text-white">
            Kolabriq App
          </h2>

          <button type="button">
            <Star className="size-[18px] transition hover:fill-warning hover:text-warning" />
          </button>

          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            aria-controls="settings-dialog"
            data-state={settingsOpen ? 'open' : 'closed'}
            className="data-[state=open]:text-black dark:data-[state=open]:text-white"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Settings className="size-[18px] transition hover:text-black dark:hover:text-white" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black [&>svg]:size-3.5 [&>svg]:shrink-0 bg-light-orange px-1.5 py-[3px] leading-[12px] rounded-full">
          In Progress
        </div>
       
      </div>

      {/* Right Side: Avatars & Actions */}
      <div className="inline-flex flex-wrap items-center gap-2.5 md:justify-end">
        {/* Avatars */}
        <div className="inline-flex items-center -space-x-2">
          {['kanban-avatar1', 'kanban-avatar2', 'kanban-avatar3', 'kanban-avatar4'].map((avatar, i) => (
            <Image
              key={i}
              src={`/images/${avatar}.svg`}
              alt="avatar"
              width={30}
              height={30}
              className={`size-[30px] rounded-full ${i < 2 ? 'hidden xl:block' : ''}`}
            />
          ))}

          <Button
            type="button"
            className="grid h-[30px] min-w-[30px] shrink-0 place-content-center rounded-full border-2 border-white bg-gray-300 px-1 text-[11px]/none font-bold text-black shadow-sm"
          >
            +5
          </Button>
        </div>

        {/* Add Member */}
        <Button
          type="button"
          className="grid size-[30px] place-content-center rounded-full border-2 border-white bg-primary text-white hover:bg-[#2A4DD7] shadow-[0_0_21px_0_rgba(51,92,255,0.2)] transition"
        >
          <Plus className="size-4" />
        </Button>

        {/* Divider */}
        <span className="hidden h-6 w-px rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <AnalysisButton onTrigger={() => handleTriggerAnalysis(idProject)}/>
          <Button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 text-xs/4 font-medium px-2.5 py-2 rounded-lg bg-black text-white hover:bg-[#3C3C3D] dark:bg-white dark:text-black dark:hover:text-white dark:hover:bg-black transition"
            disabled
          >
            <FilePlus2 className="size-4 shrink-0" />
            Push Project
          </Button>

          <Button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 text-xs/4 font-medium px-2.5 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white text-black hover:bg-gray-200 dark:text-white dark:bg-black-dark dark:ring-gray dark:hover:bg-black transition"
          >
            <Share2 className="size-4 shrink-0" />
            Share
          </Button>
        </div>
      </div>
    </div>
    <div >
        <Tabs defaultValue="project-overview">
            <TabsList className="flex items-center justify-between overflow-x-auto rounded-b-lg border-t border-gray-300 bg-white shadow-sm dark:border-gray-700/50 dark:bg-white/6">
                <div className="inline-flex gap-[30px] px-5 text-sm/4 font-semibold sm:px-[30px]">
                    <div className="inline-flex gap-2.5 py-[11px] text-sm/[18px] font-semibold">
                        <TabsTrigger
                            value="project-overview"
                            className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                        >
                            Overview
                            <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-light-blue text-[10px]/[8px] px-1.5 py-1 font-semibold text-black">
                                { task.length }
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="project-task"
                            className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                        >
                            Task
                            <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-light-purple text-[10px]/[8px] px-1.5 py-1 font-semibold text-black">
                                { taskId.length }
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="project-timeline"
                            className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                        >
                            Timeline
                        </TabsTrigger>
                        <TabsTrigger
                            value="project-summary"
                            className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                            disabled
                        >
                            Summary
                            <Badge variant={'default'}>Pro</Badge>
                        </TabsTrigger>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2.5 ltr:pr-5 rtl:pl-5">
                    <div className="relative min-w-[204px]">
                        <Input 
                            type='text'
                            className="w-full rounded-lg py-2 pl-8 pr-2 text-xs/[10px] font-medium text-black shadow-sm outline-hidden ring-1 ring-gray-300 placeholder:font-medium placeholder:text-black focus:ring-black dark:bg-white/10 dark:text-white dark:ring-gray-300/10 dark:placeholder:text-white dark:focus:ring-white"
                            placeholder="Search Task"
                        />
                        <LucideSearch 
                            className='absolute left-3 top-2 h-4 w-4 shrink-0'
                        /> 
                    </div>
                    <Button 
                        type='button'
                        className="inline-flex items-center justify-center gap-1.5 text-xs/4 px-2.5 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white shadow-sm text-black hover:bg-gray-200 dark:text-white dark:bg-black-dark dark:ring-gray dark:hover:bg-black"
                    >
                        <LucideListFilter 
                            className="lucide lucide-list-filter size-4"
                        />
                        Filter
                    </Button>                     
                </div>
            </TabsList>
            <TabsContent
                value="project-overview"
                className="font-medium text-black"
            >
                <KanbanCard task={task} tabs={{id: idProject, tab: 'overview'}} aiRef={aiRef}/>
            </TabsContent>

            <TabsContent
                value="project-task"
                className="font-medium text-black"
            >
                <KanbanCard task={taskId} tabs={{id: idProject, tab: 'task'}} aiRef={aiRef}/>
            </TabsContent>

            <TabsContent
                value="project-timeline"
                className="space-y-4 font-medium text-black dark:text-white"
            >
                <ScheduleTimeline />
            </TabsContent>
            <TabsContent
                value="project-summary"
                className="font-medium text-black dark:text-white"
            >
            </TabsContent>
        </Tabs>
        <AIProjectGenerator ref={aiRef} />
    </div>
            </div>
        </div>
    )
}

export default Table
