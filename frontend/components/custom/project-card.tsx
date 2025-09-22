'use client'
import { callWithRetry, initActor } from '@/lib/canisters';
import { Clipboard, ClipboardList, Coins, History, LucideDollarSign, LucideEllipsisVertical, LucideIdCard, LucideUsers, SquarePen, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Principal } from '@dfinity/principal';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import { ProjectTypeClass, ProjectTypeLabel, StatusColor, StatusLabel } from '@/constants/status';
import { ProjectType, StatusType } from '@/types/project';
import { e8sToStr } from '@/lib/utils';
import DialogUi from '../ui/dialog';

export default function ProjectCard({ filter, page, dialogProjectOpen, dialogTitle }: any) {
  const route = useRouter()
  const [item, setItem] = useState([])
  const [assign, setAssign] = useState({
    name: '',
    status: false
  })

  // MARK: Actors
  const [projectActor, setProjectActor] = useState<any>(null)
  const [userActor, setUserActor] = useState<any>(null)

  const initActors = async (): Promise<{ pActor: any, uActor: any }> => {
    const pActor = await initActor("project");
    const uActor = await initActor("user");

    setProjectActor(pActor);
    setUserActor(uActor);

    return {
      pActor,
      uActor,
    };
  };

  const getProject = async (userActor: any, projectActor: any) => {
    var param = {
      status: filter.status ? [{ [filter.status]: null }] : [],
      projectType: filter.type ? [{ [filter.type]: null }] : [],
      tags: [],
      keyword: [],
    }

    const refCode: any = await callWithRetry(userActor, "getTeamRefCode")
    const projects: any = await callWithRetry(projectActor, "getOwnedProjectList", refCode.ok, param)

    const list = projects.ok
    if (page.role === 'admin') {
      for (let obj in list) {
        const uint8Array = new Uint8Array(list[obj].thumbnail);
        const blob = new Blob([uint8Array], { type: detectMimeType(uint8Array) });
        list[obj].thumbnailUrl = URL.createObjectURL(blob)

        for (let i in list[obj].teams) {
          const index = list[obj].teams[i]
          const role: string = Object.keys(index.role).toString()
          if (role === 'maintainer') {
            setAssign({
              name: index.firstName + ' ' + index.lastName,
              status: true
            })
            break
          }
        }
      }
    }
    setItem(list)
  }

  const detectMimeType = (uint8Array: Uint8Array): string => {
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) return "image/png";
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) return "image/jpeg";
    if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[8] === 0x57 && uint8Array[9] === 0x45)
      return "image/webp";
    return "application/octet-stream";
  }

  const handleLinkShow = (id: string) => {
    localStorage.setItem('project_id', id)
    setTimeout(() => {
      route.push("/task-detail")
    }, 100)
  }

  // MARK: Projeck manager
  const [isOpenDialogPM, setOpenDialogPM] = useState(false)

  const assignPM = async (id: string) => {
    const { value }: any = document.querySelector('#user_id')
    const principal = [Principal.fromText(value)]

    await callWithRetry(projectActor, "assignProjectTeam", id, principal)

    alert('Success Assign User')
    getProject(userActor, projectActor)
  }

  const DialogPM = (id: string): any => {
    !assign.status ?
      <div>
        <label className="font-semibold leading-tight inline-block">
          Name
        </label>
        <form>
          <fieldset className="border border-gray-300 p-4 rounded-md mb-2">
            <legend className="text-sm font-medium text-gray-700 mb-2">User ID</legend>
            <div className="space-y-2">
              <Input
                id='user_id'
                placeholder='Assign user to PM or maintainer by project'
                required
              />
            </div>
          </fieldset>
          <div className='flex justify-end'>
            <Button
              type='button'
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition text-white"
              title='Assign user to PM or maintainer by project'
              onClick={() => assignPM(id)}
            >
              Assign
            </Button>
          </div>
        </form>
      </div>
      :
      <div>
        {assign.name}
      </div>
  }

  useEffect(() => {
    const init = async () => {
      const actors = await initActors();
      getProject(actors.uActor, actors.pActor);
    };

    init();
  }, [filter, page.role])

  return (
    <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-4">
      {item.map((i: any, j) => {
        const statusKey = Object.keys(i.status)[0] as StatusType;
        const projectTypeKey = Object.keys(i.projectType)[0] as ProjectType;

        return (
          <div className="rounded-[1vw] bg-[#232324] shadow-3xl dark:shadow-sm" key={j}>
            <div className="space-y-4 p-3">
              <Link
                href="/task-detail"
                className={`relative w-full h-[200px] mt-0 block rounded-xl overflow-hidden p-1.5 ring-2 dark:bg-black-dark dark:ring-gray-300/10
                  ${!i.thumbnailUrl ? "bg-gray-200 ring-gray-300" : "ring-gray-300"}`}
                onClick={() => handleLinkShow(i.id)}
              >
                {i.thumbnailUrl ? (
                  <Image
                    alt="blog-img"
                    fill
                    src={i.thumbnailUrl}
                    className="mx-auto"
                    style={{ objectFit: "cover" }}
                  />
                ) : null}
              </Link>


              <div className='flex justify-between'>
                <div className='flex gap-2'>
                  <Badge variant={StatusColor[statusKey] ?? "default"}>
                    {StatusLabel[statusKey]}
                  </Badge>

                  <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black ${ProjectTypeClass[projectTypeKey]}`}>
                    {ProjectTypeLabel[projectTypeKey]}
                  </div>
                </div>
                <div className='flex items-center gap-1.5'>
                  <button onClick={() => setOpenDialogPM(true)}><LucideIdCard size={23} color="#ffffff" /></button>
                  <button onClick={() => {
                    dialogTitle("Edit Project: " + i.name)
                    dialogProjectOpen(true)
                  }}><SquarePen size={18} color="#ffffff" /></button>
                </div>

              </div>

              <div className='flex items-center gap-1.5'>
                <Coins size={18} color="#ffffff" />
                <span className='text-white text-xs'>{i.reward ? e8sToStr(i.reward) : 0}</span>
              </div>

              <div className="space-y-1.5">
                <Link
                  href="/task-detail"
                  className="text-sm/tight font-semibold text-white duration-300 hover:underline inline-flex"
                  onClick={() => handleLinkShow(i.id)}
                >
                  {i.name}
                </Link>
                <p className="line-clamp-3 text-xs/normal font-medium text-white">
                  {i.desc}
                </p>
              </div>

              <span className="hidden h-px w-full rounded-full bg-gray-300 sm:block dark:bg-gray-300/50" />

              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <p className="flex items-center font-semibold text-white gap-1">
                    <LucideUsers size={18} />
                    <span>0</span>
                  </p>
                  <p className="flex items-center font-semibold text-white gap-1">
                    <ClipboardList size={18} />
                    <span>0</span>
                  </p>
                </div>
                <History size={18} color="#ffffff" />
              </div>

              {/* 
                MARK: Dialog assign PM
              */}
              <DialogUi open={isOpenDialogPM} onOpenChange={setOpenDialogPM} title="Project Manager" content={DialogPM(i.id)} />
            </div>
          </div>
        )
      })}
    </div>
  );
}