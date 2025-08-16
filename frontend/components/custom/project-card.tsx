'use client'
import { initActor } from '@/lib/canisters';
import { LucideDollarSign, LucideEllipsisVertical, LucideIdCard, LucideUsers, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HTMLAttributes, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import { Principal } from '@dfinity/principal';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

export default function ProjectCard({ filter, page } : any) {
  const route = useRouter()
  const [item, setItem]=  useState([])
  const [assign, setAssign] = useState({
    name: '',
    status: false
  })

  const getProject = async () => {
      const actor_ = await initActor('project')
      var param = {
        status: {[filter.status]: null},
        projectType: {[filter.type]: null},
        tags: [],
        keyword: ''
      }
      const { ok }: any = await actor_.getOwnedProjectList(param)
      if (page.role === 'admin') {
        for (let obj in ok) {
          const uint8Array = new Uint8Array(ok[obj].thumbnail);
          const blob = new Blob([uint8Array], { type: detectMimeType(uint8Array) });
          ok[obj].thumbnailUrl = URL.createObjectURL(blob)
          
          for (let i in ok[obj].teams) {
            const index = ok[obj].teams[i]
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
      setItem(ok)
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

  const assignPM = async (id: string) => {
    const actor_ = await initActor('project')
    const { value }: any = document.querySelector('#user_id')
    const principal = [Principal.fromText(value)]
    await actor_.assignProjectTeam(id, principal)
    alert('Success Assign User')
    setTimeout(() => {
        window.location.href = '/' + page.path
    }, 100)
  }

  useEffect(() => {
      getProject()
  }, [filter, page.role])

  return (
    <div className="mx-auto grid w-full md:max-w-[938px] lg:max-w-[95%] gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-4">
      {item.map((i: any, j) => (
        <div className="rounded-[1vw] bg-black shadow-3xl dark:shadow-sm" key={j}>
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


            <div className='flex gap-2'>
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black ${
                  {
                    free: "bg-gray text-white",
                    rewarded: "bg-success-light",
                  }[Object.keys(i.projectType)[0]]
                }`}
              >
                {{
                  free: "Free",
                  rewarded: "Rewarded",
                }[Object.keys(i.projectType)[0]]}
              </div>
              <div>
                <Badge
                  variant={
                    ({
                      new: "danger",
                      in_progress: "orange",
                      review: "blue",
                      done: "green"
                    } as const)[
                      Object.keys(i.status)[0] as "new" | "in_progress" | "review" | "done"
                    ] ?? "default"
                  }
                >
                  {{
                    new: "New",
                    in_progress: "In Progress",
                    review: "Review",
                    done: "Done"
                  }[Object.keys(i.status)[0]]}
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5">
              <Link
                href="/task-detail"
                className="text-sm/tight font-semibold text-white duration-300 hover:underline inline-flex"
                onClick={() => handleLinkShow(i.id)}
              >
                { i.name }
              </Link>
              <p className="line-clamp-2 text-xs/normal font-medium text-white">
                { i.desc }
              </p>
            </div>

            <div className="flex items-center gap-3 justify-between">
              <div className='flex items-center gap-4'>
                <Button
                  variant={'ghost'}
                  className="!p-0 inline-flex items-center gap-1.5 text-xs/tight font-semibold transition text-white"
                >
                  <LucideDollarSign className="shrink-0" />
                  { i.reward }
                </Button>

                <Button
                  variant={'ghost'}
                  className="!p-0 inline-flex items-center gap-1.5 text-xs/tight font-semibold transition text-white"
                >
                  <LucideUsers className="shrink-0" />
                  { i.teams.length }
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {page.role !== 'developer' &&
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button 
                            variant={'ghost'}
                            className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition text-white p-0 "
                            title='Assign project manager or maintainer'
                          >
                            <LucideIdCard strokeWidth={1} size={40} className="!w-6 !h-6 shrink-0"/>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto! p-3" data-side="top">
                        {!assign.status ?
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
                                onClick={() => assignPM(i.id)}
                              >
                                Assign
                              </Button>
                            </div>
                          </form>
                        : 
                        <div>
                          { assign.name }
                        </div>
                      }
                      </PopoverContent>
                  </Popover>
                }
            </div>
            </div>
          </div>
        </div>
      ))}
      {/* <div className="rounded-[1vw] bg-black shadow-3xl dark:shadow-sm">
        <div className="space-y-4 p-3">
          <Link
            href="/task-detail"
            className="mt-0 block rounded-sm bg-gray-200 p-2.5 ring-1 ring-gray-300 dark:bg-black-dark dark:ring-gray-300/10"
          >
            <Image
              alt="blog-img"
              width={180}
              height={180}
              src="/images/blogcard-one.svg"
              className="mx-auto duration-300 hover:scale-105"
              style={{ color: 'transparent' }}
            />
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs/[10px] shrink-0 font-medium whitespace-nowrap transition text-black bg-danger-light">
            Marketing
          </div>

          <div className="space-y-1.5">
            <Link
              href="/task-detail"
              className="text-sm/tight font-semibold text-black duration-300 hover:text-primary text-white inline-flex"
            >
              The Impact of Bankruptcy
            </Link>
            <p className="line-clamp-2 text-xs/normal font-medium">
              Refund is the most popular payment gateways, which is the most convenient to use for you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-thumbs-up size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              120k
            </button>

            <button
              type="button"
              className="inline-flex items-end gap-1.5 text-xs/tight font-semibold transition hover:text-black dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users size-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              140k
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}