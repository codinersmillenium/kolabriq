'use client'


import PageHeading from '@/components/layout/page-heading'
import { Button } from '@/components/ui/button'
import { Star, Settings, FilePlus2, Share2, LucideSearch, LucideListFilter, Coins, Copy, ClipboardList, ClipboardX } from 'lucide-react'
import { useEffect, useState, useRef, FormEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScheduleTimeline } from '@/components/custom/schedule-timeline'
import { KanbanCard } from '@/components/custom/kanban-card'
import { callWithRetry, getPrincipal, initActor } from '@/lib/canisters'
import { Badge } from '@/components/ui/badge'
import Chatbot, { ChatbotRef } from '@/components/ai/chatbot'
import DialogUi from '@/components/ui/dialog'
import { Principal } from '@dfinity/principal'
import { DataTable } from '@/components/custom/table/data-table'
import { historyColumns, IBlockHistory } from '@/components/custom/table/block-history-columns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { e8sToStr, nowStr, toE8s } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import * as decProjectEscrow from '@/declarations/project_escrow'

const Table = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [project, setProject] = useState<any>(null)
  const [projectTeam, setProjectTeam] = useState([])
  const [task, setTask] = useState<[]>([])
  const [taskId, setTaskId] = useState<any>([])
  const [idProject, setIdProject] = useState<any>(null)
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
  const [overview, setOverview] = useState<any>([])

  const [openDialCreateTask, setOpenDialCreateTask] = useState<boolean>(false);

  // MARK: Actors
  const [taskActor, setTaskActor] = useState<any>(null);
  const [projectActor, setProjectActor] = useState<any>(null)
  const [userActor, setUserActor] = useState<any>(null)

  const initActors = async (): Promise<{ tActor: any; pActor: any, uActor: any }> => {
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

  // MARK: Init data project, task
  const getProject = async (id: any, pActor: any) => {
    const project = await callWithRetry(pActor, "getProjectDetail", parseFloat(id))
    if (typeof project.ok == 'undefined') return alert("project not found");

    const teams = await callWithRetry(pActor, "getProjectTeam", parseFloat(id))
    if (typeof teams.ok == 'undefined') return alert("project not found");

    setIdProject(id)
    setProject(project.ok)
    setProjectTeam(teams.ok)
    setRemainingReward(Number(e8sToStr(project.ok.reward)))
  }

  const getTask = async (id: any, tActor: any) => {
    let param = {
      keyword: [],
      status: [],
      tag: [],
    };

    const { ok } = await callWithRetry(tActor, "getTaskList", parseFloat(id), [param])
    if (typeof ok == 'undefined') return;

    setTask(ok)
  }

  // MARK: Project teams

  const [projectTeams, setProjectTeams] = useState([])

  const getProjectTeams = async (id: any, actors: any) => {
    const teamsPrincipal = await callWithRetry(actors.pActor, "getProjectTeam", parseFloat(id))
    if (typeof teamsPrincipal.ok == 'undefined') return;

    const teams = await callWithRetry(actors.uActor, "getUsersByIds", teamsPrincipal.ok)
    if (typeof teams.ok == 'undefined') return;

    setProjectTeams(teams.ok)
  }

  useEffect(() => {
    const init = async () => {
      const id: any = localStorage.getItem('project_id');
      const actors = await initActors();

      setIdProject(id);
      getProjectTeams(id, actors)

      getProject(id, actors.pActor);
      getTask(id, actors.tActor);
      getProjectHistory(id, actors.pActor);
    };

    init();
  }, []);

  // MARK: Project status

  // TODO: 
  const [disablePushStatus, setDisablePushStatus] = useState(true)

  const handlePushProject = async (status: string) => {
    const projectId = parseFloat(idProject)
    switch (status) {
      case "new":
        const resProject = await callWithRetry(projectActor, "updateProjectStatus", projectId, { ["in_progress"]: null })
        if (!resProject) return alert("Failed push project");

        getProject(projectId, projectActor)
        getProjectHistory(projectId, projectActor);
        isDisabledBtnProject()
        return alert("Success push project")

      case "in_progress":
        if (!project.reward) {
          const resProject = await callWithRetry(projectActor, "updateProjectStatus", projectId, { ["done"]: null })
          if (!resProject) return alert("Failed push project");

          getProject(projectId, projectActor)
          getProjectHistory(projectId, projectActor);
          return alert("Success push project")
        }

        if (overview.length == 0) {
          const resTask = await callWithRetry(taskActor, "getUserOverview", projectId)
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
    return task.some((t: any) => Object.keys(t.status)[0] !== "done") && Object.keys(project.status)[0] !== "new";
  };

  const labelBtnProject = () => {
    const label: Record<"new" | "in_progress" | "done", string> = {
      new: "Project In Progress",
      in_progress: "Payout",
      done: "Complete",
    };

    if (!project) return label["new"];

    const key = Object.keys(project.status)[0] as keyof typeof label;
    return label[key] ?? label["new"];
  };

  // MARK: Payout

  const [formPayout, setFormPayout] = useState<{ [key: string]: number }>({});
  const [remainingReward, setRemainingReward] = useState(0)

  const handleChangePayout = (userId: string, value: string) => {
    const newValue = Number(value);

    // Hitung total payout termasuk input baru
    const totalPayout = Object.entries(formPayout).reduce(
      (acc, [id, amt]: any) => acc + amt,
      0
    ) - (formPayout[userId] || 0) + newValue;
    // First subtract the old userId value so that it can be updated without double counting.

    const projectReward = Number(e8sToStr(project.reward))

    if (totalPayout > projectReward) {
      return alert("Total payout exceeds remaining project reward");
    }

    setFormPayout((prev) => ({
      ...prev,
      [userId]: newValue
    }));

    setRemainingReward(projectReward - totalPayout);
  };

  const handlePayout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let totalAmount = 0;
      const payoutList = Object.entries(formPayout).map(([userId, amount]: any) => {
        const e8sAmount = toE8s(amount)
        totalAmount += e8sAmount;
        return {
          recipient: Principal.fromText(userId),
          amount: e8sAmount,
        };
      });

      if (totalAmount > Number(project.reward)) {
        return alert("Total tokens exceed the project reward")
      }

      // Process allowace to escrow
      const actorLedger = await initActor('icp_ledger')
      await callWithRetry(actorLedger, "icrc2_approve", {
        from_subaccount: [],
        spender: {
          owner: Principal.fromText(decProjectEscrow.canisterId),
          subaccount: [],
        },
        amount: totalAmount,
        expected_allowance: [],
        expires_at: [],
        fee: [],
        memo: [],
        created_at_time: [],
      })

      // Process payout
      const actorEscrow = await initActor('project_escrow')
      await callWithRetry(actorEscrow, "executeTeamPayout", parseFloat(idProject), payoutList, getPrincipal())

      // update project to done
      await callWithRetry(projectActor, "updateProjectStatus", parseFloat(idProject), { ["done"]: null })

      getProject(idProject, projectActor);
      getProjectHistory(idProject, projectActor);
    } catch (error) {
      console.error(error)
      alert('Failed to payout');
    }
  }

  const aiRef = useRef<ChatbotRef>(null);

  // MARK: Add task

  const openDialogCT = () => {
    setOpenDialCreateTask(true);
  }

  const [dueDate, setDueDate] = useState<Date>()
  const [taskFormData, setTaskFormData]: any = useState({
    title: '',
    taskTag: [],
    desc: '',
    assignees_: ''
  })

  const handleFormTaskChange = (e: any) => {
    const { name, value } = e.target
    setTaskFormData({
      ...taskFormData,
      [name]: value
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const id: any = localStorage.getItem('project_id');
      taskFormData.projectId = parseFloat(id)

      const tag: any = document.querySelectorAll('[name="tags"]')
      taskFormData.taskTag = {}
      for (let i = 0; i < tag.length; i++) {
        if (tag[i].checked) {
          taskFormData.tag = { [tag[i].value]: null }
          break
        }
      }

      taskFormData.dueDate = Math.floor(dueDate!.getTime() / 1000)
      taskFormData.assignees = [Principal.fromText(taskFormData.assignees_)]

      await callWithRetry(taskActor, "createTask", taskFormData)

      alert('Success Create Task')
      getTask(idProject, taskActor)
    } catch (error) {
      console.error(error)
      alert('Failed Create Task');
    }
  }

  const DialogCreateTask = () => (
    <DialogUi open={openDialCreateTask} onOpenChange={setOpenDialCreateTask} title="Add Task" content={
      <div>
        <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />
        <div className='pt-4'>
          <form className="px-[3px]" onSubmit={handleSubmit}>
            <div className='space-y-5 max-h-[450px] overflow-y-scroll ps-[2px] pr-[10px]'>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Implement login page"
                  name='title'
                  onChange={handleFormTaskChange}
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
                  onChange={handleFormTaskChange}
                  required
                />
              </div>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Assigne
                </label>
                <Select
                  onValueChange={(e) => {
                    setTaskFormData({
                      ...taskFormData,
                      ["assignees_"]: e
                    })
                  }}
                >
                  <SelectTrigger className="py-2 text-black shadow-sm ring-1 ring-gray-300" title='Task Assigne'>
                    <SelectValue placeholder="Task Assigne" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="space-y-1.5">
                      {projectTeams.map((team: any, i: any) => {
                        const roleColor: Record<string, "red" | "purple" | "grey"> = {
                          admin: "red",
                          developer: "purple",
                          maintainer: "grey",
                        }

                        const roleName = Object.keys(team.role || {})[0] || ""

                        return (
                          <SelectItem
                            key={i}
                            value={team.id}
                            textValue={`${team.firstName} ${team.lastName}`}
                          >
                            <Badge variant={roleColor[roleName] || "secondary"}>
                              {roleName.toUpperCase()}
                            </Badge>
                            <span className='ms-1'>{`${team.firstName} ${team.lastName}`}</span>
                          </SelectItem>
                        )
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Task Deadline
                </label>
                <Popover>
                  <PopoverTrigger className='w-full'>
                    <div className='text-sm/[8px] relative w-full shadow-3xl placeholder:text-gray placeholder:font-medium text-black font-medium px-3.5 py-4 rounded-lg disabled:pointer-events-none disabled:opacity-30 focus:ring-1 outline-hidden focus:ring-black text-start'>
                      {dueDate ? (
                        format(dueDate, 'MMM dd, yyyy')
                      ) : (
                        <span>
                          {nowStr()}
                        </span>
                      )}{' '}
                    </div>
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
              <div className="space-y-2.5">
                <label className="block font-semibold leading-tight text-black">
                  Tag
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tags" value="frontend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleFormTaskChange} />
                    <span className="text-sm text-gray-700">Frontend Developer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tags" value="backend" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleFormTaskChange} />
                    <span className="text-sm text-gray-700">Backend Developer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tags" value="ui" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleFormTaskChange} />
                    <span className="text-sm text-gray-700">UI/UX Design</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tags" value="bussines_analist" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleFormTaskChange} />
                    <span className="text-sm text-gray-700">Bussiness Analyst</span>
                  </label>
                </div>
              </div>
            </div>
            <span className="h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50 mb-4 mt-4" />
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
    const { ok } = await callWithRetry(pActor, "getProjectHistory", parseFloat(id))
    if (typeof ok == 'undefined') return;

    setProjectHistory(ok)
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
            {project && projectTeam ? (
              <div className="inline-flex items-center -space-x-2">
                {projectTeam.slice(0, 4).map((team: any, i: any) => (
                  <Image
                    key={i}
                    src={`/images/kanban-avatar${i + 1}.svg`}
                    alt="avatar"
                    width={30}
                    height={30}
                    className={`size-[30px] rounded-full ${i < 2 ? "hidden xl:block" : ""}`}
                  />
                ))}

                {projectTeam.length > 4 && (
                  <Button
                    type="button"
                    className="grid h-[30px] min-w-[30px] shrink-0 place-content-center rounded-full border-2 border-white bg-gray-300 px-1 text-[11px]/none font-bold text-black shadow-sm"
                  >
                    +{projectTeam.length - 4}
                  </Button>
                )}
              </div>
            ) : null}

            {/* Divider */}
            <span className="hidden h-6 w-px rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
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
          <Tabs defaultValue="project-task">
            <TabsList className="flex items-center justify-between overflow-x-auto rounded-b-lg border-t border-gray-300 bg-white shadow-sm dark:border-gray-700/50 dark:bg-white/6">
              <div className="inline-flex gap-[30px] px-5 text-sm/4 font-semibold sm:px-[30px]">
                <div className="inline-flex gap-2.5 py-[11px] text-sm/[18px] font-semibold">
                  <TabsTrigger
                    value="project-task"
                    className="group flex items-center gap-1.5 whitespace-nowrap p-2.5 font-medium transition-all hover:bg-light-theme hover:text-black focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-light-theme data-[state=active]:text-black dark:hover:bg-black dark:hover:text-white dark:data-[state=active]:bg-black dark:data-[state=active]:text-white [&>svg]:size-[18px] [&>svg]:shrink-0 [&[data-state=active]>svg]:text-primary rounded-none border-b-2 border-transparent bg-transparent! px-0 py-4 data-[state=active]:border-primary"
                  >
                    Task
                    <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-light-blue text-[10px]/[8px] px-1.5 py-1 font-semibold text-black">
                      {task.length}
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
                    <div className="inline-flex items-center gap-1.5 rounded-lg shrink-0 bg-primary text-[10px]/[8px] text-white px-1.5 py-1 font-semibold text-black">
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
              value="project-task"
              className="font-medium text-black"
            >
              <KanbanCard task={task} tabs={{ id: idProject, tab: 'task' }} aiRef={aiRef} />
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
        {/* MARK: Payout */}
        <DialogUi open={isDialogOpen} onOpenChange={setDialogOpen} title='Payout Team' content={
          <div>
            <div className='flex items-center gap-1.5'>
              <Coins size={18} />
              <span className='text-xs font-bold'>{remainingReward}</span>
            </div>
            <span className="hidden h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50 my-3" />
            <form className="space-y-5" onSubmit={handlePayout}>
              {overview.map((o: any, i: any) => {
                return (
                  <div className="space-y-1" key={i}>
                    <div className='font-bold flex justify-between gap-2'>
                      <div className='flex gap-2'>
                        <div>{`User #${i + 1}:`}</div>
                        <div className='flex flex-1 items-center text-xs gap-1'>
                          <Copy size={16} />
                          <span className='w-50 overflow-hidden whitespace-nowrap overflow-ellipsis'>{o.userId.toString()}</span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <div className='flex flex-1 items-center text-xs gap-1'>
                          <ClipboardList size={16} />
                          {Number(o.totalDone)}
                        </div>
                        <div className='flex flex-1 items-center text-xs gap-1'>
                          <ClipboardX size={16} />
                          {Number(o.totalOverdue)}
                        </div>
                      </div>
                      {/* <div className='text-xs'>
                        <Copy />
                        u73il-qowyh-xzxns-n53oq-epmgv</div> */}
                      {/* <div className='text-xs'>{o.userId.toString()}</div> */}
                    </div>
                    <div className="space-y-2.5 mt-2.5">
                      <div className="relative w-full">
                        <Input
                          autoFocus
                          type="text"
                          inputMode="decimal"
                          placeholder="Total"
                          name="reward"
                          className="w-full pr-12"
                          onChange={(e) => handleChangePayout(o.userId.toString(), e.target.value)}
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-black text-sm">
                          ICP
                        </span>
                      </div>
                    </div>
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
          </div>
        } />
      </div>
    </div>
  )
}

export default Table
