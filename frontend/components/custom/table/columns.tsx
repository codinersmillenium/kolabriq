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
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, MoveDown, MoveUp } from 'lucide-react'
import Image from 'next/image'

export type ITable = {
    id: string
    role: string
    fullName: string
    tags: string
}

export const columns: ColumnDef<ITable>[] = [
    {
        accessorKey: 'id',
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
        cell: ({ row }) => {
            return (
                <Badge className="bg-gray-400 text-black">
                    {row.getValue('id')}
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
        accessorKey: 'role',
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
        cell: ({ row }) => <div>{row.getValue('role')}</div>,
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
