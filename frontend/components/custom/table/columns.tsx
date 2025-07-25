'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initActor } from '@/lib/canisters'
import { Principal } from '@dfinity/principal'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, LucideStamp, MoreHorizontal, MoveDown, MoveUp } from 'lucide-react'
import Image from 'next/image'
import { useCallback } from 'react'

export type ITable = {
    key: object
    fullName: string
    tags: string
}

interface Props {
  data: ITable[];
  onDataRefresh: () => void;
}

const roleMap: any = {
  maintainer: { nextRole: 'developer', title: 'Set to developer', color: 'blue' },
  developer: { nextRole: 'maintainer', title: 'Set to maintainer', color: 'black' },
}

export const columns = (onDataRefresh?: () => void): ColumnDef<ITable>[] => {
    return [
        {
        accessorKey: 'key',
        header: () => { return <></>},
        cell: ({ row }: any) => {
            var row_ = row.getValue('key')
            if (row_.role === 'admin') return null
            
            const { nextRole, title, color } = roleMap[row_.role]
            const handleClick = useCallback(async () => {
                try {
                    const actor = await initActor()
                    const userId = Principal.fromText(row_.id)
                    await actor.assignRole(userId, { [nextRole]: null })

                    alert('Success Update Data....')
                    if (onDataRefresh) onDataRefresh()
                } catch (err) {
                    console.error(err)
                    alert('Failed to update role.')
                }
            }, [row_.id, nextRole])
            return (
                <Button
                    variant={'outline-general'}
                    title={title}
                    onClick={handleClick}
                >
                    <LucideStamp color={color}/>
                </Button>
            )
        },
    },
    {
        accessorKey: 'key',
        // accessorFn: (row) => row.id,
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    ID
                </button>
            )
        },
        cell: ({ row }: any) => {
            return (
                <Badge className="bg-gray-400 text-black">
                    {row.getValue('key').id}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'fullName',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Name
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('fullName')}</div>,
    },

    {
        accessorKey: 'key',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Role
                </button>
            )
        },
        cell: ({ row }: any) => <div>{row.getValue('key').role}</div>,
    },
    {
        accessorKey: 'tags',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && 'text-black!'}`}
                        />
                    </span>
                    Tags
                </button>
            )
        },
        cell: ({ row }) => {
            return (
                <Badge className="bg-gray-400 text-black">
                    {row.getValue('tags')}
                </Badge>
            )
        },
    },
    ]
}
