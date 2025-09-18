'use client'


import PageHeading from '@/components/layout/page-heading'
import { Button } from '@/components/ui/button'
import { Star, Settings, FilePlus2, Share2, LucideSearch, LucideListFilter } from 'lucide-react'
import { useEffect, useState, useRef, FormEvent, Dispatch, SetStateAction } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScheduleTimeline } from '@/components/custom/schedule-timeline'
import { KanbanCard } from '@/components/custom/kanban-card'
import { getPrincipal, initActor } from '@/lib/canisters'
import { Badge } from '@/components/ui/badge'
import Chatbot, { ChatbotRef, AnalysisButton } from '@/components/ai/chatbot'
import DialogUi from '@/components/ui/dialog'
import { Principal } from '@dfinity/principal'
import { DataTable } from '@/components/custom/table/data-table'
import {
  dashboardcolumns,
  ITable,
} from '@/components/custom/table/dashboard-columns'
import { ProjectBlock } from '@/types/task'
import { historyColumns, IBlockHistory } from '@/components/custom/table/block-history-columns'

const Table = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [project, setProject] = useState<any>(null)
  const [task, setTask] = useState<[]>([])
  const [taskId, setTaskId] = useState<any>([])
  const [idProject, setIdProject] = useState<any>(null)
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
  const [overview, setOverview] = useState<any>([])
  const [formPayout, setFormPayout] = useState({});

  const [openDialCreateTask, setOpenDialCreateTask] = useState<boolean>(false);

  // MARK: Actors
  const [taskActor, setTaskActor] = useState<any>(null);
  const [projectActor, setProjectActor] = useState<any>(null)

  const initActors = async (): Promise<{ tActor: any; pActor: any }> => {
    const tActor = await initActor("task");
    const pActor = await initActor("project");

    setTaskActor(tActor);
    setProjectActor(pActor);

    return { tActor, pActor };
  };


  const getProject = async (id: any, pActor: any) => {
    setIdProject(id)

    const { ok } = await pActor.getProjectDetail(parseFloat(id))
    if (typeof ok !== 'undefined') {
      setProject(ok)
      return
    }

    alert("project not found")
  }

  const getTask = async (id: any, tActor: any) => {
    let param = {
      keyword: [],
      status: [],
      tag: [],
    };

    const { ok } = await tActor.getTaskList(parseFloat(id), [param])
    if (typeof ok !== 'undefined') {
      setTask(ok)
    }
  }

  const getTaskByid = async (id: any) => {
    // const actor_ = await initActor('task')
    // const { ok } = await actor_.getUserProjectTasks(getPrincipal()[1], parseFloat(id))
    // if (typeof ok !== 'undefined') {
    //   setTaskId([ok])
    // }
    setTaskId([])
  }

  useEffect(() => {
    const init = async () => {
      const { tActor, pActor } = await initActors();

      const id: any = localStorage.getItem('project_id');
      setIdProject(id);

      getProject(id, pActor);
      getTask(id, tActor);
      getTaskByid(id);
      getProjectHistory(id, pActor);

      // aiRef.current?.triggerDailyStandUp(id);
    };

    init();
  }, []);

  const handleTriggerAnalysis = (idProject: any) => {
    idProject
      ? aiRef.current?.triggerContext(idProject)
      : console.warn("id project not found");
  };

  const handlePushProject = async (status: string) => {
    switch (status) {
      case "new":
      case "in_progress":
        const reqStatus = {
          "new": "in_progress",
          "in_progress": "review",
        };

        const actorProject_ = await initActor('project')
        const resProject = await actorProject_.updateStatus(parseFloat(idProject), { [reqStatus[status]]: null })
        if (resProject) {
          getProject(parseFloat(idProject), projectActor)
          return alert("success push project")
        }

        return alert("failed push project");

      case "review":
        if (overview.length == 0) {
          const actorTask_ = await initActor('task')
          const resTask = await actorTask_.getUserOverview(parseFloat(idProject))
          if (!resTask) return alert(resTask.err)

          setOverview(resTask.ok)
        }

        return setDialogOpen(true)
      default:
        return;
    }
  }

  const isDisabledBtnProject = () => {
    if (task.length == 0) return false;
    return task.some((t: any) => Object.keys(t.status)[0] !== "done");
  };

  const labelBtnProject = () => {
    const label: Record<"new" | "in_progress" | "review" | "done", string> = {
      new: "Project In Progress",
      in_progress: "Set to Review",
      review: "Payout",
      done: "Complete",
    };

    if (!project) return label["new"];

    const key = Object.keys(project.status)[0] as keyof typeof label;
    return label[key] ?? label["new"];
  };

  const handleChangePayout = (userId: string, value: string) => {
    setFormPayout((prev) => ({
      ...prev,
      [userId]: Number(value)
    }));
  };

  const handlePayout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let totalToken = 0;
      const payoutList = Object.entries(formPayout).map((p: any) => {
        totalToken += p[1]

        return {
          userId: Principal.fromText(p[0]),
          token: parseFloat(p[1])
        }
      });

      if (totalToken > Number(project.reward)) {
        return alert("Total token melebihi reward projek")
      }

      const actor = await initActor('token')
      await actor.teamPayout(payoutList)

      // update project to done
      const actorProject_ = await initActor('project')
      await actorProject_.updateStatus(parseFloat(idProject), { ["done"]: null })
    } catch (error) {
      console.error(error)
      alert('Failed Register User...');
    }
  }

  const aiRef = useRef<ChatbotRef>(null);

  // MARK: Add task

  const openDialogCT = () => {
    setOpenDialCreateTask(true);
  }

  const handleSubmit = async (e: any) => {
    console.log(e);
  }

  // TODO: LAST HERE

  const DialogCreateTask = () => (
    <DialogUi open={openDialCreateTask} onOpenChange={setOpenDialCreateTask} title="Add Task" content={
      <div>
        <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />
        <div className='pt-4'>
          <form className="px-[3px]" onSubmit={handleSubmit}>
            <div className='space-y-5 max-h-[350px] overflow-y-scroll ps-[2px] pr-[10px]'>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Implement login page"
                  name='title'
                  // onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Desc
                </label>
                <Textarea
                  placeholder="Describe the task in detail, including requirements or notes..."
                  name='desc'
                  // onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Deadline
                </label>
                <Popover>
                  <PopoverTrigger>
                    {dueDate ? (
                      format(dueDate, 'PP')
                    ) : (
                      <span>
                        {nowStr()}
                      </span>
                    )}{' '}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto! p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                    />
                  </PopoverContent>
                </Popover>
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
            </div>
            <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50 mb-4" />
            <Button
              type="submit"
              variant={'black'}
              size={'large'}
              className="w-full"
            >
              Add Task
            </Button>
          </form>
        </div>
      </div>
    } />
  )


  // MARK: Project history

  const [projectHistory, setProjectHistory] = useState<IBlockHistory[]>([]);

  const getProjectHistory = async (id: any, pActor: any) => {
    const { ok } = await pActor.getProjectHistory(parseFloat(id))
    if (typeof ok !== 'undefined') {
      setProjectHistory(ok)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeading heading={'Workspace'} />
      <div className="min-h-[calc(100vh-160px)] w-full">
        <div className="dark:bg-black-dark rounded-lg bg-white dark:shadow-sm flex flex-col justify-between gap-4 rounded-b-none px-5 py-3.5 shadow-sm md:flex-row md:items-center">
          {/* Left Side: Title & Status */}
          <div className="flex shrink-0 grow flex-col items-start gap-1.5">
            <div className="inline-flex items-center gap-2.5">
              <h2 className="text-lg/tight font-semibold text-black dark:text-white">
                {project?.name}
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
            {project ? (
              <Badge
                variant={
                  ({
                    new: "danger",
                    in_progress: "orange",
                    review: "blue",
                    done: "green"
                  } as const)[
                  Object.keys(project.status)[0] as "new" | "in_progress" | "review" | "done"
                  ] ?? "default"
                }
              >
                {{
                  new: "New",
                  in_progress: "In Progress",
                  review: "Review",
                  done: "Done"
                }[Object.keys(project.status)[0]]}
              </Badge>
            ) : null}
          </div>

          {/* Right Side: Avatars & Actions */}
          <div className="inline-flex flex-wrap items-center gap-2.5 md:justify-end">
            {/* Avatars */}
            {project && project.teams ? (
              <div className="inline-flex items-center -space-x-2">
                {project.teams.slice(0, 4).map((team: any, i: any) => (
                  <Image
                    key={team.userName}
                    src={`/images/kanban-avatar${i + 1}.svg`}
                    alt="avatar"
                    width={30}
                    height={30}
                    className={`size-[30px] rounded-full ${i < 2 ? "hidden xl:block" : ""}`}
                    title={team.userName}
                  />
                ))}

                {project.teams.length > 4 && (
                  <Button
                    type="button"
                    className="grid h-[30px] min-w-[30px] shrink-0 place-content-center rounded-full border-2 border-white bg-gray-300 px-1 text-[11px]/none font-bold text-black shadow-sm"
                  >
                    +{project.teams.length - 4}
                  </Button>
                )}
              </div>
            ) : null}

            {/* Divider */}
            <span className="hidden h-6 w-px rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <AnalysisButton onTrigger={() => handleTriggerAnalysis(idProject)} />
              <Button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 text-xs/4 font-medium px-2.5 py-2 rounded-lg bg-black text-white hover:bg-[#3C3C3D] dark:bg-white dark:text-black dark:hover:text-white dark:hover:bg-black transition"
                onClick={() => {
                  const status = project
                    ? Object.keys(project.status)[0]
                    : ""

                  return handlePushProject(status)
                }}
                disabled={isDisabledBtnProject()}
              >
                <FilePlus2 className="size-4 shrink-0" />
                {
                  project == null
                    ? "Load Project"
                    : labelBtnProject()
                }
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
                      {task.length}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="project-task"
                    className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                  >
                    Task
                    <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-light-purple text-[10px]/[8px] px-1.5 py-1 font-semibold text-black">
                      {taskId.length}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="project-timeline"
                    className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="project-history"
                    className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                  >
                    Project History
                    <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-primary text-white text-[10px]/[8px] px-1.5 py-1 font-semibold text-black">
                      {projectHistory.length}
                    </div>
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
                <span className="h-6 w-px rounded-full bg-gray-300 dark:bg-gray-300/50" />
                <Button
                  type='button'
                  className="inline-flex items-center justify-center gap-1.5 text-xs/4 px-2.5 py-2 rounded-lg ring-1 ring-inset ring-gray-300 bg-white shadow-sm text-black hover:bg-gray-200 dark:text-white dark:bg-black-dark dark:ring-gray dark:hover:bg-black"
                  onClick={() => openDialogCT()}
                >
                  <FilePlus2 className="size-4 shrink-0" />
                  Add Task
                </Button>
              </div>
            </TabsList>
            <TabsContent
              value="project-overview"
              className="font-medium text-black"
            >
              <KanbanCard task={task} tabs={{ id: idProject, tab: 'overview' }} aiRef={aiRef} />
            </TabsContent>

            <TabsContent
              value="project-task"
              className="font-medium text-black"
            >
              <KanbanCard task={taskId} tabs={{ id: idProject, tab: 'task' }} aiRef={aiRef} />
            </TabsContent>

            <TabsContent
              value="project-timeline"
              className="space-y-4 font-medium text-black dark:text-white"
            >
              <ScheduleTimeline />
            </TabsContent>
            <TabsContent
              value="project-history"
              className="font-medium text-black dark:text-white mt-5"
            >
              <Card className="grow overflow-x-auto shadow-sm">
                <CardContent>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div id="search-table" hidden></div>
                  </div>
                  <DataTable
                    columns={historyColumns}
                    data={projectHistory}
                    filterField={'id'}
                    isRemovePagination={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Chatbot ref={aiRef} />
        </div>
        {DialogCreateTask()}
        <DialogUi open={isDialogOpen} onOpenChange={setDialogOpen} title=''
          content={
            <Card>
              <CardHeader className="space-y-1.5 rounded-t-lg border-b border-gray-300 bg-gray-100 px-5 py-4 text-base/5 font-semibold text-black">
                <h3>Payout Team</h3>
                <p className="text-sm/tight font-medium text-gray-700">
                  Project Reward: {project ? project.reward : 0}
                </p>
              </CardHeader>
              <CardContent className='max-h-[60vh] overflow-auto'>
                <form className="space-y-5 p-3" onSubmit={handlePayout}>
                  {overview.map((o: any, i: any) => {
                    return (
                      <div className="space-y-2.5">
                        <div className='font-bold'>
                          <div>{`User #${i + 1}:`}</div>
                          <div className='text-xs'>{o.userId.toString()}</div>
                        </div>
                        <fieldset className="border border-gray-300 p-4 rounded-md">
                          <legend className="text-sm font-medium text-gray-700 mb-2">
                            {`Payout #${i + 1}`}
                          </legend>
                          <div className="space-y-2">
                            <div className='grid grid-cols-3'>
                              <div className="text-sm text-gray-700">
                                <h5 className='font-bold'>Total Task: </h5>
                                <p>{o.totalTask}</p>
                              </div>
                              <div className="text-sm text-gray-700">
                                <h5 className='font-bold'>Total Done: </h5>
                                <p>{o.totalDone}</p>
                              </div>
                              <div className="text-sm text-gray-700">
                                <h5 className='font-bold'>Total Overdue: </h5>
                                <p>{o.totalOverdue}</p>
                              </div>
                            </div>
                          </div>
                          <hr className='mt-2.5' />
                          <div className="space-y-2.5 mt-2.5">
                            <label className="block font-semibold leading-tight text-black">
                              Pay
                            </label>
                            <Input
                              type="number"
                              onChange={(e) => handleChangePayout(o.userId.toString(), e.target.value)}
                              required
                            />
                          </div>
                        </fieldset>
                      </div>
                    )
                  })}
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
      </div>
    </div>
  )
}

export default Table
